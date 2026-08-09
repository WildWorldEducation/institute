/*
 * Server-side token balance enforcement.
 *
 * Previously the token limit was only enforced in the Vue client, so a user
 * with a zero balance could call the API/socket directly and consume unlimited
 * paid model time. This module is the authoritative gate: it reads the limit
 * and usage from the DB (never from client-supplied req.body) and decides
 * whether an AI call is allowed.
 *
 * Enforcement mode is controlled by AI_BALANCE_ENFORCEMENT:
 *   'enforce' (default) -> insufficient balance blocks the call
 *   'log'               -> would-be-denials are logged only (safe rollout)
 *
 * On any unexpected DB/schema error the call is allowed and the error logged,
 * so a schema surprise degrades to prior behaviour rather than an outage.
 */
const conn = require('../config/db');
const util = require('util');
const query = util.promisify(conn.query).bind(conn);

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function enforcementMode() {
    return (process.env.AI_BALANCE_ENFORCEMENT || 'enforce').toLowerCase();
}

/**
 * Determine whether the given account may make an AI call right now.
 * @returns {Promise<{allowed: boolean, reason: string}>}
 */
async function checkBalance({ userId, tenantId, billingMode } = {}) {
    if (!userId && !tenantId) {
        return { allowed: false, reason: 'no-account' };
    }

    try {
        const now = new Date();
        const year = now.getFullYear();
        const month = MONTHS[now.getMonth()];

        // Free monthly allowance (single-row settings table).
        let freeLimit = 0;
        try {
            const settings = await query(
                'SELECT free_token_monthly_limit FROM settings LIMIT 1'
            );
            if (settings.length) freeLimit = Number(settings[0].free_token_monthly_limit) || 0;
        } catch (e) {
            console.error('[tokenBalance] settings read failed:', e.message);
        }

        // Tenant-paid billing: gate on the tenant's prepaid balance.
        if (billingMode && billingMode !== 'student' && tenantId) {
            const rows = await query(
                'SELECT tokens FROM tenants WHERE id = ?',
                [tenantId]
            );
            const tenantTokens = rows.length ? Number(rows[0].tokens) || 0 : 0;

            const usageRows = await query(
                `SELECT SUM(umtu.token_count) AS total
                 FROM user_monthly_token_usage umtu
                 JOIN users u ON u.id = umtu.user_id
                 WHERE u.tenant_id = ? AND umtu.year = ? AND umtu.month = ?`,
                [tenantId, year, month]
            );
            const tenantUsage = Number(usageRows[0]?.total) || 0;

            if (tenantTokens > 0 || tenantUsage < freeLimit) {
                return { allowed: true, reason: 'tenant-ok' };
            }
            return { allowed: false, reason: 'tenant-insufficient' };
        }

        // Student (self-pay) billing.
        const userRows = await query(
            'SELECT tokens FROM users WHERE id = ?',
            [userId]
        );
        const prepaid = userRows.length ? Number(userRows[0].tokens) || 0 : 0;

        const usageRows = await query(
            `SELECT token_count FROM user_monthly_token_usage
             WHERE user_id = ? AND year = ? AND month = ?`,
            [userId, year, month]
        );
        const usage = usageRows.length ? Number(usageRows[0].token_count) || 0 : 0;

        if (usage < freeLimit || prepaid > 0) {
            return { allowed: true, reason: 'user-ok' };
        }
        return { allowed: false, reason: 'user-insufficient' };
    } catch (err) {
        // Degrade to allow-with-log rather than take the app down on a schema surprise.
        console.error('[tokenBalance] check failed, allowing (fail-open):', err.message);
        return { allowed: true, reason: 'check-error' };
    }
}

/**
 * Convenience wrapper that applies the enforcement mode.
 * Returns true if the AI call should proceed.
 */
async function allowAICall(params) {
    const { allowed, reason } = await checkBalance(params);
    if (allowed) return true;

    if (enforcementMode() === 'log') {
        console.warn(
            `[tokenBalance] would-deny (log mode) user=${params.userId} tenant=${params.tenantId} reason=${reason}`
        );
        return true;
    }
    console.warn(
        `[tokenBalance] denied user=${params.userId} tenant=${params.tenantId} reason=${reason}`
    );
    return false;
}

module.exports = { checkBalance, allowAICall };
