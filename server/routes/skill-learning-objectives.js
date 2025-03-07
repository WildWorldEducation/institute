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
 */
// Available in guest mode.
router.get('/:skillId/list', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    let sqlQuery = `SELECT * 
        FROM skill_learning_objectives
        WHERE skill_id = ${conn.escape(req.params.skillId)}`;

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
});

// Export the router for app to use.
module.exports = router;
