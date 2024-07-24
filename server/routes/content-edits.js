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
router.post('/skill/add/:skillId', (req, res, next) => {
    console.log(req.body);
    if (req.session.userName) {
        // No need to escape single quotes for SQL to accept,
        // as using '?'.
        // Add data.
        let data = {
            user_id: req.body.user_id,
            content_type: req.body.content_type,
            content_id: req.body.content_id,
            updated_content: req.body.updated_content
        };
        let sqlQuery = 'INSERT IGNORE INTO content_edits SET ?';
        conn.query(sqlQuery, data, (err, result) => {
            try {
                if (err) {
                    throw err;
                } else {
                    res.end();
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
