/*------------------------------------------
--------------------------------------------
Middleware.
--------------------------------------------
--------------------------------------------*/
const express = require('express');
// Router.
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());
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
 * List Referrals
 *
 * @return response:
 */
router.get('/list', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = `SELECT * FROM referrals;`;
        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.json(results);
            } catch (err) {
                next(err);
            }
        });
    }
});

/**
 * List Referrals by Partner
 *
 * @return response:
 */
router.get('/:partner/list', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = `SELECT referred_user_id
            FROM referrals
            WHERE referrer_user_id = ${conn.escape(req.params.partner)};`;

        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.json(results);
            } catch (err) {
                next(err);
            }
        });
    }
});

/**
 * Fetch Receipts by Partner and Referred User
 *
 * @return response:
 */
router.get('/get-receipts/:userId', async (req, res, next) => {
    let queryString = `
            SELECT id, url, date, amount, is_partner_compensated
            FROM user_receipts            
            WHERE user_id = ${conn.escape(req.params.userId)};
            `;

    let result = await query(queryString);

    res.json(result);
});

// Export the router for app to use.
module.exports = router;
