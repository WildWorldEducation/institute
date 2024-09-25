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
 * Get All Items
 *
 * @return response()
 */
router.get('/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = 'SELECT * FROM unmarked_assessments';
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
 * Add Item
 *
 * @return response()
 */
router.post('/:studentId/:skillId', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        // Get the current date and time.
        var date = new Date().toISOString().slice(0, 19).replace('T', ' ');
        let sqlQuery = `INSERT INTO unmarked_assessments (student_id, skill_id, total_score, current_score, num_unmarked_questions_remaining, date) 
        VALUES(${conn.escape(req.params.studentId)},
        ${conn.escape(req.params.skillId)},
        ${conn.escape(req.body.totalScore)},
        ${conn.escape(req.body.currentScore)},
        ${conn.escape(req.body.numUnmarkedQuestions)},
        ${conn.escape(date)})
        ON DUPLICATE KEY UPDATE 
        total_score = VALUES(total_score), 
        current_score = VALUES(current_score), 
        date = VALUES(date);`;

        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                } else {
                    // If both the username and password are not correct, check if the account exists.
                    let sqlQuery2 = `SELECT id FROM unmarked_assessments
                     WHERE unmarked_assessments.student_id = ${conn.escape(
                         req.params.studentId
                     )}
                     AND unmarked_assessments.skill_id = ${conn.escape(
                         req.params.skillId
                     )};`;

                    conn.query(sqlQuery2, (err, results) => {
                        try {
                            if (err) {
                                throw err;
                            } else {
                                res.json(results[0]);
                            }
                        } catch (err) {
                            next(err);
                        }
                    });
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
 * Edit Item
 *
 * @return response()
 */
router.put('/:id/increase-grade', (req, res, next) => {
    if (req.session.userName) {
        var sqlQuery;
        sqlQuery = `UPDATE unmarked_assessments 
        SET current_score = current_score + 1, num_unmarked_questions_remaining = num_unmarked_questions_remaining - 1 
        WHERE id = ${conn.escape(req.params.id)};`;

        conn.query(sqlQuery, (err, results) => {
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

router.put('/:id/decrease-grade', (req, res, next) => {
    if (req.session.userName) {
        var sqlQuery;
        sqlQuery = `UPDATE unmarked_assessments 
            SET num_unmarked_questions_remaining = num_unmarked_questions_remaining - 1 
            WHERE id = ${conn.escape(req.params.id)};`;

        conn.query(sqlQuery, (err, results) => {
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
 * Delete Item
 *
 * @return response()
 */
router.delete('/:id', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = `DELETE FROM unmarked_assessments 
            WHERE id = ${conn.escape(req.params.id)};`;

        conn.query(sqlQuery, (err, results) => {
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
 * Add Item
 *
 * @return response()
 */
router.put('/:studentId/:skillId', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        var date = new Date().toISOString().slice(0, 19).replace('T', ' ');
        let sqlQuery = `
        UPDATE unmarked_assessments 
        SET total_score = ${conn.escape(
            req.body.totalScore
        )}, current_score = ${conn.escape(req.body.currentScore)},
         num_unmarked_questions_remaining = ${conn.escape(
             req.body.numUnmarkedQuestions
         )}, 
         date = ${conn.escape(date)}
        WHERE student_id = ${conn.escape(req.params.studentId)} 
        AND skill_id = ${conn.escape(req.params.skillId)};`;

        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                } else {
                    // If both the username and password are not correct, check if the account exists.
                    let sqlQuery2 = `SELECT id FROM unmarked_assessments
                     WHERE unmarked_assessments.student_id = ${conn.escape(
                         req.params.studentId
                     )}
                     AND unmarked_assessments.skill_id = ${conn.escape(
                         req.params.skillId
                     )};`;

                    conn.query(sqlQuery2, (err, results) => {
                        try {
                            if (err) {
                                throw err;
                            } else {
                                res.json(results[0]);
                            }
                        } catch (err) {
                            next(err);
                        }
                    });
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
