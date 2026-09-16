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

// Stripe client + the one idempotent crediting path (webhook, return page and
// reconciler all go through fulfillSession).
const {
    stripe,
    fulfillSession,
    isOurTokenSession
} = require('../services/tokenFulfillment');

// DB
const conn = require('../config/db');
const util = require('util');
const query = util.promisify(conn.query).bind(conn);

/*------------------------------------------
--------------------------------------------
Helpers
--------------------------------------------
--------------------------------------------*/

// Credit the session the buyer just returned from. Never blocks the redirect:
// the reconciler retries anything that fails here.
async function fulfillFromReturn(sessionId) {
    if (typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) return;
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (isOurTokenSession(session)) await fulfillSession(session);
    } catch (err) {
        console.error('[tokens] fulfill on return failed:', err.message);
    }
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

// Credit on return as well as by webhook/reconciler (all idempotent), so a buyer
// sees their tokens immediately even if the webhook is missing or late.
router.get('/success', async (req, res, next) => {
    await fulfillFromReturn(req.query.session_id);
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

router.get('/tenant/success', async (req, res, next) => {
    await fulfillFromReturn(req.query.session_id);
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

    // The Stripe account is shared with RFab; ignore sessions this site did not create.
    if (!isOurTokenSession(session)) {
        return res.status(200).json({ received: true });
    }

    try {
        await fulfillSession(session);
        return res.status(200).json({ received: true });
    } catch (err) {
        console.error('Stripe webhook fulfillment error:', err);
        // Non-2xx tells Stripe to retry later.
        return res.status(500).json({ error: 'fulfillment failed' });
    }
});

// Export the router for app to use.
module.exports = router;
