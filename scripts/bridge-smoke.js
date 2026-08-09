/**
 * bridge-smoke.js - end-to-end smoke test for server/services/rfabBridge.js.
 *
 * Starts an in-process HTTP stub that implements the RFab institute-bridge
 * contract (RFAB_INSTITUTE_BRIDGE.md) in memory, points the client at it and
 * exercises every method, printing PASS/FAIL per check.
 *
 * No dependencies - plain node (>=18). Run:  node scripts/bridge-smoke.js
 */

const http = require('http');
const assert = require('assert');

const SECRET = 'smoke-secret';

// ---------------------------------------------------------------------------
// In-memory stub of the RFab side of the contract
// ---------------------------------------------------------------------------
const state = {
    users: new Map(), // rfabUserId -> { email, googleId, name, password, balance, emailVerified }
    creditRefs: new Map(), // externalPaymentRef -> { amount }
    requestLog: [],
    failNextNetworkOnce: new Set() // paths that should destroy the socket once
};

let nextId = 1;
function newUserId() {
    return `rfab-uuid-${nextId++}`;
}

function findByEmail(email) {
    const lc = String(email).toLowerCase();
    for (const [id, u] of state.users) {
        if (u.email === lc) return { id, ...u };
    }
    return null;
}

function findByGoogleSub(sub) {
    if (!sub) return null;
    for (const [id, u] of state.users) {
        if (u.googleId && u.googleId === sub) return { id, ...u };
    }
    return null;
}

const handlers = {
    '/identity/resolve': (body) => {
        if (body.emailVerified !== true) {
            return [400, { ok: false, error: 'EMAIL_NOT_VERIFIED' }];
        }
        let user = findByGoogleSub(body.googleSub) || findByEmail(body.email);
        let created = false;
        if (!user) {
            if (!body.allowCreate) {
                return [404, { ok: false, error: 'NOT_FOUND' }];
            }
            const id = newUserId();
            state.users.set(id, {
                email: String(body.email).toLowerCase(),
                googleId: body.googleSub || null,
                name: body.name || null,
                password: null,
                balance: 0
            });
            user = { id, ...state.users.get(id) };
            created = true;
        }
        return [
            200,
            {
                ok: true,
                rfabUserId: user.id,
                created,
                email: user.email,
                name: user.name
            }
        ];
    },

    '/identity/verify-password': (body) => {
        const user = findByEmail(body.email);
        if (!user || !user.password || user.password !== body.password) {
            return [401, { ok: false, error: 'INVALID_CREDENTIALS' }];
        }
        return [
            200,
            { ok: true, rfabUserId: user.id, email: user.email, name: user.name }
        ];
    },

    '/identity/provision-password': (body) => {
        if (findByEmail(body.email)) {
            return [409, { ok: false, error: 'EMAIL_EXISTS' }];
        }
        const id = newUserId();
        state.users.set(id, {
            email: String(body.email).toLowerCase(),
            googleId: null,
            name: body.name || null,
            password: body.password,
            balance: 0
        });
        return [200, { ok: true, rfabUserId: id, created: true }];
    },

    '/wallet/balance': (body) => {
        const user = state.users.get(body.rfabUserId);
        if (!user) return [404, { ok: false, error: 'USER_NOT_FOUND' }];
        return [200, { ok: true, balance: user.balance }];
    },

    '/wallet/debit': (body) => {
        const user = state.users.get(body.rfabUserId);
        if (!user) return [404, { ok: false, error: 'USER_NOT_FOUND' }];
        // Stub pricing: 1 rfab token per prompt+response token.
        const charge =
            Number(body.promptTokens || 0) + Number(body.responseTokens || 0);
        if (user.balance < charge) {
            return [
                402,
                {
                    ok: false,
                    error: 'INSUFFICIENT_TOKENS',
                    balance: user.balance
                }
            ];
        }
        user.balance -= charge;
        return [200, { ok: true, tokensCharged: charge, newBalance: user.balance }];
    },

    '/wallet/credit': (body) => {
        const user = state.users.get(body.rfabUserId);
        if (!user) return [404, { ok: false, error: 'USER_NOT_FOUND' }];
        if (
            !Number.isInteger(body.amount) ||
            body.amount <= 0 ||
            !['institute_migration', 'institute_purchase'].includes(body.kind) ||
            !/^(institute-migration:|stripe-institute:)/.test(
                String(body.externalPaymentRef)
            )
        ) {
            return [400, { ok: false, error: 'INVALID_CREDIT' }];
        }
        if (state.creditRefs.has(body.externalPaymentRef)) {
            return [
                200,
                {
                    ok: true,
                    newBalance: user.balance,
                    tokensAdded: 0,
                    alreadyProcessed: true
                }
            ];
        }
        state.creditRefs.set(body.externalPaymentRef, { amount: body.amount });
        user.balance += body.amount;
        return [
            200,
            {
                ok: true,
                newBalance: user.balance,
                tokensAdded: body.amount,
                alreadyProcessed: false
            }
        ];
    }
};

const server = http.createServer((req, res) => {
    const path = req.url.replace(/^\/api\/institute-bridge/, '');

    // Simulated transport failure (for retry tests).
    if (state.failNextNetworkOnce.has(path)) {
        state.failNextNetworkOnce.delete(path);
        req.socket.destroy();
        return;
    }

    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
        const send = (code, obj) => {
            res.writeHead(code, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(obj));
        };

        if (req.headers['x-bridge-secret'] === undefined) {
            return send(401, { error: 'BRIDGE_AUTH_REQUIRED' });
        }
        if (req.headers['x-bridge-secret'] !== SECRET) {
            return send(401, { error: 'BRIDGE_AUTH_FAILED' });
        }
        if (req.method !== 'POST' || !handlers[path]) {
            return send(404, { error: 'NOT_FOUND' });
        }
        let body = {};
        try {
            body = raw ? JSON.parse(raw) : {};
        } catch (e) {
            return send(400, { error: 'BAD_JSON' });
        }
        state.requestLog.push({ path, body });
        const [code, obj] = handlers[path](body);
        send(code, obj);
    });
});

// ---------------------------------------------------------------------------
// Test harness
// ---------------------------------------------------------------------------
let passCount = 0;
let failCount = 0;

function check(name, fn) {
    try {
        fn();
        passCount++;
        console.log(`PASS  ${name}`);
    } catch (err) {
        failCount++;
        console.log(`FAIL  ${name}`);
        console.log(`      ${err.message}`);
    }
}

async function main() {
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;

    // --- bridgeDisabled degradation (no secret configured) ---
    delete process.env.RFAB_BRIDGE_SECRET;
    process.env.RFAB_BRIDGE_URL = `http://127.0.0.1:${port}`;
    const bridge = require('../server/services/rfabBridge');

    const disabled = await bridge.getBalance('whatever');
    check('bridge disabled without secret -> { bridgeDisabled: true }', () => {
        assert.strictEqual(disabled.bridgeDisabled, true);
        assert.strictEqual(bridge.bridgeEnabled(), false);
    });
    const disabledAll = await Promise.all([
        bridge.resolveIdentity({ email: 'x@y.z', emailVerified: true, allowCreate: true }),
        bridge.verifyPassword({ email: 'x@y.z', password: 'p' }),
        bridge.provisionPassword({ email: 'x@y.z', password: 'p' }),
        bridge.debit({ rfabUserId: 'u', promptTokens: 1, responseTokens: 1, model: 'm' }),
        bridge.credit({ rfabUserId: 'u', amount: 1, kind: 'institute_migration', externalPaymentRef: 'institute-migration:u', description: 'd' })
    ]);
    check('all six methods report bridgeDisabled without secret', () => {
        for (const r of disabledAll) assert.strictEqual(r.bridgeDisabled, true);
        assert.strictEqual(state.requestLog.length, 0);
    });

    // --- enable the bridge ---
    process.env.RFAB_BRIDGE_SECRET = SECRET;
    check('bridgeEnabled() true once secret set', () =>
        assert.strictEqual(bridge.bridgeEnabled(), true)
    );

    // --- resolveIdentity: create, then attach (idempotent lookup) ---
    const resolved = await bridge.resolveIdentity({
        email: 'Student@Example.com',
        emailVerified: true,
        googleSub: 'google-sub-1',
        name: 'Student One',
        allowCreate: true
    });
    check('resolveIdentity creates an RFab user', () => {
        assert.strictEqual(resolved.ok, true);
        assert.strictEqual(resolved.created, true);
        assert.ok(resolved.rfabUserId);
    });
    const resolvedAgain = await bridge.resolveIdentity({
        email: 'student@example.com',
        emailVerified: true,
        googleSub: 'google-sub-1',
        allowCreate: true
    });
    check('resolveIdentity finds the same user on replay', () => {
        assert.strictEqual(resolvedAgain.ok, true);
        assert.strictEqual(resolvedAgain.created, false);
        assert.strictEqual(resolvedAgain.rfabUserId, resolved.rfabUserId);
    });
    const rfabUserId = resolved.rfabUserId;

    // --- provisionPassword: new email ok, existing email 409 ---
    const provisioned = await bridge.provisionPassword({
        email: 'pwuser@example.com',
        password: 'hunter2',
        name: 'PW User'
    });
    check('provisionPassword creates for unregistered email', () => {
        assert.strictEqual(provisioned.ok, true);
        assert.strictEqual(provisioned.created, true);
    });
    const conflict = await bridge.provisionPassword({
        email: 'student@example.com',
        password: 'whatever'
    });
    check('provisionPassword 409 EMAIL_EXISTS for registered email', () => {
        assert.strictEqual(conflict.ok, false);
        assert.strictEqual(conflict.status, 409);
        assert.strictEqual(conflict.error, 'EMAIL_EXISTS');
    });

    // --- verifyPassword ---
    const goodPw = await bridge.verifyPassword({
        email: 'pwuser@example.com',
        password: 'hunter2'
    });
    check('verifyPassword accepts the right password', () => {
        assert.strictEqual(goodPw.ok, true);
        assert.strictEqual(goodPw.rfabUserId, provisioned.rfabUserId);
    });
    const badPw = await bridge.verifyPassword({
        email: 'pwuser@example.com',
        password: 'wrong'
    });
    check('verifyPassword rejects with 401 INVALID_CREDENTIALS', () => {
        assert.strictEqual(badPw.ok, false);
        assert.strictEqual(badPw.status, 401);
        assert.strictEqual(badPw.error, 'INVALID_CREDENTIALS');
    });

    // --- credit: migration grant + idempotent replay ---
    const ref = 'institute-migration:institute-user-1';
    const credit1 = await bridge.credit({
        rfabUserId,
        amount: 5000,
        kind: 'institute_migration',
        externalPaymentRef: ref,
        description: 'migration grant'
    });
    check('credit applies a migration grant', () => {
        assert.strictEqual(credit1.ok, true);
        assert.strictEqual(credit1.tokensAdded, 5000);
        assert.strictEqual(credit1.newBalance, 5000);
        assert.strictEqual(credit1.alreadyProcessed, false);
    });
    const credit2 = await bridge.credit({
        rfabUserId,
        amount: 5000,
        kind: 'institute_migration',
        externalPaymentRef: ref,
        description: 'migration grant (replay)'
    });
    check('credit replay is a success no-op (alreadyProcessed)', () => {
        assert.strictEqual(credit2.ok, true);
        assert.strictEqual(credit2.alreadyProcessed, true);
        assert.strictEqual(credit2.newBalance, 5000);
    });
    const badRef = await bridge.credit({
        rfabUserId,
        amount: 10,
        kind: 'institute_purchase',
        externalPaymentRef: 'evil-arbitrary-ref',
        description: 'nope'
    });
    check('credit with a non-allowlisted ref prefix is rejected', () => {
        assert.strictEqual(badRef.ok, false);
        assert.strictEqual(badRef.status, 400);
    });

    // --- balance ---
    const balance = await bridge.getBalance(rfabUserId);
    check('getBalance returns the wallet balance', () => {
        assert.strictEqual(balance.ok, true);
        assert.strictEqual(balance.balance, 5000);
    });

    // --- debit: success then 402 ---
    const debit1 = await bridge.debit({
        rfabUserId,
        promptTokens: 3000,
        responseTokens: 1000,
        model: 'gpt-4.1',
        description: 'ai tutor turn'
    });
    check('debit charges and returns newBalance', () => {
        assert.strictEqual(debit1.ok, true);
        assert.strictEqual(debit1.tokensCharged, 4000);
        assert.strictEqual(debit1.newBalance, 1000);
    });
    const debit2 = await bridge.debit({
        rfabUserId,
        promptTokens: 5000,
        responseTokens: 0,
        model: 'gpt-4.1'
    });
    check('debit over balance -> 402 INSUFFICIENT_TOKENS with balance', () => {
        assert.strictEqual(debit2.ok, false);
        assert.strictEqual(debit2.status, 402);
        assert.strictEqual(debit2.error, 'INSUFFICIENT_TOKENS');
        assert.strictEqual(debit2.balance, 1000);
    });

    // --- retry policy ---
    state.failNextNetworkOnce.add('/wallet/balance');
    const retriedBalance = await bridge.getBalance(rfabUserId);
    check('getBalance retries once after a network failure', () => {
        assert.strictEqual(retriedBalance.ok, true);
        assert.strictEqual(retriedBalance.balance, 1000);
    });

    state.failNextNetworkOnce.add('/wallet/credit');
    const retriedCredit = await bridge.credit({
        rfabUserId,
        amount: 200,
        kind: 'institute_purchase',
        externalPaymentRef: 'stripe-institute:cs_test_retry',
        description: 'retry test'
    });
    check('credit retries once after a network failure', () => {
        assert.strictEqual(retriedCredit.ok, true);
        assert.strictEqual(retriedCredit.tokensAdded, 200);
    });

    const debitCountBefore = state.requestLog.filter(
        (r) => r.path === '/wallet/debit'
    ).length;
    state.failNextNetworkOnce.add('/wallet/debit');
    const failedDebit = await bridge.debit({
        rfabUserId,
        promptTokens: 1,
        responseTokens: 1,
        model: 'gpt-4.1'
    });
    const debitCountAfter = state.requestLog.filter(
        (r) => r.path === '/wallet/debit'
    ).length;
    check('debit NEVER retries: network failure surfaces as NETWORK_ERROR', () => {
        assert.strictEqual(failedDebit.ok, false);
        assert.strictEqual(failedDebit.network, true);
        assert.strictEqual(failedDebit.error, 'NETWORK_ERROR');
        assert.strictEqual(debitCountAfter, debitCountBefore); // request died on the wire, no replay
    });

    // --- auth header handling by the stub (sanity of the stub itself) ---
    const rawResp = await fetch(
        `http://127.0.0.1:${port}/api/institute-bridge/wallet/balance`,
        { method: 'POST', body: '{}', headers: { 'Content-Type': 'application/json' } }
    );
    const rawJson = await rawResp.json();
    check('stub demands the bridge secret (401 BRIDGE_AUTH_REQUIRED)', () => {
        assert.strictEqual(rawResp.status, 401);
        assert.strictEqual(rawJson.error, 'BRIDGE_AUTH_REQUIRED');
    });

    server.close();
    console.log(`\n${passCount} passed, ${failCount} failed`);
    process.exit(failCount ? 1 : 0);
}

main().catch((err) => {
    console.error('smoke script crashed:', err);
    process.exit(1);
});
