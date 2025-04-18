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
        console.log(priceId);

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

    // Save the new Stripe customer ID to the user table
    let usersTableQueryString = `
            UPDATE users
            SET stripe_customer_id = ${conn.escape(session.customer)},
            subscription_tier = '${subscriptionTier}'
            WHERE id = ${conn.escape(userId)};
            `;

    await query(usersTableQueryString);

    // // Current date time
    // const currentPeriodStart = moment().format('YYYY-MM-DD HH:mm:ss');
    // // Date time in one month
    // let currentPeriodEndMonth = moment()
    //     .add(1, 'months')
    //     .format('YYYY-MM-DD HH:mm:ss');

    // Save the subscription details to the subscription table
    // let subscriptionTableQueryString = `
    //         INSERT INTO subscriptions (user_id, stripe_subscription_id,
    //         stripe_price_id, current_period_start, current_period_end, created_at)
    //         VALUES (${conn.escape(userId)}, '${
    //     session.subscription
    // }' , '${priceId}', '${currentPeriodStart}', '${currentPeriodEndMonth}', '${currentPeriodStart}');
    //         `;

    // await query(subscriptionTableQueryString);

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

// Stripe webhooks - receive events from Stripe customer portal
router.post(
    '/webhooks',
    express.json({ type: 'application/json' }),
    async (req, res) => {
        try {
            const event = req.body;
            let stripeCustomerId = '';

            // Handle the event
            switch (event.type) {
                case 'customer.subscription.updated':
                    const subscriptionUpdated = event.data.object;
                    console.log('Subscription Updated');
                    console.log(subscriptionUpdated);
                    stripeCustomerId = subscriptionUpdated.customer;
                    newPriceId = subscriptionUpdated.plan.id;
                    let planType = '';
                    if (newPriceId == process.env.CAPPED_PLAN_PRICE_ID) {
                        planType = 'capped';
                        console.log('New plan is "Capped"');
                    } else if (
                        newPriceId == process.env.INFINITE_PLAN_PRICE_ID
                    ) {
                        planType = 'infinite';
                        console.log('New plan is "Infinite"');
                    }

                    let updateSubQueryString = `
                        UPDATE users
                        SET subscription_tier = '${planType}'
                        WHERE stripe_customer_id = ${conn.escape(
                            stripeCustomerId
                        )};                         
                    `;

                    console.log(updateSubQueryString);

                    await query(updateSubQueryString);

                    // change tier to relevant one
                    break;
                case 'customer.subscription.deleted':
                    const subscriptionEnded = event.data.object;
                    console.log('Subscription ended');
                    console.log(subscriptionEnded);
                    stripeCustomerId = subscriptionEnded.customer;

                    let endSubQueryString = `
                        UPDATE users
                        SET subscription_tier = 'free'
                        WHERE stripe_customer_id = ${conn.escape(
                            stripeCustomerId
                        )};                         
                    `;

                    console.log(endSubQueryString);

                    await query(endSubQueryString);
                    // set tier to "free"
                    break;
                default:
                    console.log(`Unhandled event type ${event.type}`);
            }

            // Return a response to acknowledge receipt of the event
            response.json({ received: true });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
);

// Export the router for app to use.
module.exports = router;
