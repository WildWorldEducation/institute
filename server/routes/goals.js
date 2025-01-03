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
 * Student Add Goal
 */
router.post('/:userId/add', (req, res, next) => {
    if (req.session.userName) {
        // Record goal in 'goals' table.
        let data = {};
        data = {
            user_id: req.params.userId,
            skill_id: req.body.skillId
        };
        let sqlQuery = `INSERT INTO goals 
        SET ?;`;

        const goalSteps = req.body.goalSteps;
        conn.query(sqlQuery, data, (err, result) => {
            try {
                if (err) {
                    throw err;
                } else {
                    // Record each goal step for the goal, in 'goal_skills' table.
                    const goalId = result.insertId;
                    for (let i = 0; i < goalSteps.length; i++) {
                        let sqlQuery = `INSERT INTO goal_skills (goal_id, skill_id)
                        VALUES (${conn.escape(goalId)}, ${conn.escape(
                            goalSteps[i].id
                        )});`;

                        conn.query(sqlQuery, data, (err) => {
                            try {
                                if (err) {
                                    throw err;
                                } else {
                                    if (i == goalSteps.length - 1) {
                                        res.end();
                                    }
                                }
                            } catch (err) {
                                next(err);
                            }
                        });
                    }
                }
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

/**
 * List Goals per Student
 */
router.get('/:userId/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT id, skill_id 
        FROM goals
        WHERE user_id = ${conn.escape(req.params.userId)}`;
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
 * List Goal Steps per Student
 */
router.get('/:goalId/goal-steps/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT skill_id
        FROM goal_skills
        WHERE goal_id = ${conn.escape(req.params.goalId)}
        ORDER BY id DESC;`;
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
 * Check if a Student Already has a Goal for a particular Skill
 */
router.get('/:userId/:skillId', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT id
        FROM goals
        WHERE user_id = ${conn.escape(req.params.userId)} &&
        skill_id = ${conn.escape(req.params.skillId)}`;
        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                let result = false;
                if (results.length > 0) {
                    result = true;
                }
                res.json({ goalExists: result });
            } catch (err) {
                next(err);
            }
        });
    }
});

/**
 * Delete Item
 */
router.delete('/:goalId', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = `DELETE FROM goals WHERE id=${conn.escape(
            req.params.goalId
        )};`;
        conn.query(sqlQuery, (err) => {
            try {
                if (err) {
                    throw err;
                }

                let sqlQuery2 = `DELETE 
                FROM goal_skills
                WHERE goal_id=${conn.escape(req.params.goalId)}`;

                conn.query(sqlQuery2, (err) => {
                    try {
                        if (err) {
                            throw err;
                        }

                        res.end();
                    } catch (err) {
                        next(err);
                    }
                });
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

/**
 * Update Goal
 */
router.put('/edit', (req, res, next) => {});

// Export the router for app to use.
module.exports = router;
