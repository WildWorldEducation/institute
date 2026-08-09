/**
 * Server-side AI spend gating (RFAB_INSTITUTE_BRIDGE.md section 5).
 *
 * The billing context is derived SERVER-SIDE from the session user id:
 *   session userId -> users.tenant_id -> tenants.billing_mode
 *   settings.free_token_monthly_limit + user_monthly_token_usage from the DB
 * Client-supplied userId / limits / billingMode are ignored everywhere.
 *
 * Semantics (identical to the legacy client-side gate, now enforced):
 *  - Everyone spends the free monthly allowance first (locally recorded).
 *  - Past the allowance: school billing draws on tenants.tokens (stays local,
 *    out of bridge scope v1); student billing draws on the user's balance -
 *    the RFab wallet for bridge-mapped users, users.tokens otherwise.
 *  - Post-usage recording: mapped student-mode users record the allowance
 *    portion locally and debit only the over-allowance portion through the
 *    bridge; unmapped users and school billing keep the legacy
 *    CALL save_token_usage() path byte-for-byte.
 *  - Recording is best-effort and never blocks/aborts a delivered AI reply
 *    (legacy behavior); the pre-check is what stops out-of-balance calls.
 */
const util = require('util');
const conn = require('../config/db');
const query = util.promisify(conn.query).bind(conn);
const bridge = require('./rfabBridge');
const { getMapping } = require('./identityBridge');

const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

// The owners are exempt from limits (mirrors the long-standing frontend
// exemption in ShowSkill.vue/TokensView.vue so enforcing the gate
// server-side does not lock them out).
const EXEMPT_EMAILS = ['collinsmalcolm@gmail.com', 'simonehcollins@gmail.com'];
const EXEMPT_USERNAMES = ['malcolm', 'simonehcollins'];

function currentPeriod() {
    const d = new Date();
    return { year: d.getFullYear(), month: MONTH_NAMES[d.getMonth()] };
}

/**
 * Build the authoritative billing context for a session user.
 * Returns null for a missing/unknown user (treat as unauthenticated).
 *
 * @param {string} userId  req.session.userId (NEVER a client-supplied id)
 * @return {Promise<object|null>}
 */
async function getBillingContext(userId) {
    if (!userId) return null;
    const users = await query(
        'SELECT id, username, email, tenant_id, tokens FROM users WHERE id = ?',
        [userId]
    );
    if (!users.length) return null;
    const user = users[0];

    let billingMode = 'student';
    let tenantTokens = 0;
    if (user.tenant_id) {
        const tenants = await query(
            'SELECT billing_mode, tokens FROM tenants WHERE id = ?',
            [user.tenant_id]
        );
        if (tenants.length) {
            billingMode = tenants[0].billing_mode || 'student';
            tenantTokens = Number(tenants[0].tokens) || 0;
        }
    }

    const settingsRows = await query(
        'SELECT free_token_monthly_limit FROM settings LIMIT 1'
    );
    const freeLimit = settingsRows.length
        ? Number(settingsRows[0].free_token_monthly_limit) || 0
        : 0;

    const { year, month } = currentPeriod();
    const usageRows = await query(
        'SELECT token_count FROM user_monthly_token_usage WHERE user_id = ? AND year = ? AND month = ?',
        [userId, year, month]
    );
    const monthlyUsage = usageRows.length
        ? Number(usageRows[0].token_count) || 0
        : 0;

    // Bridge mapping (best-effort: a missing rfab_identity_map table or a DB
    // hiccup degrades to unmapped/local behavior).
    let mapping = null;
    if (bridge.bridgeEnabled()) {
        try {
            mapping = await getMapping(userId);
        } catch (err) {
            console.error('[spendGate] mapping lookup failed:', err.message);
        }
    }

    return {
        userId,
        tenantId: user.tenant_id || null,
        billingMode,
        freeLimit,
        monthlyUsage,
        localTokens: Number(user.tokens) || 0,
        tenantTokens,
        mapped: Boolean(mapping),
        rfabUserId: mapping ? mapping.rfab_user_id : null,
        year,
        month,
        exempt:
            EXEMPT_EMAILS.includes(user.email) ||
            EXEMPT_USERNAMES.includes(user.username)
    };
}

/**
 * Pre-check before an OpenAI call.
 * @param {object|null} ctx from getBillingContext
 * @return {Promise<{allowed: boolean, error?: string}>}
 */
async function precheck(ctx) {
    if (!ctx) return { allowed: false, error: 'UNAUTHENTICATED' };
    if (ctx.exempt) return { allowed: true };

    // Free monthly allowance still available.
    if (ctx.monthlyUsage < ctx.freeLimit) return { allowed: true };

    // Past the allowance: balance must be positive (legacy semantics:
    // a positive balance admits the call; the call itself may take the
    // balance negative - the recharge covers it).
    if (ctx.billingMode === 'school') {
        return ctx.tenantTokens > 0
            ? { allowed: true }
            : { allowed: false, error: 'INSUFFICIENT_TOKENS' };
    }

    if (ctx.mapped) {
        const result = await bridge.getBalance(ctx.rfabUserId);
        if (result.ok) {
            return Number(result.balance) > 0
                ? { allowed: true }
                : { allowed: false, error: 'INSUFFICIENT_TOKENS' };
        }
        // Bridge unavailable: fall through to the local balance, which is 0
        // after migration - fails closed for mapped users, stays fully local
        // when the bridge is simply not configured.
    }

    return ctx.localTokens > 0
        ? { allowed: true }
        : { allowed: false, error: 'INSUFFICIENT_TOKENS' };
}

/**
 * Legacy usage recording - the stored procedure records the month's usage
 * and settles local balances. Kept byte-identical for unmapped users and
 * school billing.
 */
async function legacySaveTokenUsage(userId, skillId, tokenCount, billingMode, tenantId) {
    const { year, month } = currentPeriod();
    // Using a stored procedure to reduce network calls from 4 to 1.
    await query('CALL save_token_usage(?, ?, ?, ?, ?, ?, ?)', [
        userId,
        tokenCount,
        skillId,
        year,
        month,
        billingMode,
        tenantId
    ]);
}

/** Add to this month's usage counter (mapped users bypass the legacy proc). */
async function addMonthlyUsage(userId, year, month, tokenCount) {
    const result = await query(
        `UPDATE user_monthly_token_usage
         SET token_count = token_count + ?
         WHERE user_id = ? AND year = ? AND month = ?`,
        [tokenCount, userId, year, month]
    );
    if (!result.affectedRows) {
        await query(
            `INSERT INTO user_monthly_token_usage (user_id, year, month, token_count)
             VALUES (?, ?, ?, ?)`,
            [userId, year, month, tokenCount]
        );
    }
}

/**
 * Record usage after an OpenAI call. Never throws; never blocks the reply.
 *
 * @param {object|null} ctx from getBillingContext (same request)
 * @param {{totalTokens:number, promptTokens?:number, responseTokens?:number,
 *          model?:string, skillId?:*, description?:string}} usage
 *        totalTokens is the legacy accounting unit (includes the TTS-equivalent
 *        markup); prompt/response are the raw OpenAI counts used for the
 *        bridge debit (RFab prices them with its own TOKEN_RATES).
 */
async function recordUsage(ctx, usage) {
    try {
        if (!ctx || !usage) return;
        const totalTokens = Math.ceil(Number(usage.totalTokens) || 0);
        if (totalTokens <= 0) return;

        // Legacy path: unmapped users and school billing pools stay local.
        if (!ctx.mapped || ctx.billingMode === 'school') {
            await legacySaveTokenUsage(
                ctx.userId,
                usage.skillId,
                totalTokens,
                ctx.billingMode,
                ctx.tenantId
            );
            ctx.monthlyUsage += totalTokens;
            return;
        }

        // Bridge-mapped student-mode user: the free allowance spends locally;
        // only the over-allowance portion goes through the wallet.
        const freeRemaining = Math.max(0, ctx.freeLimit - ctx.monthlyUsage);
        const overflow = Math.max(0, totalTokens - freeRemaining);

        await addMonthlyUsage(ctx.userId, ctx.year, ctx.month, totalTokens);
        ctx.monthlyUsage += totalTokens;

        if (overflow > 0) {
            // Debit the over-allowance fraction of the raw prompt/response
            // counts; RFab computes the actual charge from its TOKEN_RATES.
            const fraction = overflow / totalTokens;
            const promptTokens = Math.ceil(
                (Number(usage.promptTokens) || 0) * fraction
            );
            const responseTokens = Math.ceil(
                (Number(usage.responseTokens) || 0) * fraction
            );
            const result = await bridge.debit({
                rfabUserId: ctx.rfabUserId,
                promptTokens,
                responseTokens,
                model: usage.model || 'gpt-4.1',
                provider: 'openai',
                description:
                    usage.description ||
                    `Collins Institute AI usage (skill ${usage.skillId || 'n/a'})`
            });
            if (!result.ok && !result.bridgeDisabled) {
                // Post-hoc debit failure: the reply already streamed. Log
                // loudly; the pre-check keeps further calls gated.
                console.error(
                    '[spendGate] wallet debit failed for user',
                    ctx.userId,
                    result.error
                );
            }
        }
    } catch (err) {
        console.error('[spendGate] recordUsage error:', err);
    }
}

module.exports = {
    getBillingContext,
    precheck,
    recordUsage,
    legacySaveTokenUsage
};
