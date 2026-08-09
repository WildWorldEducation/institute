/**
 * Identity mapping between institute users and RFab users
 * (RFAB_INSTITUTE_BRIDGE.md sections 2-3).
 *
 * Linkage lives ONLY in the `rfab_identity_map` table
 * (migrations/2026-08-09-rfab-bridge.sql); institute user rows are never
 * re-keyed. Accounts attach to an EXISTING RFab account only via a VERIFIED
 * email (Google email_verified) or a correct RFab password - the institute's
 * historical emails are untrusted.
 *
 * Every entry point here is best-effort: with the bridge disabled or
 * unreachable, callers proceed with fully-local behavior. Mapping failures
 * must never block a login.
 */
const util = require('util');
const conn = require('../config/db');
const query = util.promisify(conn.query).bind(conn);
const bridge = require('./rfabBridge');

// Exchange rate: RFab tokens granted per institute token
// (DECISION PENDING per contract - defaults to 1:1).
function exchangeRate() {
    const rate = Number(process.env.RFAB_TOKENS_PER_INSTITUTE_TOKEN);
    return Number.isFinite(rate) && rate > 0 ? rate : 1;
}

/**
 * Fetch the mapping row for an institute user (null when unmapped).
 * @param {string} instituteUserId
 * @return {Promise<object|null>}
 */
async function getMapping(instituteUserId) {
    const rows = await query(
        'SELECT * FROM rfab_identity_map WHERE institute_user_id = ?',
        [instituteUserId]
    );
    return rows.length ? rows[0] : null;
}

/**
 * Insert a mapping row (no-op if the user is already mapped - first mapping
 * wins; concurrent logins race safely on the primary key).
 */
async function insertMapping(instituteUserId, rfabUserId, matchedVia) {
    await query(
        `INSERT INTO rfab_identity_map (institute_user_id, rfab_user_id, matched_via)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE institute_user_id = institute_user_id`,
        [instituteUserId, rfabUserId, matchedVia]
    );
}

/**
 * One-time migration grant: move the user's local `users.tokens` balance to
 * their RFab wallet, then zero the local balance. Idempotent on both sides
 * (map row's migrated_at locally; unique externalPaymentRef on RFab's side).
 *
 * Never called with school/tenant pools (those stay local, out of scope v1).
 *
 * @param {string} instituteUserId
 * @param {string} rfabUserId
 */
async function runMigrationGrant(instituteUserId, rfabUserId) {
    const mapping = await getMapping(instituteUserId);
    if (!mapping || mapping.migrated_at) return; // already migrated (or unmapped)

    const rows = await query('SELECT tokens FROM users WHERE id = ?', [
        instituteUserId
    ]);
    if (!rows.length) return;
    const localTokens = Number(rows[0].tokens) || 0;
    if (localTokens <= 0) {
        // Nothing to move; record that migration is settled so we stop checking.
        await query(
            `UPDATE rfab_identity_map
             SET migrated_tokens = 0, migrated_at = NOW()
             WHERE institute_user_id = ? AND migrated_at IS NULL`,
            [instituteUserId]
        );
        return;
    }

    const amount = Math.floor(localTokens * exchangeRate());
    const result = await bridge.credit({
        rfabUserId,
        amount,
        kind: 'institute_migration',
        externalPaymentRef: `institute-migration:${instituteUserId}`,
        description: `Collins Institute balance migration (${localTokens} institute tokens)`,
        metadata: { instituteUserId, instituteTokens: localTokens }
    });
    if (result.bridgeDisabled) return;
    if (!result.ok) {
        console.error(
            '[identityBridge] migration grant failed for institute user',
            instituteUserId,
            result.error
        );
        return; // retried on a later login; ref keeps it replay-safe
    }

    // Credit landed (or had already landed: alreadyProcessed) - zero the local
    // balance and record the migration.
    await query('UPDATE users SET tokens = 0 WHERE id = ?', [instituteUserId]);
    await query(
        `UPDATE rfab_identity_map
         SET migrated_tokens = ?, migrated_at = NOW()
         WHERE institute_user_id = ? AND migrated_at IS NULL`,
        [localTokens, instituteUserId]
    );
}

/**
 * Attach-or-create after a VERIFIED Google login/signup (section 2).
 * Call only with a payload whose email_verified === true.
 *
 * @param {string} instituteUserId
 * @param {{email:string, sub?:string, name?:string, picture?:string}} googlePayload
 */
async function ensureGoogleMapping(instituteUserId, googlePayload) {
    try {
        if (!bridge.bridgeEnabled()) return;

        const existing = await getMapping(instituteUserId);
        if (existing) {
            // Mapping exists - make sure the migration grant has settled.
            await runMigrationGrant(instituteUserId, existing.rfab_user_id);
            return;
        }

        const resolved = await bridge.resolveIdentity({
            email: googlePayload.email,
            emailVerified: true,
            googleSub: googlePayload.sub,
            name: googlePayload.name,
            picture: googlePayload.picture,
            allowCreate: true
        });
        if (resolved.bridgeDisabled || !resolved.ok) {
            if (!resolved.bridgeDisabled) {
                console.error(
                    '[identityBridge] resolveIdentity failed:',
                    resolved.error
                );
            }
            return;
        }

        await insertMapping(instituteUserId, resolved.rfabUserId, 'google');
        await runMigrationGrant(instituteUserId, resolved.rfabUserId);
    } catch (err) {
        // Mapping is best-effort - never block a login on it.
        console.error('[identityBridge] ensureGoogleMapping error:', err);
    }
}

/**
 * After a successful LOCAL password login by an unmapped user (section 3):
 * provision an RFab account with the same password (the plaintext is in hand
 * at login). 409 EMAIL_EXISTS => stay unmapped; attaching to an existing RFab
 * account requires a verified email (a Google login), because the institute's
 * historical emails are untrusted.
 *
 * @param {{id:string, email:string, firstName?:string, lastName?:string}} user
 * @param {string} password plaintext password that just passed bcrypt locally
 */
async function ensurePasswordMapping(user, password) {
    try {
        if (!bridge.bridgeEnabled()) return;
        if (!user.email) return;

        const existing = await getMapping(user.id);
        if (existing) {
            await runMigrationGrant(user.id, existing.rfab_user_id);
            return;
        }

        const name =
            [user.firstName, user.lastName].filter(Boolean).join(' ') ||
            undefined;
        const provisioned = await bridge.provisionPassword({
            email: user.email,
            password,
            name
        });
        if (provisioned.bridgeDisabled) return;
        if (!provisioned.ok) {
            // 409 EMAIL_EXISTS: MUST NOT map (see doc comment). Anything else:
            // best-effort, retried next login.
            if (provisioned.status !== 409) {
                console.error(
                    '[identityBridge] provisionPassword failed:',
                    provisioned.error
                );
            }
            return;
        }

        await insertMapping(user.id, provisioned.rfabUserId, 'password_provision');
        await runMigrationGrant(user.id, provisioned.rfabUserId);
    } catch (err) {
        console.error('[identityBridge] ensurePasswordMapping error:', err);
    }
}

/**
 * Map a freshly auto-provisioned local institute user to the RFab account
 * whose password just verified (section 3, "local user-not-found" path).
 * Migration grant N/A - the local user is new with 0 tokens.
 */
async function mapPasswordVerifiedUser(instituteUserId, rfabUserId) {
    try {
        await insertMapping(instituteUserId, rfabUserId, 'password_verify');
    } catch (err) {
        console.error('[identityBridge] mapPasswordVerifiedUser error:', err);
    }
}

module.exports = {
    getMapping,
    insertMapping,
    ensureGoogleMapping,
    ensurePasswordMapping,
    mapPasswordVerifiedUser,
    runMigrationGrant,
    exchangeRate
};
