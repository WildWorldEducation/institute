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
// Route not used: DELETE
// /**
//  * Get Monthly Token Usage by User
//  */
// router.get('/get-token-count/:userId/:year/:month', (req, res, next) => {
//     if (req.session.userName) {
//         res.setHeader('Content-Type', 'application/json');
//         let sqlQuery = `SELECT token_count
//         FROM user_monthly_token_usage
//         WHERE user_id = ${conn.escape(req.params.userId)}
//         AND year = ${conn.escape(req.params.year)}
//         AND month = ${conn.escape(req.params.month)};`;

//         conn.query(sqlQuery, (err, results) => {
//             try {
//                 if (err) {
//                     throw err;
//                 }
//                 res.json(results[0]);
//             } catch (err) {
//                 next(err);
//             }
//         });
//     }
// });

let userId;
let tokensPerDollar;
router.post('/create-checkout-session', async (req, res) => {
    try {
        userId = req.body.userId;
        tokensPerDollar = req.body.tokensPerDollar;
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
            SET subscription_tier = ${conn.escape(subscriptionTier)}
            WHERE id = ${conn.escape(userId)};
            `;

    await query(queryString);

    res.redirect(`${process.env.BASE_URL}/subscriptions/success/view`);
});

// Export the router for app to use.
module.exports = router;
