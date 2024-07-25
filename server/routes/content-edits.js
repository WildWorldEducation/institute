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
 * List all.
 *
 */
router.get('/list', async (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        // Get data for mc_question type Flag (extremely long raw sql query)
        let sqlQuery = `SELECT * FROM content_edits;`;
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
 * Get one.
 *
 */
router.get('/:id', async (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        // Get data for mc_question type Flag (extremely long raw sql query)
        let sqlQuery = `SELECT * FROM content_edits WHERE id = ${req.params.id};`;
        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.json(results[0]);
            } catch (err) {
                next(err);
            }
        });
    }
});

/**
 * Add a content edit record for editing a skill's mastery requirements section.
 *
 */
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
