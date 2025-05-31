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
router.get('/get-receipts/:userId', async (req, res, next) => {
    let queryString = `
            SELECT url, date, amount
            FROM user_receipts            
            WHERE user_id = ${conn.escape(req.params.userId)};
            `;

    let result = await query(queryString);

    res.json(result);
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

            success_url: `${process.env.BASE_URL}/tokens/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.BASE_URL}/tokens/error`
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

    // Save the receipt
    const paymentIntent = await stripe.paymentIntents.retrieve(
        session.payment_intent
    );
    const charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
    const receipt_id = charge.id;
    const receipt_url = charge.receipt_url;
    const amount = charge.amount_captured;
    const created = new Date(charge.created * 1000); // Convert seconds to JS Date
    let saveReceiptQuery = `
            INSERT INTO user_receipts (id, user_id, amount, url, date)
            VALUES (${conn.escape(receipt_id)}, ${conn.escape(
        userId
    )}, ${conn.escape(amount)}, ${conn.escape(receipt_url)}, ${conn.escape(
        created
    )});
            `;
    await query(saveReceiptQuery);

    res.redirect(`${process.env.BASE_URL}/tokens/completed`);
});

// Export the router for app to use.
module.exports = router;
