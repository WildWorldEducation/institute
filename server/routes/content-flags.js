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

// Load all essay type questions.
/**
 * Using divide and conquer tactic we will query each part of content flag list based on flag type
 * TODO: for better readable code and avoid this call back hell change the mysql library to promise base and use async await instead
 */
router.get('/list', async (req, res, next) => {
    if (req.session.userName) {
        let resData = [];
        res.setHeader('Content-Type', 'application/json');
        // Get data for mc_question type Flag (extremely long raw sql query)
        let sqlMCQuery =
            `SELECT content_flags.*, users.id as userId, users.username, users.avatar, users.role as userRole,  json_object('question', mc_questions.question, 'name', mc_questions.name, 'incorrectAnswer1', mc_questions.incorrect_answer_1, 'incorrectAnswer2', mc_questions.incorrect_answer_2, 'incorrectAnswer3', mc_questions.incorrect_answer_3, 'incorrectAnswer4', mc_questions.incorrect_answer_4, 'correctAnswer', mc_questions.correct_answer, 'explanation', mc_questions.explanation, 'skillName', skills.name, 'skillId', skills.id) as contentData 
             FROM ( content_flags AS content_flags JOIN mc_questions ON content_flags.content_id = mc_questions.id JOIN skills ON skills.id = mc_questions.skill_id ) JOIN users ON content_flags.user_id = users.id 
             WHERE content_flags.content_type = 'mc_question' GROUP BY content_flags.id `;
        conn.query(sqlMCQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                resData = resData.concat(results);
                // Get data for essay_question type flag
                let sqlEssayQuery =
                    `SELECT content_flags.*, users.id as userId, users.username, users.avatar, users.role as userRole, json_object('question', essay_questions.question, 'name', essay_questions.name, 'skillName', skills.name, 'skillId', skills.id) as contentData 
                    FROM (content_flags JOIN essay_questions ON content_flags.content_id = essay_questions.id JOIN skills ON skills.id = essay_questions.skill_id) JOIN users ON users.id = content_flags.user_id 
                    WHERE content_flags.content_type = 'essay_question' GROUP BY content_flags.id `;
                conn.query(sqlEssayQuery, (err, results) => {
                    if (err) {
                        throw err;
                    }
                    resData = resData.concat(results);
                    // Get data for skill type flag
                    let sqlSkillQuery =
                        `SELECT content_flags.*, users.id as userId, users.username, users.avatar, users.role as userRole, json_object('name', skills.name, 'description', skills.description, 'masteryRequirements', skills.mastery_requirements, 'level', skills.level) as contentData 
                        FROM (content_flags JOIN skills ON content_flags.content_id = skills.id) JOIN users ON users.id = content_flags.user_id 
                        WHERE content_flags.content_type = 'skill' GROUP BY content_flags.id `;
                    conn.query(sqlSkillQuery, (err, results) => {
                        if (err) {
                            throw err;
                        }
                        resData = resData.concat(results);
                        // Get Data for resource type flag
                        let sqlResourceQuery =
                            `SELECT content_flags.*, flagging_user.id as userId, flagging_user.username, flagging_user.avatar, flagging_user.role as userRole, json_object('content', resources.content ,'skill' , sk.name, 'skillId', sk.id, 'user', users.username) as contentData 
                            FROM (content_flags JOIN resources ON content_flags.content_id = resources.id JOIN skills AS sk ON sk.id = resources.skill_id JOIN users ON users.id = resources.user_id) JOIN users as flagging_user ON content_flags.user_id = flagging_user.id 
                            WHERE content_flags.content_type = 'resource' GROUP BY content_flags.id `;
                        conn.query(sqlResourceQuery, (err, results) => {
                            if (err) {
                                throw err;
                            }
                            resData = resData.concat(results);
                            res.json(resData);
                        });
                    });
                });
            } catch (err) {
                next(err);
            }
        });
    }
});

router.post('/add', (req, res, next) => {
    if (req.session.userName) {
        // No need to escape single quotes for SQL to accept,
        // as using '?'.
        // Add data.
        let data = {
            content_type: req.body.content_type,
            content_id: req.body.content_id,
            user_id: req.body.user_id
        };
        let sqlQuery = 'INSERT IGNORE INTO content_flags SET ?';
        conn.query(sqlQuery, data, (err, result) => {
            try {
                if (err) {
                    throw err;
                } else {
                    // Add create Flag Action
                    let actionData = {
                        action: 'create',
                        content_id: result.insertId,
                        user_id: data.user_id,
                        content_type: 'content_flag',
                    };
                    let userActionQuery = 'INSERT IGNORE INTO user_actions SET ?';
                    conn.query(userActionQuery, actionData, (err, result) => {
                        if (err) {
                            throw err;
                        }
                        else {
                            res.end();
                        }
                    })
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
 * Delete Item
 *
 * @return response()
 */
router.delete('/:id', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = 'DELETE FROM content_flags WHERE id=' + req.params.id;
        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.end();
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
