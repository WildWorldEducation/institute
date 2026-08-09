/**
 * RFab <-> Collins Institute bridge - HTTP client (institute side).
 *
 * Contract: .windsurf/Reality Fabricator/DOCS/RFAB_INSTITUTE_BRIDGE.md (v1, 2026-08-09).
 * RFab is the system of record for identity and token balances; the institute
 * resolves identity and money through this server-to-server API.
 *
 * Configuration (env):
 *   RFAB_BRIDGE_URL     base URL, default https://api.rfab.ai
 *   RFAB_BRIDGE_SECRET  shared secret sent as `x-bridge-secret`
 *
 * Degradation contract (CRITICAL): if RFAB_BRIDGE_SECRET is unset, every
 * method returns `{ bridgeDisabled: true }` synchronously-resolved, and the
 * app must behave exactly as it did before the bridge existed (fully local
 * identity + local token balances).
 *
 * Error contract: methods never throw. They resolve to one of
 *   { bridgeDisabled: true }
 *   { ok: true, ...payload }                          2xx
 *   { ok: false, status, error, ...body }             non-2xx (body merged in)
 *   { ok: false, network: true, error: 'NETWORK_ERROR', detail }  transport
 *
 * Retry policy: a single retry on NETWORK errors only, and only for
 * idempotent calls (getBalance, credit - credit is idempotent on RFab's side
 * via the unique externalPaymentRef). NEVER for debit (a lost response must
 * not turn into a double charge).
 */

// dotenv is loaded by the app entry point; the guarded require keeps this
// module usable in bare environments (smoke tests) with env vars set directly.
try {
    require('dotenv').config();
} catch (e) {
    /* optional */
}

const API_PREFIX = '/api/institute-bridge';
const TIMEOUT_MS = 5000;

// Read env lazily so tests can set configuration after require().
function baseUrl() {
    return (process.env.RFAB_BRIDGE_URL || 'https://api.rfab.ai').replace(
        /\/+$/,
        ''
    );
}

function secret() {
    return process.env.RFAB_BRIDGE_SECRET || '';
}

function bridgeEnabled() {
    return Boolean(secret());
}

/**
 * Low-level POST. Returns the error-contract objects documented above.
 * @param {string} path   path under /api/institute-bridge
 * @param {object} body   JSON body
 */
async function post(path, body) {
    const url = `${baseUrl()}${API_PREFIX}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-bridge-secret': secret()
            },
            body: JSON.stringify(body || {}),
            signal: controller.signal
        });

        let json = {};
        try {
            json = await response.json();
        } catch (e) {
            json = {};
        }

        if (response.ok) {
            // Endpoints already answer { ok: true, ... }; make it explicit.
            return { ok: true, ...json };
        }
        return {
            ok: false,
            status: response.status,
            error: json.error || `HTTP_${response.status}`,
            ...json
        };
    } catch (err) {
        // Abort (timeout) and fetch/socket failures both land here.
        return {
            ok: false,
            network: true,
            error: 'NETWORK_ERROR',
            detail: err && err.name === 'AbortError' ? 'TIMEOUT' : String(err && err.message)
        };
    } finally {
        clearTimeout(timer);
    }
}

/**
 * POST with a single retry on network error. Only for idempotent calls.
 */
async function postWithRetry(path, body) {
    const first = await post(path, body);
    if (first.ok || !first.network) return first;
    return post(path, body);
}

/**
 * Attach-or-create by VERIFIED identity. Call ONLY after verifying a Google
 * ID token with email_verified === true.
 * @param {{email:string, emailVerified:true, googleSub?:string, name?:string,
 *          picture?:string, allowCreate:boolean}} params
 * @return {Promise<object>} { ok, rfabUserId, created, email, name } | error
 */
async function resolveIdentity(params) {
    if (!bridgeEnabled()) return { bridgeDisabled: true };
    return post('/identity/resolve', params);
}

/**
 * "RFab user logs into the institute with the same password."
 * @return {Promise<object>} { ok, rfabUserId, email, name } |
 *         { ok:false, status:401, error:'INVALID_CREDENTIALS' } | error
 */
async function verifyPassword({ email, password }) {
    if (!bridgeEnabled()) return { bridgeDisabled: true };
    // Password oracle: never retried, never logged.
    return post('/identity/verify-password', { email, password });
}

/**
 * "Institute password user gets an RFab account with the same password."
 * Creates ONLY if the email is unregistered on RFab.
 * @return {Promise<object>} { ok, rfabUserId, created:true } |
 *         { ok:false, status:409, error:'EMAIL_EXISTS' } | error
 */
async function provisionPassword({ email, password, name }) {
    if (!bridgeEnabled()) return { bridgeDisabled: true };
    return post('/identity/provision-password', { email, password, name });
}

/**
 * Read the RFab wallet balance.
 * @return {Promise<object>} { ok, balance } | error
 */
async function getBalance(rfabUserId) {
    if (!bridgeEnabled()) return { bridgeDisabled: true };
    return postWithRetry('/wallet/balance', { rfabUserId });
}

/**
 * Charge the RFab wallet for provider usage. RFab computes the charge from
 * its own TOKEN_RATES. Fail-closed; NEVER retried.
 * @param {{rfabUserId:string, promptTokens:number, responseTokens:number,
 *          model:string, provider:'openai', sessionId?:string,
 *          description?:string}} params
 * @return {Promise<object>} { ok, tokensCharged, newBalance } |
 *         { ok:false, status:402, error:'INSUFFICIENT_TOKENS', balance } | error
 */
async function debit(params) {
    if (!bridgeEnabled()) return { bridgeDisabled: true };
    return post('/wallet/debit', { provider: 'openai', ...params });
}

/**
 * Credit the RFab wallet. Idempotent via externalPaymentRef (replays answer
 * alreadyProcessed: true and are SUCCESS). Retried once on network error.
 * @param {{rfabUserId:string, amount:number,
 *          kind:'institute_migration'|'institute_purchase',
 *          externalPaymentRef:string, description:string, metadata?:object}} params
 * @return {Promise<object>} { ok, newBalance, tokensAdded, alreadyProcessed } | error
 */
async function credit(params) {
    if (!bridgeEnabled()) return { bridgeDisabled: true };
    return postWithRetry('/wallet/credit', params);
}

module.exports = {
    bridgeEnabled,
    resolveIdentity,
    verifyPassword,
    provisionPassword,
    getBalance,
    debit,
    credit
};
