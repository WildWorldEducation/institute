/*------------------------------------------
--------------------------------------------
Middleware
--------------------------------------------
--------------------------------------------*/
const express = require('express');
// Router.
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_API_KEY);

// DB
const conn = require('../config/db');
const util = require('util');
const query = util.promisify(conn.query).bind(conn);

const isAuthenticated = require('../middlewares/authMiddleware');
// RFab bridge: mapped users' purchased tokens are credited to their RFab
// wallet (idempotent via the stripe-institute:<session_id> payment ref).
const rfabBridge = require('../services/rfabBridge');
const { getMapping, exchangeRate } = require('../services/identityBridge');

/*------------------------------------------
--------------------------------------------
Routes (hardened per RFAB_INSTITUTE_BRIDGE.md section 8)

- checkout sessions require session auth and identify the buyer via
  req.session (NEVER a client-posted id); client_reference_id carries the
  identity to the success callback.
- /success requires payment_status === 'paid' and is idempotent: the receipt
  row (unique stripe_session_id) is inserted FIRST - a duplicate means the
  session was already credited and no tokens move again. The old module-global
  userId/tenantId (one concurrent purchase could credit another user) is gone.
--------------------------------------------
--------------------------------------------*/

/*------------------------------------------
Individual users
--------------------------------------------*/
router.get('/get-receipts/:userId', isAuthenticated, async (req, res, next) => {
    try {
        // Receipts are private: self or platform admin only.
        if (
            req.params.userId !== req.session.userId &&
            req.session.role !== 'platform_admin'
        ) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const result = await query(
            `SELECT url, date, amount
             FROM user_receipts
             WHERE user_id = ?`,
            [req.params.userId]
        );
        res.json(result);
    } catch (err) {
        next(err);
    }
});

router.post('/create-checkout-session', isAuthenticated, async (req, res) => {
    try {
        // Buyer identity comes from the session (the posted userId is ignored).
        const userId = req.session.userId;
        const numberOfTokens = req.body.numberOfTokens;
        let priceId = '';
        if (numberOfTokens == 200000) {
            priceId = process.env.STRIPE_200000_TOKENS_PRICE_ID;
        } else if (numberOfTokens == 400000) {
            priceId = process.env.STRIPE_400000_TOKENS_PRICE_ID;
        } else if (numberOfTokens == 1000000) {
            priceId = process.env.STRIPE_1000000_TOKENS_PRICE_ID;
        }
        if (!priceId) {
            return res.status(400).json({ error: 'Unknown token package' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            client_reference_id: userId,
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
});

router.get('/success', async (req, res, next) => {
    try {
        if (!req.query.session_id) {
            return res.redirect(`${process.env.BASE_URL}/tokens/error`);
        }
        const session = await stripe.checkout.sessions.retrieve(
            req.query.session_id
        );

        // Only credit money Stripe says it collected.
        if (!session || session.payment_status !== 'paid') {
            return res.redirect(`${process.env.BASE_URL}/tokens/error`);
        }

        // Identity comes from the checkout session we created, never from
        // whoever happens to hit this URL.
        const userId = session.client_reference_id;
        if (!userId) {
            console.error(
                '/tokens/success: checkout session has no client_reference_id',
                session.id
            );
            return res.redirect(`${process.env.BASE_URL}/tokens/error`);
        }

        let amountOfTokens = 0;
        if (session.amount_total == 1000) {
            amountOfTokens = 200000;
        } else if (session.amount_total == 2000) {
            amountOfTokens = 400000;
        } else if (session.amount_total == 5000) {
            amountOfTokens = 1000000;
        }

        // Receipt data.
        const paymentIntent = await stripe.paymentIntents.retrieve(
            session.payment_intent
        );
        const charge = await stripe.charges.retrieve(
            paymentIntent.latest_charge
        );

        // Idempotency gate: insert the receipt FIRST. The unique
        // stripe_session_id makes a replayed/refreshed success URL a no-op.
        try {
            await query(
                `INSERT INTO user_receipts (id, user_id, amount, url, date, stripe_session_id)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    charge.id,
                    userId,
                    charge.amount_captured,
                    charge.receipt_url,
                    new Date(charge.created * 1000),
                    session.id
                ]
            );
        } catch (err) {
            if (err && err.code === 'ER_DUP_ENTRY') {
                // Already processed - success page, no second credit.
                return res.redirect(
                    `${process.env.BASE_URL}/tokens/completed`
                );
            }
            throw err;
        }

        // Credit the tokens: RFab wallet for bridge-mapped users, the local
        // column otherwise.
        let mapping = null;
        if (rfabBridge.bridgeEnabled()) {
            try {
                mapping = await getMapping(userId);
            } catch (err) {
                console.error('/tokens/success: mapping lookup failed', err);
            }
        }

        if (mapping) {
            const credit = await rfabBridge.credit({
                rfabUserId: mapping.rfab_user_id,
                amount: Math.floor(amountOfTokens * exchangeRate()),
                kind: 'institute_purchase',
                externalPaymentRef: `stripe-institute:${session.id}`,
                description: `Collins Institute token purchase (${amountOfTokens} tokens)`,
                metadata: { instituteUserId: userId, amountOfTokens }
            });
            if (!credit.ok) {
                // The user PAID but the wallet credit did not land. Roll the
                // receipt back so revisiting the success URL retries the
                // credit (the payment ref keeps RFab-side replays safe).
                console.error(
                    '/tokens/success: bridge credit failed for',
                    userId,
                    credit.error
                );
                await query(
                    'DELETE FROM user_receipts WHERE stripe_session_id = ?',
                    [session.id]
                );
                return res.redirect(`${process.env.BASE_URL}/tokens/error`);
            }
        } else {
            await query(
                'UPDATE users SET tokens = tokens + ? WHERE id = ?',
                [amountOfTokens, userId]
            );
        }

        res.redirect(`${process.env.BASE_URL}/tokens/completed`);
    } catch (err) {
        next(err);
    }
});

/*------------------------------------------
Tenants (Schools)

School token pools stay LOCAL (out of bridge scope v1); the flow gets the
same auth + paid-status + receipt-first idempotency hardening.
--------------------------------------------*/
router.get(
    '/tenant/get-receipts/:tenantId',
    isAuthenticated,
    async (req, res, next) => {
        try {
            // Own school or platform admin only.
            if (req.session.role !== 'platform_admin') {
                const rows = await query(
                    'SELECT tenant_id FROM users WHERE id = ?',
                    [req.session.userId]
                );
                const ownTenantId = rows.length ? rows[0].tenant_id : null;
                if (
                    !ownTenantId ||
                    String(ownTenantId) !== String(req.params.tenantId)
                ) {
                    return res.status(403).json({ message: 'Forbidden' });
                }
            }
            const result = await query(
                `SELECT url, date, amount
                 FROM tenant_receipts
                 WHERE tenant_id = ?`,
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
    isAuthenticated,
    async (req, res) => {
        try {
            // The buyer's school comes from their user row (the posted
            // tenantId is ignored).
            const rows = await query(
                'SELECT tenant_id FROM users WHERE id = ?',
                [req.session.userId]
            );
            const tenantId = rows.length ? rows[0].tenant_id : null;
            if (!tenantId) {
                return res
                    .status(403)
                    .json({ error: 'No school is linked to this account' });
            }

            const numberOfTokens = req.body.numberOfTokens;
            let priceId = '';
            if (numberOfTokens == 1000000) {
                priceId = process.env.STRIPE_1000000_TOKENS_PRICE_ID;
            } else if (numberOfTokens == 2000000) {
                priceId = process.env.STRIPE_2000000_TOKENS_PRICE_ID;
            } else if (numberOfTokens == 5000000) {
                priceId = process.env.STRIPE_5000000_TOKENS_PRICE_ID;
            }
            if (!priceId) {
                return res.status(400).json({ error: 'Unknown token package' });
            }

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                client_reference_id: String(tenantId),
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
    try {
        if (!req.query.session_id) {
            return res.redirect(`${process.env.BASE_URL}/tokens/tenant/error`);
        }
        const session = await stripe.checkout.sessions.retrieve(
            req.query.session_id
        );

        if (!session || session.payment_status !== 'paid') {
            return res.redirect(`${process.env.BASE_URL}/tokens/tenant/error`);
        }

        const tenantId = session.client_reference_id;
        if (!tenantId) {
            console.error(
                '/tokens/tenant/success: checkout session has no client_reference_id',
                session.id
            );
            return res.redirect(`${process.env.BASE_URL}/tokens/tenant/error`);
        }

        let amountOfTokens = 0;
        if (session.amount_total == 5000) {
            amountOfTokens = 1000000;
        } else if (session.amount_total == 10000) {
            amountOfTokens = 2000000;
        } else if (session.amount_total == 25000) {
            amountOfTokens = 5000000;
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(
            session.payment_intent
        );
        const charge = await stripe.charges.retrieve(
            paymentIntent.latest_charge
        );

        // Idempotency gate: receipt first (unique stripe_session_id).
        try {
            await query(
                `INSERT INTO tenant_receipts (id, tenant_id, amount, url, date, stripe_session_id)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    charge.id,
                    tenantId,
                    charge.amount_captured,
                    charge.receipt_url,
                    new Date(charge.created * 1000),
                    session.id
                ]
            );
        } catch (err) {
            if (err && err.code === 'ER_DUP_ENTRY') {
                return res.redirect(
                    `${process.env.BASE_URL}/tokens/tenant/completed`
                );
            }
            throw err;
        }

        // School pools stay local.
        await query('UPDATE tenants SET tokens = tokens + ? WHERE id = ?', [
            amountOfTokens,
            tenantId
        ]);

        res.redirect(`${process.env.BASE_URL}/tokens/tenant/completed`);
    } catch (err) {
        next(err);
    }
});

// Export the router for app to use.
module.exports = router;
