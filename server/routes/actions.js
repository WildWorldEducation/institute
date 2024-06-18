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
        let sqlQuery1 = `SELECT ua.*, cf.content_type AS flag_type, json_object('name', sk.name, 'description', sk.description, 'skill_id', sk.id) AS content_obj  
                         FROM user_actions AS ua JOIN content_flags AS cf ON ua.content_id = cf.id JOIN skills AS sk ON sk.id = cf.content_id  
                         WHERE ua.user_id = ${req.params.userId} AND ua.content_type = 'flag' AND cf.content_type = 'skill'`;
        conn.query(sqlQuery1, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                resResults = resResults.concat(results);
                let sqlQuery2 = `SELECT ua.*, cf.content_type AS flag_type, json_object('name', sk.name, 'description', sk.description, 'resource_id', rs.id) AS content_obj  
                                 FROM user_actions AS ua JOIN content_flags AS cf ON ua.content_id = cf.id JOIN resources AS rs ON rs.id = cf.content_id JOIN skills AS sk ON sk.id = rs.skill_id  
                                 WHERE ua.user_id = ${req.params.userId} AND ua.content_type = 'flag' AND cf.content_type = 'resource'`;
                conn.query(sqlQuery2, (err, results) => {
                    if (err) {
                        throw err;
                    }
                    resResults = resResults.concat(results);
                    let sqlQuery3 = `SELECT ua.*, cf.content_type AS flag_type, json_object('name', sk.name, 'skill_id', sk.id, 'question', mc.question,'question_id', mc.id) AS content_obj  
                                     FROM user_actions AS ua JOIN content_flags AS cf ON ua.content_id = cf.id JOIN mc_questions AS mc ON mc.id = cf.content_id JOIN skills AS sk ON sk.id = mc.skill_id  
                                     WHERE ua.user_id = ${req.params.userId} AND ua.content_type = 'flag' AND cf.content_type = 'mc_question'`;
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
        let sqlQuery = `SELECT ua.*, JSON_OBJECT('skill_name', sk.name, 'skill_id', sk.id) AS content_obj 
                        FROM user_actions AS ua JOIN resources AS rs ON rs.id = ua.content_id JOIN skills AS sk ON sk.id = rs.skill_id   
                        WHERE ua.user_id = ${req.params.userId} AND ua.content_type = 'resource'`;
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
        let sqlQuery = `SELECT ua.*, JSON_OBJECT('skill_name', sk.name, 'skill_id', sk.id) AS content_obj 
                        FROM user_actions AS ua JOIN student_mc_questions AS mc ON mc.id = ua.content_id JOIN skills AS sk ON sk.id = mc.skill_id   
                        WHERE ua.user_id = ${req.params.userId} AND ua.content_type = 'mc_question'`;
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
