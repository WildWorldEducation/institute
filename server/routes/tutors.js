/*------------------------------------------
--------------------------------------------
Middleware
--------------------------------------------
--------------------------------------------*/
const express = require('express');
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
 * Create New Tutor
 *
 * @return response()
 */
router.post('/add/:skillId', (req, res, next) => {
    if (req.session.userName) {
        // No need to escape single quotes for SQL to accept,
        // as using '?'.
        // Add data.
        let data = {
            skill_id: req.params.skillId,
            user_id: req.session.userId,
            description: req.body.description
        };

        // Check that source is not in the list of blocked domains.
        let sqlQuery = `INSERT INTO tutors SET ?;`;
        conn.query(sqlQuery, data, (err) => {
            try {
                if (err) {
                    throw err;
                } else {
                }
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

// Export the router for app to use.
module.exports = router;
