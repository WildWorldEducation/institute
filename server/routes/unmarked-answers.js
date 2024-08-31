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
        // No need to escape single quotes for SQL to accept,
        // as using '?'.
        // Add data.
        let data = {};
        data = {
            assessment_id: req.params.assessmentId,
            answer: req.body.answer,
            question_id: req.body.questionId
        };
        let sqlQuery = 'INSERT INTO unmarked_image_answers SET ?';
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
