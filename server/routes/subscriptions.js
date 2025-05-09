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
router.get('/get-sub/:userId', async (req, res, next) => {
    let queryString = `
            SELECT stripe_customer_id
            FROM users            
            WHERE id = ${conn.escape(req.params.userId)};
            `;

    let result = await query(queryString);

    console.log(result[0].stripe_customer_id);

    // If the user has a Stripe ID.
    if (
        result[0].stripe_customer_id != null &&
        result[0].stripe_customer_id != ''
    ) {
        const subscriptions = await stripe.subscriptions.list({
            customer: result[0].stripe_customer_id
        });

        console.log('test');
        console.log(subscriptions);
        console.log(subscriptions.length);

        // If a subscription is found.
        if (subscriptions.data.length > 0) {
            const subscriptionId = subscriptions.data[0].id;
            const subscription = await stripe.subscriptions.retrieve(
                subscriptionId
            );
            res.json({ subscription: subscription });
        } else {
            res.json({ subscription: null });
        }
    } else {
        res.json({ subscription: null });
    }
});

let userId;
router.post('/create-checkout-session', async (req, res) => {
    try {
        userId = req.body.userId;
        let priceId = '';
        if (req.body.planType == 'basic') {
            priceId = process.env.BASIC_PLAN_PRICE_ID;
        } else {
            priceId = process.env.INFINITE_PLAN_PRICE_ID;
        }

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
        subscriptionTier = 'basic';
    } else if (session.amount_total == 10000) {
        subscriptionTier = 'infinite';
    }

    // Save the new Stripe customer ID and subscription ID to the user table
    let usersTableQueryString = `
            UPDATE users
            SET stripe_customer_id = ${conn.escape(session.customer)},
            subscription_tier = '${subscriptionTier}'            
            WHERE id = ${conn.escape(userId)};
            `;

    await query(usersTableQueryString);

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
                    stripeCustomerId = subscriptionUpdated.customer;

                    // Check if the subscription plan type has changed
                    let checkPlanQueryString = `
                            SELECT subscription_tier
                            FROM users
                            WHERE stripe_customer_id = ${conn.escape(
                                stripeCustomerId
                            )};                         
                        `;

                    let result = await query(checkPlanQueryString);
                    const previousPlan = result[0].subscription_tier;
                    let previousPriceId = '';
                    if (previousPlan == 'basic') {
                        previousPriceId = process.env.BASIC_PLAN_PRICE_ID;
                    } else if (previousPlan == 'infinite') {
                        previousPriceId = process.env.INFINITE_PLAN_PRICE_ID;
                    }

                    priceId = subscriptionUpdated.plan.id;
                    // If it has, update it in the DB, otherwise, ignore this event.
                    if (priceId != previousPriceId) {
                        let planType = '';
                        if (priceId == process.env.BASIC_PLAN_PRICE_ID) {
                            planType = 'basic';
                        } else if (
                            priceId == process.env.INFINITE_PLAN_PRICE_ID
                        ) {
                            planType = 'infinite';
                        }
                        // change tier to relevant one
                        let updateSubQueryString = `
                            UPDATE users
                            SET subscription_tier = '${planType}'
                            WHERE stripe_customer_id = ${conn.escape(
                                stripeCustomerId
                            )};                         
                        `;

                        await query(updateSubQueryString);
                    }
                    break;
                case 'customer.subscription.deleted':
                    const subscriptionEnded = event.data.object;
                    stripeCustomerId = subscriptionEnded.customer;

                    let endSubQueryString = `
                        UPDATE users
                        SET subscription_tier = 'free'                                            
                        WHERE stripe_customer_id = ${conn.escape(
                            stripeCustomerId
                        )};                         
                    `;

                    await query(endSubQueryString);
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

// Cancel subscription
// (Subscription tier changes to "Free plan" at the end of the billing cycle.)
router.post('/cancel', async (req, res) => {
    try {
        userId = req.body.userId;

        // Get Stripe customer ID of user
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
            const subscriptions = await stripe.subscriptions.list({
                customer: result[0].stripe_customer_id
            });

            // If a subscription is found.
            if (subscriptions.data.length > 0) {
                const subscriptionId = subscriptions.data[0].id;
                const subscription = await stripe.subscriptions.update(
                    result[0].stripe_subscription_id,
                    {
                        cancel_at_period_end: true
                    }
                );
            } else {
                // In case there is no subscription, update it on our side
                let endSubQueryString = `
                UPDATE users
                SET subscription_tier = 'free'                                            
                WHERE id = ${conn.escape(userId)};                         
            `;

                await query(endSubQueryString);
            }
        } else {
            // In case there is no subscription, update it on our side
            let endSubQueryString = `
           UPDATE users
           SET subscription_tier = 'free'                                            
           WHERE id = ${conn.escape(userId)};                         
       `;

            await query(endSubQueryString);
        }

        res.redirect(`${process.env.BASE_URL}/subscriptions/success/view`);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Downgrade subscription
// (Subscription tier changes from "Infinite plan" to "Basic plan" at end of billing cycle)
router.post('/downgrade', async (req, res) => {
    console.log(req.body);
    try {
        let subscriptionId = req.body.subscriptionId;

        const subscription = await stripe.subscriptions.retrieve(
            subscriptionId
        );

        console.log(subscription);
        res.end();
        return;
        // console.log(subscription.items.data[0].id);

        let subscriptionItemId = subscription.items.data[0].id;

        const updatedSubscription = await stripe.subscriptions.update(
            subscriptionId,
            {
                items: [
                    {
                        id: subscriptionItemId,
                        price: process.env.BASIC_PLAN_PRICE_ID
                    }
                ]
            }
        );

        console.log(updatedSubscription);

        res.redirect(`${process.env.BASE_URL}/subscriptions/success/view`);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Unfinished!!
// Upgrade subscription
// (Subscription tier changes from "Basic plan" to "Infinite plan" immmediately.)
router.post('/upgrade', async (req, res) => {
    try {
        userId = req.body.userId;

        // Get Stripe customer ID of user
        let queryString = `
            SELECT stripe_subscription_id
            FROM users            
            WHERE id = ${conn.escape(userId)};
            `;
        const result = await query(queryString);

        const subscriptionToBeUpdated = await stripe.subscriptions.retrieve(
            result[0].stripe_subscription_id
        );

        //console.log(subscription.items.data);
        let itemId = subscriptionToBeUpdated.items.data[0].id;
        let priceId = process.env.INFINITE_PLAN_PRICE_ID;

        subscription = await stripe.subscriptions.update(
            subscriptionToBeUpdated.id,
            {
                items: [
                    {
                        id: itemId,
                        price: priceId
                    }
                ]
            }
        );

        res.redirect(`${process.env.BASE_URL}/subscriptions/success/view`);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Export the router for app to use.
module.exports = router;
