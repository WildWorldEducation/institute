/*
 * Token purchase fulfillment — one idempotent path shared by every trigger.
 *
 * Why this exists (Sep 16 2026): the Aug 9 2026 hardening made POST /tokens/webhook
 * the only thing that credits a purchase, but no Stripe webhook endpoint was ever
 * registered for it, so every token purchase since then was charged and never
 * credited. Crediting must not hinge on one piece of Stripe dashboard config, so a
 * paid session is now fulfilled by whichever of these sees it first:
 *   1. the Stripe webhook (if an endpoint is configured),
 *   2. GET /tokens/success when the buyer lands back on the site,
 *   3. the reconciler, which re-reads recent paid sessions from Stripe on boot and
 *      every few minutes.
 * The receipt row (PK = Stripe charge id) is inserted before tokens are added, so a
 * session can only ever be credited once no matter how many triggers fire.
 *
 * It also applies one-off token grants (support credits/bonuses) listed in
 * server/ops/token-grants.json, once each, so a credit ships as a commit + deploy
 * instead of someone hand-editing the prod database.
 */
const Stripe = require('stripe');
const conn = require('../config/db');
const util = require('util');
const query = util.promisify(conn.query).bind(conn);

const stripe = Stripe(process.env.STRIPE_API_KEY || 'sk_test_unset_placeholder');

const RECONCILE_EVERY_MS = 3 * 60 * 1000;
const RECONCILE_LOOKBACK_DAYS = 3;
// First boot after the fix sweeps back to the Aug 9 2026 hardening deploy, which is
// when the success page stopped crediting. Older sessions were credited by the old
// success route and carry no buyer id, so they are never touched here.
const HARDENING_EPOCH = Math.floor(Date.UTC(2026, 7, 9) / 1000);

function userTokensForAmount(amountTotal) {
    if (amountTotal == 1000) return 200000;
    if (amountTotal == 2000) return 400000;
    if (amountTotal == 5000) return 1000000;
    return 0;
}

function tenantTokensForAmount(amountTotal) {
    if (amountTotal == 5000) return 1000000;
    if (amountTotal == 10000) return 2000000;
    if (amountTotal == 25000) return 5000000;
    return 0;
}

function isDuplicateKeyError(err) {
    return !!err && (err.code === 'ER_DUP_ENTRY' || err.errno === 1062);
}

// Only sessions created by this site's own checkout routes. The Stripe account is
// shared with RFab, so anything else in it is not ours to credit.
function isOurTokenSession(session) {
    const base = process.env.BASE_URL;
    return (
        !!base &&
        typeof session.success_url === 'string' &&
        session.success_url.startsWith(`${base}/tokens/`)
    );
}

/**
 * Credit a completed Checkout Session. Safe to call any number of times.
 * Returns 'credited' | 'already' | 'skipped:<reason>'.
 */
async function fulfillSession(session) {
    if (session.payment_status !== 'paid') return 'skipped:unpaid';

    const tenantId =
        session.metadata && session.metadata.tenantId
            ? session.metadata.tenantId
            : null;
    const buyerUserId = session.client_reference_id || null;
    if (!tenantId && !buyerUserId) return 'skipped:no-buyer';

    const paymentIntent = await stripe.paymentIntents.retrieve(
        session.payment_intent
    );
    const charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
    if (charge.refunded) return 'skipped:refunded';

    const receiptTable = tenantId ? 'tenant_receipts' : 'user_receipts';
    const ownerColumn = tenantId ? 'tenant_id' : 'user_id';
    const ownerId = tenantId || buyerUserId;
    const amountOfTokens = tenantId
        ? tenantTokensForAmount(session.amount_total)
        : userTokensForAmount(session.amount_total);
    if (!amountOfTokens) return 'skipped:unknown-amount';

    // Insert the receipt FIRST for idempotency.
    try {
        await query(
            `INSERT INTO ${receiptTable} (id, ${ownerColumn}, amount, url, date)
             VALUES (?, ?, ?, ?, ?);`,
            [
                charge.id,
                ownerId,
                charge.amount_captured,
                charge.receipt_url,
                new Date(charge.created * 1000)
            ]
        );
    } catch (err) {
        if (isDuplicateKeyError(err)) return 'already';
        throw err;
    }

    const result = await query(
        `UPDATE ${tenantId ? 'tenants' : 'users'} SET tokens = tokens + ? WHERE id = ?;`,
        [amountOfTokens, ownerId]
    );
    if (!result.affectedRows) {
        // No such account: undo the receipt so a later run can retry, and shout.
        await query(`DELETE FROM ${receiptTable} WHERE id = ?;`, [charge.id]);
        console.error(
            `[tokens] paid session ${session.id} names ${ownerColumn}=${ownerId} which does not exist`
        );
        return 'skipped:no-account';
    }
    console.warn(
        `[tokens] credited ${amountOfTokens} tokens to ${ownerColumn}=${ownerId} for ${session.id}`
    );
    return 'credited';
}

let lastReconcileAt = null;

async function reconcileRecentPurchases() {
    const gte = lastReconcileAt
        ? Math.floor(Date.now() / 1000) - RECONCILE_LOOKBACK_DAYS * 86400
        : HARDENING_EPOCH;
    const counts = {};
    for await (const session of stripe.checkout.sessions.list({
        created: { gte },
        limit: 100
    })) {
        if (!isOurTokenSession(session) || session.payment_status !== 'paid') {
            continue;
        }
        try {
            const outcome = await fulfillSession(session);
            counts[outcome] = (counts[outcome] || 0) + 1;
        } catch (err) {
            counts.error = (counts.error || 0) + 1;
            console.error(`[tokens] reconcile failed for ${session.id}:`, err.message);
        }
    }
    lastReconcileAt = Date.now();
    if (counts.credited || counts.error || counts['skipped:no-account']) {
        console.warn('[tokens] reconcile:', JSON.stringify(counts));
    }
    return counts;
}

async function applyTokenGrants() {
    let grants;
    try {
        grants = require('../ops/token-grants.json');
    } catch (err) {
        return;
    }
    await query(
        `CREATE TABLE IF NOT EXISTS token_grants (
            id VARCHAR(128) PRIMARY KEY,
            user_id VARCHAR(64) NOT NULL,
            tokens INT NOT NULL,
            reason TEXT,
            applied_at DATETIME NOT NULL
        );`
    );
    for (const grant of grants) {
        if (!grant.id || !grant.userId || !(grant.tokens > 0)) continue;
        try {
            await query(
                `INSERT INTO token_grants (id, user_id, tokens, reason, applied_at)
                 VALUES (?, ?, ?, ?, ?);`,
                [grant.id, grant.userId, grant.tokens, grant.reason || '', new Date()]
            );
        } catch (err) {
            if (isDuplicateKeyError(err)) continue; // already applied
            console.error(`[tokens] grant ${grant.id} failed:`, err.message);
            continue;
        }
        const result = await query(
            `UPDATE users SET tokens = tokens + ? WHERE id = ?;`,
            [grant.tokens, grant.userId]
        );
        if (!result.affectedRows) {
            await query(`DELETE FROM token_grants WHERE id = ?;`, [grant.id]);
            console.error(`[tokens] grant ${grant.id}: no user ${grant.userId}`);
            continue;
        }
        console.warn(
            `[tokens] grant ${grant.id}: +${grant.tokens} tokens to user ${grant.userId}`
        );
    }
}

function startTokenFulfillment() {
    if (!process.env.STRIPE_API_KEY || !process.env.BASE_URL) {
        console.warn('[tokens] STRIPE_API_KEY or BASE_URL unset; reconciler not started');
        return;
    }
    const run = () =>
        reconcileRecentPurchases().catch((err) =>
            console.error('[tokens] reconcile error:', err.message)
        );
    applyTokenGrants()
        .catch((err) => console.error('[tokens] grants error:', err.message))
        .then(run);
    setInterval(run, RECONCILE_EVERY_MS).unref();
}

module.exports = {
    stripe,
    fulfillSession,
    isOurTokenSession,
    reconcileRecentPurchases,
    applyTokenGrants,
    startTokenFulfillment
};
