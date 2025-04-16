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

/*------------------------------------------
--------------------------------------------
Routes
--------------------------------------------
--------------------------------------------*/
let userId;
router.post('/create-checkout-session', async (req, res) => {
    try {
        userId = req.body.userId;
        let priceId = '';
        if (req.body.planType == 'capped') {
            priceId = process.env.CAPPED_PLAN_PRICE_ID;
        } else {
            priceId = process.env.INFINITE_PLAN_PRICE_ID;
        }
        // console.log(req.body);
        // console.log(req.body.priceId);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [
                {
                    price: priceId,
                    quantity: 1
                }
            ],

            success_url: `${process.env.BASE_URL}/subscriptions/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.BASE_URL}/subscriptions/error`
        });

        res.json({ url: session.url });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/success', async (req, res, next) => {
    const session = await stripe.checkout.sessions.retrieve(
        req.query.session_id
    );

    console.log(session.customer);

    let subscriptionTier = '';
    // Convert from cents
    if (session.amount_total == 2000) {
        subscriptionTier = 'capped';
    } else if (session.amount_total == 10000) {
        subscriptionTier = 'infinite';
    }

    // Save the new tokens to the DB
    let queryString = `
            UPDATE users
            SET subscription_tier = ${conn.escape(subscriptionTier)},
            stripe_customer_id = ${conn.escape(session.customer)}
            WHERE id = ${conn.escape(userId)};
            `;

    await query(queryString);

    res.redirect(`${process.env.BASE_URL}/subscriptions/success/view`);
});

// Allow customer to make changes to subscription and billing
router.post('/create-customer-portal-session', async (req, res) => {
    try {
        userId = req.body.userId;

        // Get Stripe customer ID of user
        let queryString = `
            SELECT stripe_customer_id
            FROM users            
            WHERE id = ${conn.escape(userId)};
            `;
        const result = await query(queryString);

        const session = await stripe.billingPortal.sessions.create({
            customer: result[0].stripe_customer_id,
            return_url: process.env.BASE_URL + '/subscriptions'
        });

        res.json({ url: session.url });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Stripe webhook - allow app to receive events from Stripe API
const STRIPE_WEBHOOK_SECRET =
    'whsec_dbd37de3ef8a7a9148983a3589c54550a47d48d533015343faf175c2f3402aab';
router.post(
    '/webhooks',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
        try {
            const sig = req.headers['stripe-signature'];
            const event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                STRIPE_WEBHOOK_SECRET
            );
            console.log(event);

            return res.sendStatus(200);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
);

// Export the router for app to use.
module.exports = router;
