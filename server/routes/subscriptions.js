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
const stripe = Stripe(
    'sk_test_51R4kHlFfW0WtxYZHKmORTnwIv1v2wqlW2B5EXhxLZmHWrPzfg4ws3Ef1y0sDG1VxxJ88IjLpNnVjUhhmn215sO6m00tG7xgxIl'
);

// DB
const conn = require('../config/db');
const util = require('util');
const query = util.promisify(conn.query).bind(conn);

/*------------------------------------------
--------------------------------------------
Routes
--------------------------------------------
--------------------------------------------*/
/**
 * Get User Tokens by User
 */
router.get('/get-token-count/:userId/:year/:month', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT token_count                
        FROM monthly_token_usage        
        WHERE user_id = ${conn.escape(req.params.userId)}
        AND year = ${conn.escape(req.params.year)}
        AND month = ${conn.escape(req.params.month)};`;

        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.json(results[0]);
            } catch (err) {
                next(err);
            }
        });
    }
});

router.post('/create-checkout-session', async (req, res) => {
    try {
        const userId = req.body.userId;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'tokens'
                        },
                        unit_amount: req.body.tokens
                    },
                    quantity: 1
                }
            ],

            success_url: `${process.env.BASE_URL}/subscriptions/success?user_id=${userId}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.BASE_URL}/subscriptions/error`
        });

        res.json({ url: session.url });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/success', async (req, res, next) => {
    const userId = req.params.userId;

    const session = await stripe.checkout.sessions.retrieve(
        req.query.session_id
    );

    console.log(session.amount_total);

    let queryString = `
            INSERT INTO monthly_token_usage (user_id, year, month, token_count) 
            VALUES(${conn.escape(userId)},
            ${year}, '${month}', ${conn.escape(tokenCount)}) 
            ON DUPLICATE KEY UPDATE token_count = token_count + ${conn.escape(
                tokenCount
            )};
            `;

    await query(queryString);

    res.redirect(`${process.env.BASE_URL}/subscriptions/success/view`);
});

// Export the router for app to use.
module.exports = router;
