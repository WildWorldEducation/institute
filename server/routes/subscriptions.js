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

// // MomentJS
// const moment = require('moment');

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
router.get('/get-receipts/:userId', async (req, res, next) => {
    let queryString = `
            SELECT stripe_customer_id
            FROM users            
            WHERE id = ${conn.escape(req.params.userId)};
            `;

    let result = await query(queryString);

    // If the user has a Stripe ID.
    if (
        result[0].stripe_customer_id != null &&
        result[0].stripe_customer_id != ''
    ) {
        // Get invoices
        const charges = await stripe.charges.list({
            limit: 3,
            customer: result[0].stripe_customer_id
        });

        res.json({ charges: charges });
    } else {
        res.json({ charges: null });
    }
});

let userId;
router.post('/create-checkout-session', async (req, res) => {
    try {
        userId = req.body.userId;
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

    let amountOfTokens = 0;
    if (session.amount_total == 1000) {
        amountOfTokens = 200000;
    } else if (session.amount_total == 2000) {
        amountOfTokens = 400000;
    } else if (session.amount_total == 5000) {
        amountOfTokens = 1000000;
    }

    // Save the new tokens to the DB
    let queryString = `
            UPDATE users
            SET tokens = tokens + ${amountOfTokens}
            WHERE id = '${userId}';
            `;
    await query(queryString);

    res.redirect(`${process.env.BASE_URL}/subscriptions/completed`);
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

// Export the router for app to use.
module.exports = router;
