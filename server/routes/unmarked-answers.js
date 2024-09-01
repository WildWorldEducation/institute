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

/*------------------------------------------
--------------------------------------------
Routes
--------------------------------------------
--------------------------------------------*/
/**
 * Get All Items
 *
 * @return response()
 */
router.get('/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = 'SELECT * FROM `unmarked_essay_answers`';
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

router.get('/list/:assessmentId', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery =
            'SELECT * FROM `unmarked_essay_answers` WHERE assessment_id = ' +
            req.params.assessmentId;
        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.json(results.length);
            } catch (err) {
                next(err);
            }
        });
    }
});

/**
 * Add Unmarked Essay Answer
 *
 * @return response()
 */
router.post('/add/essay/:assessmentId', (req, res, next) => {
    if (req.session.userName) {
        // No need to escape single quotes for SQL to accept,
        // as using '?'.
        // Add data.
        let data = {};
        data = {
            assessment_id: req.params.assessmentId,
            answer: req.body.answer,
            question_id: req.body.questionId
        };
        let sqlQuery = 'INSERT INTO unmarked_essay_answers SET ?';
        conn.query(sqlQuery, data, (err, results) => {
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

/**
 * Add Unmarked Image Answer
 *
 * @return response()
 */
router.post('/add/image/:assessmentId', (req, res, next) => {
    if (req.session.userName) {
        let questionId = req.body.questionId;
        let assessmentId = req.params.assessmentId;
        let answer = req.body.answer;
        // There may be from 1 to 5 answers.
        let answer_1, answer_2, answer_3, answer_4, answer_5;
        if (answer[0]) {
            answer_1 = answer[0];
        } else {
            answer_1 = '';
        }
        if (answer[1]) {
            answer_2 = answer[1];
        } else {
            answer_2 = '';
        }
        if (answer[2]) {
            answer_3 = answer[2];
        } else {
            answer_3 = '';
        }
        if (answer[3]) {
            answer_4 = answer[3];
        } else {
            answer_4 = '';
        }
        if (answer[4]) {
            answer_5 = answer[4];
        } else {
            answer_5 = '';
        }

        let sqlQuery = `INSERT INTO unmarked_image_answers 
        (assessment_id, answer_1, answer_2, answer_3, answer_4, answer_5, question_id)
        VALUES (${assessmentId}, '${answer_1}', '${answer_2}', '${answer_3}' ,'${answer_4}' ,'${answer_5}' , ${questionId});`;

        conn.query(sqlQuery, (err) => {
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

/**
 * Delete Item
 *
 * @return response()
 */
router.delete('/delete/:assessmentId', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery =
            'DELETE FROM unmarked_essay_answers WHERE assessment_id=' +
            req.params.assessmentId;
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

router.delete('/:id', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery =
            'DELETE FROM unmarked_essay_answers WHERE id=' + req.params.id;
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
