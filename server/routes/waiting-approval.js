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
// DB
const conn = require('../config/db');

/*------------------------------------------
--------------------------------------------
Routes
--------------------------------------------
--------------------------------------------*/
/**
 * List Items
 *
 * @return response()
 */
router.get('/count', (req, res, next) => {
    if (req.session.userName) {
        let totalCount = 0;
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery1 = 'SELECT COUNT(*) AS countRows FROM skills_awaiting_approval';
        // count skill awaiting approval
        conn.query(sqlQuery1, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                totalCount += parseInt(results[0].countRows);
                // count mc_question awaiting approval
                let sqlQuery2 = 'SELECT COUNT(*) AS countRows FROM mc_questions_awaiting_approval'
                conn.query(sqlQuery2, (err, results) => {
                    if (err) {
                        throw err;
                    }
                    totalCount += parseInt(results[0].countRows);
                    // count essay awaiting approval
                    let sqlQuery3 = 'SELECT COUNT(*) AS countRows FROM essay_questions_awaiting_approval'
                    conn.query(sqlQuery3, (err, results) => {
                        if (err) {
                            throw err;
                        }
                        totalCount += parseInt(results[0].countRows);

                        res.json(totalCount)
                    })
                })
            } catch (err) {
                next(err);
            }
            // 
        });
    }
});

// Export the router for app to use.
module.exports = router;