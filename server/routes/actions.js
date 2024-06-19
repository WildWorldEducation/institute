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
 * Add Actions for a specific user
 *
 * @return response()
 */
router.post('/', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        const sqlQuery = 'INSERT INTO user_actions SET ?';
        let query = conn.query(sqlQuery, req.body, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.json(results);
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

/**
 * List Actions for a specific user
 *
 * @return response()
 */
router.get('/:userId', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT * FROM user_actions WHERE user_id = ${req.params.userId}`;
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
    } else {
        res.redirect('/login');
    }
});

/**
 * List Actions with type content_flag of a specific user
 *
 * @return response()
 */
router.get('/:userId/flag', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        /** NOTE
         * we get all the flag and it relate content data using promise
         * this will likely become a call back hell if there are a lot type of flag
         */
        let resResults = [];
        let sqlQuery1 = `SELECT user_actions.*, content_flags.content_type AS flag_type, json_object('name', skills.name, 'description', skills.description, 'skill_id', skills.id) AS content_obj  
                         FROM user_actions JOIN content_flags ON user_actions.content_id = content_flags.id JOIN skills ON skills.id = content_flags.content_id  
                         WHERE user_actions.user_id = ${req.params.userId} AND user_actions.content_type = 'flag' AND content_flags.content_type = 'skill'`;
        conn.query(sqlQuery1, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                resResults = resResults.concat(results);
                let sqlQuery2 = `SELECT user_actions.*, content_flags.content_type AS flag_type, json_object('name', skills.name, 'description', skills.description, 'resource_id', resources.id) AS content_obj  
                                 FROM user_actions JOIN content_flags ON user_actions.content_id = content_flags.id JOIN resources ON resources.id = content_flags.content_id JOIN skills ON skills.id = resources.skill_id  
                                 WHERE user_actions.user_id = ${req.params.userId} AND user_actions.content_type = 'flag' AND content_flags.content_type = 'resource'`;
                conn.query(sqlQuery2, (err, results) => {
                    if (err) {
                        throw err;
                    }
                    resResults = resResults.concat(results);
                    let sqlQuery3 = `SELECT user_actions.*, content_flags.content_type AS flag_type, json_object('name', skills.name, 'skill_id', skills.id, 'question', mc_questions.question,'question_id', mc_questions.id) AS content_obj  
                                     FROM user_actions JOIN content_flags ON user_actions.content_id = content_flags.id JOIN mc_questions ON mc_questions.id = content_flags.content_id JOIN skills ON skills.id = mc_questions.skill_id  
                                     WHERE user_actions.user_id = ${req.params.userId} AND user_actions.content_type = 'flag' AND content_flags.content_type = 'mc_question'`;
                    conn.query(sqlQuery3, (err, results) => {
                        if (err) {
                            throw err;
                        }
                        resResults = resResults.concat(results);
                        res.json(resResults);
                    });
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
 * List Actions with type resource of a specific user
 *
 * @return response()
 */
router.get('/:userId/resource', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT user_actions.*, JSON_OBJECT('skill_name', skills.name, 'skill_id', skills.id) AS content_obj 
                        FROM user_actions JOIN resources ON resources.id = user_actions.content_id JOIN skills ON skills.id = resources.skill_id   
                        WHERE user_actions.user_id = ${req.params.userId} AND user_actions.content_type = 'resource'`;
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
    } else {
        res.redirect('/login');
    }
});

/**
 * List Actions with type mc_question of a specific user
 *
 * @return response()
 */
router.get('/:userId/mc_question', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT user_actions.*, JSON_OBJECT('skill_name', skills.name, 'skill_id', skills.id) AS content_obj 
                        FROM user_actions JOIN student_mc_questions AS mc ON mc.id = user_actions.content_id JOIN skills ON skills.id = mc.skill_id   
                        WHERE user_actions.user_id = ${req.params.userId} AND user_actions.content_type = 'mc_question'`;
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
    } else {
        res.redirect('/login');
    }
});

// Export the router for app to use.
module.exports = router;
