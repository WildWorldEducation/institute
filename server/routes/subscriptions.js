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
        res.json({ subscription: null });
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

// Stripe webhooks - receive events from Stripe customer portal
// router.post(
//     '/webhooks',
//     express.json({ type: 'application/json' }),
//     async (req, res) => {
//         try {
//             const event = req.body;
//             let stripeCustomerId = '';

//             // Handle the event
//             switch (event.type) {
//                 case 'customer.subscription.updated':
//                     const subscriptionUpdated = event.data.object;
//                     stripeCustomerId = subscriptionUpdated.customer;
//                     const priceId = subscriptionUpdated.plan.id;

//                     // Only change if plan has been downgraded
//                     if (priceId == process.env.VITE_BASIC_PLAN_PRICE_ID) {
//                         let downgradeSubQueryString = `
//                             UPDATE users
//                             SET subscription_tier = 'basic'
//                             WHERE stripe_customer_id = ${conn.escape(
//                                 stripeCustomerId
//                             )};
//                         `;

//                         await query(downgradeSubQueryString);
//                     }
//                     break;
//                 case 'customer.subscription.deleted':
//                     stripeCustomerId = event.data.object.customer;

//                     let endSubQueryString = `
//                         UPDATE users
//                         SET subscription_tier = 'free'
//                         WHERE stripe_customer_id = ${conn.escape(
//                             stripeCustomerId
//                         )};
//                     `;

//                     await query(endSubQueryString);
//                     break;
//                 default:
//                     console.log(`Unhandled event type ${event.type}`);
//             }

//             // Return a response to acknowledge receipt of the event
//             response.json({ received: true });
//         } catch (e) {
//             res.status(500).json({ error: e.message });
//         }
//     }
// );

// Cancel subscription
// (Subscription tier changes to "Free plan" at the end of the billing cycle.)
// router.post('/cancel', async (req, res) => {
//     try {
//         let userId = req.body.userId;

//         // Get Stripe customer ID of user
//         let queryString = `
//             SELECT stripe_customer_id
//             FROM users
//             WHERE id = ${conn.escape(userId)};
//             `;

//         let result = await query(queryString);

//         // If the user has a Stripe ID.
//         if (
//             result[0].stripe_customer_id != null &&
//             result[0].stripe_customer_id != ''
//         ) {
//             const subscriptions = await stripe.subscriptions.list({
//                 customer: result[0].stripe_customer_id
//             });

//             // If a subscription is found.
//             if (subscriptions.data.length > 0) {
//                 const subscriptionId = subscriptions.data[0].id;
//                 const subscription = await stripe.subscriptions.update(
//                     subscriptionId,
//                     {
//                         cancel_at_period_end: true
//                     }
//                 );
//             } else {
//                 // In case there is no subscription, update it on our side
//                 let endSubQueryString = `
//                 UPDATE users
//                 SET subscription_tier = 'free'
//                 WHERE id = ${conn.escape(userId)};
//             `;

//                 await query(endSubQueryString);
//             }
//         } else {
//             // In case there is no subscription, update it on our side
//             let endSubQueryString = `
//            UPDATE users
//            SET subscription_tier = 'free'
//            WHERE id = ${conn.escape(userId)};
//        `;

//             await query(endSubQueryString);
//         }

//         res.json({ status: 'succeeded' });
//     } catch (e) {
//         res.status(500).json({ status: 'failed', error: e.message });
//     }
// });

// Downgrade subscription
// (Subscription tier changes from "Infinite plan" to "Basic plan" at end of billing cycle)
// router.post('/downgrade', async (req, res) => {
//     try {
//         let subscriptionId = req.body.subscriptionId;
//         let subScheduleId = req.body.subScheduleId;

//         const subscription = await stripe.subscriptions.retrieve(
//             subscriptionId
//         );

//         // Get the start and end dates of the current billing cycle.
//         let subItemCurrentPeriodStart =
//             subscription.items.data[0].current_period_start;
//         let subItemCurrentPeriodEnd =
//             subscription.items.data[0].current_period_end;

//         // If there is no subscription schedule yet
//         if (subScheduleId == null || subScheduleId == '') {
//             // Create a subscription schedule with the existing subscription
//             const schedule = await stripe.subscriptionSchedules.create({
//                 from_subscription: subscriptionId
//             });
//             subScheduleId = schedule.id;
//         }

//         // Update the schedule with the new phase
//         const subscriptionSchedule = await stripe.subscriptionSchedules.update(
//             subScheduleId,
//             {
//                 phases: [
//                     {
//                         start_date: subItemCurrentPeriodStart,
//                         end_date: subItemCurrentPeriodEnd,
//                         items: [
//                             {
//                                 price: process.env.VITE_INFINITE_PLAN_PRICE_ID
//                             }
//                         ]
//                     },
//                     {
//                         start_date: subItemCurrentPeriodEnd,
//                         items: [
//                             {
//                                 price: process.env.VITE_BASIC_PLAN_PRICE_ID
//                             }
//                         ]
//                     }
//                 ]
//             }
//         );

//         res.json({ status: 'succeeded' });
//     } catch (e) {
//         res.status(500).json({ status: 'failed', error: e.message });
//     }
// });

// Upgrade subscription
// (Subscription tier changes from "Basic plan" to "Infinite plan" immmediately.)
// router.post('/upgrade', async (req, res) => {
//     try {
//         const subscriptionId = req.body.subscriptionId;

//         // Get the subscription object from Stripe.
//         const subscriptionToBeUpdated = await stripe.subscriptions.retrieve(
//             subscriptionId
//         );
//         const stripeCustomerId = subscriptionToBeUpdated.customer;

//         // Get the subscription item id.
//         let itemId = subscriptionToBeUpdated.items.data[0].id;
//         // Get the price id for the new plan
//         let priceId = process.env.VITE_INFINITE_PLAN_PRICE_ID;

//         let subscription = await stripe.subscriptions.update(
//             subscriptionToBeUpdated.id,
//             {
//                 items: [
//                     {
//                         id: itemId,
//                         // New plan id
//                         price: priceId
//                     }
//                 ],
//                 // Bill and invoice immediately
//                 proration_behavior: 'always_invoice',
//                 payment_behavior: 'error_if_incomplete'
//             }
//         );

//         let upgradeSubQueryString = `
//                             UPDATE users
//                             SET subscription_tier = 'infinite'
//                             WHERE stripe_customer_id = ${conn.escape(
//                                 stripeCustomerId
//                             )};
//                         `;

//         await query(upgradeSubQueryString);

//         res.json({ status: 'succeeded' });
//     } catch (e) {
//         res.status(500).json({ status: 'failed', error: e.message });
//     }
// });

// Export the router for app to use.
module.exports = router;
