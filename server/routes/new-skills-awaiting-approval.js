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

//Middlewares
const isAuthenticated = require('../middlewares/authMiddleware');

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
router.get('/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT * 
            FROM new_skills_awaiting_approval`;

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
 * Show Item
 *
 * @return response()
 */
router.get('/show/:id', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT * 
            FROM new_skills_awaiting_approval
            WHERE id = ${req.params.id};`;

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
 * Submit New Skill For Review
 *
 */
router.post(
    '/submit-new-skill-for-review',
    isAuthenticated,
    async (req, res, next) => {
        let data = {};
        data = {
            user_id: req.body.user_id,
            name: req.body.name,
            parent: req.body.parent,
            mastery_requirements: req.body.mastery_requirements,
            icon_image: req.body.icon_image,
            type: req.body.type,
            level: req.body.level
        };

        // Insert the new skill.
        let sqlQuery = `INSERT INTO new_skills_awaiting_approval SET ?;`;
        conn.query(sqlQuery, data, (err) => {
            try {
                if (err) {
                    throw err;
                }
                res.end();
            } catch (err) {
                next(err);
            }
        });
    }
);

// Export the router for app to use.
module.exports = router;
