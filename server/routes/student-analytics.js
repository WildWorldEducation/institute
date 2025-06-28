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
// for querying DB
const util = require('util');
const query = util.promisify(conn.query).bind(conn);

/*------------------------------------------
--------------------------------------------
Routes
--------------------------------------------
--------------------------------------------*/
router.get('/last-visited-skills/:studentId', async (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = `
            SELECT skills.id, name, skills.url, level, icon, visited_at
            FROM user_visited_skills
            INNER JOIN skills 
            ON skills.id = user_visited_skills.skill_id
            WHERE user_id = ${conn.escape(req.params.studentId)}
            AND skills.is_deleted = 0
            ORDER BY visited_at DESC;
        `;

        conn.query(sqlQuery, (err, results) => {
            if (err) return next(err); // Pass error to error handler

            if (results.length === 0) {
                return res.status(404).json({ error: 'No recent skills' });
            }

            res.json(results);
        });
    }
});

router.get(
    '/started-unmastered-assessments/:studentId',
    async (req, res, next) => {
        if (req.session.userName) {
            let sqlQuery = `
            SELECT skills.id, name, skills.url, level, icon
            FROM user_skills
            INNER JOIN skills 
            ON skills.id = user_skills.skill_id
            WHERE user_id = ${conn.escape(req.params.studentId)}
            AND is_assessment_started = 1
            AND skills.is_deleted = 0;            
        `;

            conn.query(sqlQuery, (err, results) => {
                if (err) return next(err); // Pass error to error handler

                if (results.length === 0) {
                    return res.status(404).json({ error: 'No recent skills' });
                }

                res.json(results);
            });
        }
    }
);

// Export the router for app to use.
module.exports = router;
