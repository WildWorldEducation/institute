const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bodyParser = require('body-parser');

router.use(bodyParser.json());

/*------------------------------------------
--------------------------------------------
Database Connection
--------------------------------------------
--------------------------------------------*/
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'C0ll1ns1n5t1tut32022',
    password: 'password',
    database: 'skill_tree'
});

/*------------------------------------------
--------------------------------------------
Shows Mysql Connect
--------------------------------------------
--------------------------------------------*/
conn.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MariaDB connected...');
});

/**
 * Delete Item
 *
 * @return response()
 */
// Delete multiple choice question.
router.delete('/mc/:id', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = 'DELETE FROM mc_questions WHERE id=' + req.params.id;
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

// Delete essay question.
router.delete('/essay/:id', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = 'DELETE FROM essay_questions WHERE id=' + req.params.id;
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

/**
 * Show Item
 *
 * @return response()
 */
// Show MC question.
router.get('/mc/show/:id', (req, res) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = 'SELECT * FROM mc_questions WHERE id=' + req.params.id;
        let query = conn.query(sqlQuery, (err, results) => {
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

// Show essay question.
router.get('/essay/show/:id', (req, res) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery =
            'SELECT * FROM essay_questions WHERE id=' + req.params.id;
        let query = conn.query(sqlQuery, (err, results) => {
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
 * Update Item
 *
 * @return response()
 */
// MC questions
router.put('/mc/:id/edit', (req, res, next) => {
    if (req.session.userName) {
        let name;
        let question;
        let correctAnswer;
        let incorrectAnswer1;
        let incorrectAnswer2;
        let incorrectAnswer3;
        let incorrectAnswer4;
        let explanation;
        // Escape single quotes for SQL to accept.
        if (req.body.name != null) name = req.body.name.replace(/'/g, "\\'");
        if (req.body.question != null)
            question = req.body.question.replace(/'/g, "\\'");
        if (req.body.correct_answer != null)
            correctAnswer = req.body.correct_answer.replace(/'/g, "\\'");
        if (req.body.incorrect_answer_1 != null)
            incorrectAnswer1 = req.body.incorrect_answer_1.replace(/'/g, "\\'");
        if (req.body.incorrect_answer_2 != null)
            incorrectAnswer2 = req.body.incorrect_answer_2.replace(/'/g, "\\'");
        if (req.body.incorrect_answer_3 != null)
            incorrectAnswer3 = req.body.incorrect_answer_3.replace(/'/g, "\\'");
        if (req.body.incorrect_answer_4 != null)
            incorrectAnswer4 = req.body.incorrect_answer_4.replace(/'/g, "\\'");
        if (req.body.explanation != null)
            explanation = req.body.explanation.replace(/'/g, "\\'");

        // Add data.
        let sqlQuery =
            `UPDATE mc_questions 
        SET name='` +
            name +
            `', question = '` +
            question +
            `', correct_answer = '` +
            correctAnswer +
            `', incorrect_answer_1 = '` +
            incorrectAnswer1 +
            `', incorrect_answer_2 = '` +
            incorrectAnswer2 +
            `', incorrect_answer_3 = '` +
            incorrectAnswer3 +
            `', incorrect_answer_4 = '` +
            incorrectAnswer4 +
            `', explanation = '` +
            explanation +
            `' WHERE id = ` +
            req.params.id;
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

// Essay questions
router.put('/essay/:id/edit', (req, res, next) => {
    if (req.session.userName) {
        let name;
        let question;
        // Escape single quotes for SQL to accept.
        if (req.body.name != null) name = req.body.name.replace(/'/g, "\\'");
        if (req.body.question != null)
            question = req.body.question.replace(/'/g, "\\'");

        // Add data.
        let sqlQuery =
            `UPDATE essay_questions 
        SET name='` +
            name +
            `', question = '` +
            question +
            `' WHERE id = ` +
            req.params.id;
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

// Dynamically create assessments.
// Load multiple choice type questions.
router.get('/:skillId/multiple-choice', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery =
            'SELECT * FROM mc_questions WHERE skill_id = ' + req.params.skillId;
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

// Load essay type questions.
router.get('/:skillId/essay', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery =
            'SELECT * FROM essay_questions WHERE skill_id = ' +
            req.params.skillId;
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

// TODO: find out where this is used, if at all.
// Load all essay type questions.
router.get('/essay/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = 'SELECT * FROM essay_questions;';
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

/**
 * Create New MC Question Manually (not from CSV.)
 *
 * @return response()
 */
router.post('/mc-questions/add', (req, res, next) => {
    if (req.session.userName) {
        // No need to escape single quotes for SQL to accept,
        // as using '?'.
        // Add data.
        let data = {};
        data = {
            name: req.body.name,
            question: req.body.question,
            correct_answer: req.body.correct_answer,
            incorrect_answer_1: req.body.incorrect_answer_1,
            incorrect_answer_2: req.body.incorrect_answer_2,
            incorrect_answer_3: req.body.incorrect_answer_3,
            incorrect_answer_4: req.body.incorrect_answer_4,
            explanation: req.body.explanation,
            skill_id: req.body.skill_id
        };

        let sqlQuery = 'INSERT INTO mc_questions SET ?';
        let query = conn.query(sqlQuery, data, (err, results) => {
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
 * Create New Essay Question Manually (not from CSV.)
 *
 * @return response()
 */
router.post('/essay-questions/add', (req, res, next) => {
    if (req.session.userName) {
        // No need to escape single quotes for SQL to accept,
        // as using '?'.
        // Add data.
        let data = {};
        data = {
            name: req.body.name,
            question: req.body.question,
            skill_id: req.body.skill_id
        };

        let sqlQuery = 'INSERT INTO essay_questions SET ?';
        let query = conn.query(sqlQuery, data, (err, results) => {
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
 * Bulk add MC questions from file.
 *
 * @return response()
 */
router.post('/mc-questions/bulk-add', (req, res, next) => {
    if (req.session.userName) {
        // For each question.
        // No need to escape single quotes for SQL to accept,
        // as using '?'.
        for (let i = 0; i < req.body.questionArray.length; i++) {
            // Add the questions.
            let data = {};
            // Trim whitespace off the CSVs (Generative AI adds whitespace to the questions).
            data = {
                name: req.body.questionArray[i].name.trim(),
                question: req.body.questionArray[i].question.trim(),
                correct_answer: req.body.questionArray[i].correct_answer.trim(),
                incorrect_answer_1:
                    req.body.questionArray[i].incorrect_answer_1.trim(),
                incorrect_answer_2:
                    req.body.questionArray[i].incorrect_answer_2.trim(),
                incorrect_answer_3:
                    req.body.questionArray[i].incorrect_answer_3.trim(),
                incorrect_answer_4:
                    req.body.questionArray[i].incorrect_answer_4.trim(),
                explanation: req.body.questionArray[i].explanation.trim(),
                skill_id: req.body.questionArray[i].skillId
            };
            let sqlQuery = `INSERT INTO mc_questions SET ?`;
            let query = conn.query(sqlQuery, data, (err, results) => {
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
        }
    } else {
        res.redirect('/login');
    }
});

module.exports = router;
