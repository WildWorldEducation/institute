/*------------------------------------------
--------------------------------------------
Middleware
--------------------------------------------
--------------------------------------------*/
const express = require('express');
// Router.
const router = express.Router();
const bodyParser = require('body-parser');
// NOTE: app.js mounts express.raw({ type: 'application/json' }) for
// /tokens/webhook BEFORE the global JSON parser. body-parser marks the request
// with req._body once the raw body is read, so this json() parser is a no-op on
// the webhook route and the raw Buffer survives for signature verification.
router.use(bodyParser.json());

const isAuthenticated = require('../middlewares/authMiddleware');
const rateLimit = require('../middlewares/rateLimitMiddleware');

const Stripe = require('stripe');
// Placeholder when unset so the app still boots in environments without Stripe
// configured; real checkout/webhook calls fail-closed without a valid key.
const stripe = Stripe(process.env.STRIPE_API_KEY || 'sk_test_unset_placeholder');

// DB
const conn = require('../config/db');
const util = require('util');
const query = util.promisify(conn.query).bind(conn);

/*------------------------------------------
--------------------------------------------
Helpers
--------------------------------------------
--------------------------------------------*/

// Map Stripe amount_total (cents) -> tokens for individual user purchases.
function userTokensForAmount(amountTotal) {
    if (amountTotal == 1000) return 200000;
    if (amountTotal == 2000) return 400000;
    if (amountTotal == 5000) return 1000000;
    return 0;
}

// Map Stripe amount_total (cents) -> tokens for tenant (school) purchases.
function tenantTokensForAmount(amountTotal) {
    if (amountTotal == 5000) return 1000000;
    if (amountTotal == 10000) return 2000000;
    if (amountTotal == 25000) return 5000000;
    return 0;
}

// MariaDB/MySQL duplicate primary-key error.
function isDuplicateKeyError(err) {
    return !!err && (err.code === 'ER_DUP_ENTRY' || err.errno === 1062);
}

/*------------------------------------------
--------------------------------------------
Routes
--------------------------------------------
--------------------------------------------*/

/*------------------------------------------
Individual users
--------------------------------------------*/
router.get('/get-receipts/:userId', isAuthenticated, async (req, res, next) => {
    // Ownership: only the receipt owner or a platform admin may read.
    if (
        req.session.userId !== req.params.userId &&
        req.session.role !== 'platform_admin'
    ) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    try {
        const result = await query(
            `SELECT url, date, amount FROM user_receipts WHERE user_id = ?;`,
            [req.params.userId]
        );
        res.json(result);
    } catch (err) {
        next(err);
    }
});

router.post(
    '/create-checkout-session',
    rateLimit({ windowMs: 60 * 1000, max: 10, keyPrefix: 'checkout' }),
    async (req, res) => {
        try {
            // Prefer the authenticated session identity over the request body.
            const buyerUserId = req.session.userId || req.body.userId;
            const numberOfTokens = req.body.numberOfTokens;
            let priceId = '';
            if (numberOfTokens == 200000) {
                priceId = process.env.STRIPE_200000_TOKENS_PRICE_ID;
            } else if (numberOfTokens == 400000) {
                priceId = process.env.STRIPE_400000_TOKENS_PRICE_ID;
            } else if (numberOfTokens == 1000000) {
                priceId = process.env.STRIPE_1000000_TOKENS_PRICE_ID;
            }

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                // Carry the buyer identity through Stripe so fulfillment does
                // not depend on server-side mutable state (fixes credit races).
                client_reference_id: buyerUserId
                    ? String(buyerUserId)
                    : undefined,
                line_items: [
                    {
                        price: priceId,
                        quantity: 1
                    }
                ],

                success_url: `${process.env.BASE_URL}/tokens/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.BASE_URL}/tokens/error`
            });

            res.json({ url: session.url });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
);

// Fulfillment is owned by POST /webhook. This route only redirects the buyer
// back to the completed page after Stripe redirects them here.
router.get('/success', async (req, res, next) => {
    res.redirect(`${process.env.BASE_URL}/tokens/completed`);
});

/*------------------------------------------
Tenants (Schools)
--------------------------------------------*/
router.get(
    '/tenant/get-receipts/:tenantId',
    isAuthenticated,
    async (req, res, next) => {
        // Ownership: platform admin, or a user whose tenant matches.
        if (
            req.session.role !== 'platform_admin' &&
            req.session.tenantId !== req.params.tenantId
        ) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        try {
            const result = await query(
                `SELECT url, date, amount FROM tenant_receipts WHERE tenant_id = ?;`,
                [req.params.tenantId]
            );
            res.json(result);
        } catch (err) {
            next(err);
        }
    }
);

router.post(
    '/tenant/create-checkout-session',
    rateLimit({ windowMs: 60 * 1000, max: 10, keyPrefix: 'tenant-checkout' }),
    async (req, res) => {
        try {
            // Prefer the authenticated session identity over the request body.
            const buyerTenantId = req.session.tenantId || req.body.tenantId;
            const numberOfTokens = req.body.numberOfTokens;
            let priceId = '';
            if (numberOfTokens == 1000000) {
                priceId = process.env.STRIPE_1000000_TOKENS_PRICE_ID;
            } else if (numberOfTokens == 2000000) {
                priceId = process.env.STRIPE_2000000_TOKENS_PRICE_ID;
            } else if (numberOfTokens == 5000000) {
                priceId = process.env.STRIPE_5000000_TOKENS_PRICE_ID;
            }

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                // Carry the tenant identity through Stripe metadata so
                // fulfillment does not depend on mutable server-side state.
                metadata: {
                    tenantId: buyerTenantId ? String(buyerTenantId) : ''
                },
                line_items: [
                    {
                        price: priceId,
                        quantity: 1
                    }
                ],

                success_url: `${process.env.BASE_URL}/tokens/tenant/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.BASE_URL}/tokens/tenant/error`
            });

            res.json({ url: session.url });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
);

// Fulfillment is owned by POST /webhook. This route only redirects the buyer
// back to the completed page after Stripe redirects them here.
router.get('/tenant/success', async (req, res, next) => {
    res.redirect(`${process.env.BASE_URL}/tokens/tenant/completed`);
});

/*------------------------------------------
Stripe webhook (authoritative fulfillment)
--------------------------------------------*/
// req.body is a raw Buffer here (see express.raw note above).
router.post('/webhook', async (req, res) => {
    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            req.headers['stripe-signature'],
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type !== 'checkout.session.completed') {
        // Acknowledge everything else so Stripe stops retrying.
        return res.status(200).json({ received: true });
    }

    const session = event.data.object;

    // Only fulfill fully-paid sessions.
    if (session.payment_status !== 'paid') {
        return res.status(200).json({ received: true });
    }

    try {
        const tenantId =
            session.metadata && session.metadata.tenantId
                ? session.metadata.tenantId
                : null;
        const buyerUserId = session.client_reference_id || null;

        // Pull the charge for the receipt PK + details.
        const paymentIntent = await stripe.paymentIntents.retrieve(
            session.payment_intent
        );
        const charge = await stripe.charges.retrieve(
            paymentIntent.latest_charge
        );
        const receipt_id = charge.id; // PK -> idempotency key
        const receipt_url = charge.receipt_url;
        const amount = charge.amount_captured;
        const created = new Date(charge.created * 1000);

        if (tenantId) {
            // Insert the receipt FIRST for idempotency.
            try {
                await query(
                    `INSERT INTO tenant_receipts (id, tenant_id, amount, url, date)
                     VALUES (?, ?, ?, ?, ?);`,
                    [receipt_id, tenantId, amount, receipt_url, created]
                );
            } catch (err) {
                if (isDuplicateKeyError(err)) {
                    // Already processed this charge — do not double-credit.
                    return res.status(200).json({ received: true });
                }
                throw err;
            }

            const amountOfTokens = tenantTokensForAmount(session.amount_total);
            await query(
                `UPDATE tenants SET tokens = tokens + ? WHERE id = ?;`,
                [amountOfTokens, tenantId]
            );
        } else if (buyerUserId) {
            // Insert the receipt FIRST for idempotency.
            try {
                await query(
                    `INSERT INTO user_receipts (id, user_id, amount, url, date)
                     VALUES (?, ?, ?, ?, ?);`,
                    [receipt_id, buyerUserId, amount, receipt_url, created]
                );
            } catch (err) {
                if (isDuplicateKeyError(err)) {
                    // Already processed this charge — do not double-credit.
                    return res.status(200).json({ received: true });
                }
                throw err;
            }

            const amountOfTokens = userTokensForAmount(session.amount_total);
            await query(
                `UPDATE users SET tokens = tokens + ? WHERE id = ?;`,
                [amountOfTokens, buyerUserId]
            );
        }

        return res.status(200).json({ received: true });
    } catch (err) {
        console.error('Stripe webhook fulfillment error:', err);
        // Non-2xx tells Stripe to retry later.
        return res.status(500).json({ error: 'fulfillment failed' });
    }
});

// Export the router for app to use.
module.exports = router;
