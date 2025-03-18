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
const stripe = Stripe('sk_test_BQokikJOvBiI2HlWgH4olfQ2');

// DB
const conn = require('../config/db');

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
        FROM user_tokens        
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
    const { donation } = req.body;
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Donation'
                    },
                    unit_amount: donation * 100
                },
                quantity: 1
            }
        ],
        mode: 'payment',
        success_url: '<http://localhost:3000/subscriptions/success>',
        cancel_url: '<http://localhost:3000/subscriptions/error>'
    });

    res.json({ id: session.id });
});

// Export the router for app to use.
module.exports = router;
