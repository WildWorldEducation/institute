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
 *
 * Get All Items of a Particular Skill
 *
 */
// Used for choosing parent skill when adding a new skill.
router.get('/:skillId/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery =
            `SELECT * 
            FROM skill_history 
            WHERE id = ` +
            req.params.skillId +
            ` ORDER BY edited_date DESC`;
        let query = conn.query(sqlQuery, (err, results) => {
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
