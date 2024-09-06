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
        let sqlQuery1 = `
            SELECT user_actions.*, content_flags.content_type AS flag_type, json_object('name', skills.name, 'skill_id', skills.id, 'skill_deleted', skills.is_deleted) AS content_obj 
            FROM user_actions JOIN content_flags ON user_actions.content_id = content_flags.id JOIN skills ON skills.id = content_flags.content_id  
            WHERE user_actions.user_id = ${req.params.userId} AND user_actions.content_type = 'content_flag' AND content_flags.content_type = 'skill'`;
        conn.query(sqlQuery1, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                resResults = resResults.concat(results);
                let sqlQuery2 = `SELECT user_actions.*, content_flags.content_type AS flag_type, json_object('name', skills.name, 'skill_id', skills.id, 'skill_deleted', skills.is_deleted) AS content_obj  
                    FROM user_actions JOIN content_flags ON user_actions.content_id = content_flags.id JOIN resources ON resources.id = content_flags.content_id JOIN skills ON skills.id = resources.skill_id  
                    WHERE user_actions.user_id = ${req.params.userId} AND user_actions.content_type = 'content_flag' AND content_flags.content_type = 'resource'`;
                conn.query(sqlQuery2, (err, results) => {
                    if (err) {
                        throw err;
                    }

                    resResults = resResults.concat(results);
                    let sqlQuery3 = `SELECT user_actions.*, content_flags.content_type AS flag_type, json_object('question_name', mc_questions.name, 'name', skills.name, 'skill_id', skills.id, 'question', mc_questions.question,'question_id', mc_questions.id, 'skill_deleted', skills.is_deleted) AS content_obj  
                        FROM user_actions JOIN content_flags ON user_actions.content_id = content_flags.id JOIN mc_questions ON mc_questions.id = content_flags.content_id JOIN skills ON skills.id = mc_questions.skill_id  
                        WHERE user_actions.user_id = ${req.params.userId} AND user_actions.content_type = 'content_flag' AND content_flags.content_type = 'mc_question'`;
                    conn.query(sqlQuery3, (err, results) => {
                        if (err) {
                            throw err;
                        } else {

                            resResults = resResults.concat(results);
                            // Get Delete actions because deleted content_id cant join with others table
                            let sqlQuery4 = `SELECT user_actions.*, JSON_OBJECT() AS content_obj 
                                              FROM user_actions 
                                              WHERE user_actions.action = 'delete' AND user_actions.content_type = 'content_flag' AND user_actions.user_id=${req.params.userId}`
                            conn.query(sqlQuery4, (err, results) => {
                                if (err)
                                    throw err;
                                else {
                                    resResults = resResults.concat(results);
                                    let sqlQuery5 = `SELECT user_actions.*, content_flags.content_type AS flag_type,
                                    json_object('question_name', essay_questions.name, 'name', skills.name, 'skill_id', skills.id, 'question', essay_questions.question,'question_id', essay_questions.id, 'skill_deleted', skills.is_deleted) AS content_obj 
                                    FROM user_actions JOIN content_flags ON user_actions.content_id = content_flags.id JOIN essay_questions ON essay_questions.id = content_flags.content_id JOIN skills ON skills.id = essay_questions.skill_id
                                    WHERE user_actions.user_id = ${req.params.userId} AND user_actions.content_type = 'content_flag' AND content_flags.content_type = 'essay_question';`;
                                    conn.query(sqlQuery5, (err, results) => {
                                        if (err)
                                            throw err;
                                        else {
                                            resResults = resResults.concat(results);
                                            resResults.sort(function (x, y) {
                                                const date1 = new Date(x.create_date);
                                                const date2 = new Date(y.create_date);
                                                return date1 - date2;
                                            })
                                            res.json(resResults);
                                        }
                                    })
                                    // re-Sort by date because we made two query and mess up the order of the results array  
                                }
                            })
                        }


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
    let resResults = [];
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        const sqlQuery = `SELECT user_actions.*, JSON_OBJECT('skill_name', skills.name, 'skill_id', skills.id, 'skill_deleted', skills.is_deleted, 'resource_deleted', resources.is_deleted) AS content_obj 
                          FROM user_actions JOIN resources ON resources.id = user_actions.content_id JOIN skills ON skills.id = resources.skill_id   
                          WHERE user_actions.user_id = ${req.params.userId} AND user_actions.content_type = 'resource'`;
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

/**
 * List Actions with type student mc_question of a specific user
 *
 * @return response()
 */
router.get('/:userId/student_mc_question', (req, res, next) => {
    let resResults = [];
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT user_actions.*, JSON_OBJECT('skill_name', skills.name, 'skill_id', skills.id, 'student_id', student.id, 'student_name', student.username, 'skill_deleted', skills.is_deleted ) AS content_obj 
                        FROM user_actions JOIN student_mc_questions ON student_mc_questions.id = user_actions.content_id JOIN skills ON skills.id = student_mc_questions.skill_id  JOIN users as student ON student.id = student_mc_questions.student_id 
                        WHERE user_actions.user_id = ${req.params.userId} AND user_actions.content_type = 'student_mc_question'`;
        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                } else {
                    resResults = resResults.concat(results)
                    // we have to get the delete action separately because it cant join with other table with a non exists id
                    let deleteActionQuery = `SELECT user_actions.*, JSON_OBJECT() AS content_obj 
                                             FROM user_actions 
                                             WHERE user_actions.action = 'delete' AND user_actions.content_type = 'student_mc_question' AND user_id=${req.params.userId}`
                    conn.query(deleteActionQuery, (err, results) => {
                        if (err) {
                            throw err;
                        } else {
                            resResults = resResults.concat(results);
                            // re-Sort by date because we made two query and mess up the order of the results array  
                            resResults.sort(function (x, y) {
                                const date1 = new Date(x.create_date);
                                const date2 = new Date(y.create_date);
                                return date1 - date2;
                            })
                            res.json(resResults);
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
 * List Actions with type mc_question and essay_question of a specific user
 *
 * @return response()
 */
router.get('/:userId/question', (req, res, next) => {
    let resResults = [];
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT user_actions.*, JSON_OBJECT('question_name', mc_questions.name, 'skill_name', skills.name, 'skill_id', skills.id, 'user_name', users.username, 'skill_deleted', skills.is_deleted, 'question_deleted', mc_questions.is_deleted ) AS content_obj 
                        FROM user_actions JOIN mc_questions ON mc_questions.id = user_actions.content_id JOIN skills ON skills.id = mc_questions.skill_id  JOIN users ON users.id = user_actions.user_id 
                        WHERE user_actions.user_id = ${req.params.userId} AND user_actions.content_type = 'mc_question'`;
        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                } else {
                    resResults = resResults.concat(results);
                    // WE also get the essay question actions here
                    const essayQuestionQuery = `SELECT user_actions.*, JSON_OBJECT('question_name', essay_questions.name, 'skill_name', skills.name, 'skill_id', skills.id, 'user_name', users.username, 'skill_deleted' , skills.is_deleted, 'question_deleted', essay_questions.is_deleted ) AS content_obj 
                                                        FROM user_actions JOIN essay_questions ON essay_questions.id = user_actions.content_id JOIN skills ON skills.id = essay_questions.skill_id  JOIN users ON users.id = user_actions.user_id 
                                                        WHERE user_actions.user_id = ${req.params.userId} AND user_actions.content_type = 'essay_question'`;
                    conn.query(essayQuestionQuery, (err, results) => {
                        if (err) {
                            throw err;
                        } else {
                            resResults = resResults.concat(results);
                            // we have to get delete essay question action separately

                            // re-Sort by date because we made two query and mess up the order of the results array  
                            resResults.sort(function (x, y) {
                                const date1 = new Date(x.create_date);
                                const date2 = new Date(y.create_date);
                                return date1 - date2;
                            })
                            res.json(resResults);
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
 * List Actions with type skill of a specific user
 *
 * @return response()
 */
router.get('/:userId/skill', (req, res, next) => {
    let resResults = [];
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT user_actions.*, JSON_OBJECT('skill_name', skills.name, 'skill_id', skills.id, 'is_deleted', skills.is_deleted) AS content_obj 
                        FROM user_actions JOIN skills ON user_actions.content_id = skills.id 
                        WHERE user_actions.user_id = ${req.params.userId} AND user_actions.content_type = 'skill'`;
        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                } else {
                    res.json(results);
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
