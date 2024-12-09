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
        // Add data.
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
                    const goalId = result.insertId;
                    for (let i = 0; i < goalSteps.length; i++) {
                        let sqlQuery = `INSERT INTO goal_steps (goal_id, skill_id)
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

                    // Record user action.
                    // recordUserAction(
                    //     {
                    //         userId: req.body.userId,
                    //         userAction: 'submit_update_for_review',
                    //         contentType: 'mc_question',
                    //         contentId: req.params.id
                    //     },
                    //     (err) => {
                    //         if (err) {
                    //             throw err;
                    //         } else {
                    //             res.end();
                    //         }
                    //     }
                    // );
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
router.get('/:userId/list', (req, res, next) => {});

/**
 * Update Goal
 */
router.put('/edit', (req, res, next) => {});

// Export the router for app to use.
module.exports = router;
