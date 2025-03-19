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

const storeItems = new Map([
    [1, { priceInCents: 10000, name: 'Learn React Today' }],
    [2, { priceInCents: 20000, name: 'Learn CSS Today' }]
]);

router.post('/create-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: req.body.items.map((item) => {
                const storeItem = storeItems.get(item.id);
                return {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: storeItem.name
                        },
                        unit_amount: storeItem.priceInCents
                    },
                    quantity: item.quantity
                };
            }),

            success_url: `${process.env.BASE_URL}/subscription/success`,
            cancel_url: `${process.env.BASE_URL}/subscription/error`
        });

        res.json({ url: session.url });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Export the router for app to use.
module.exports = router;
