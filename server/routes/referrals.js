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
        let sqlQuery = `SELECT * 
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

// Export the router for app to use.
module.exports = router;
