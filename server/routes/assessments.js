const express = require('express');

// Router.
const router = express.Router();

// Middleware.
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
    //password: 'password',
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
 * Get All Items
 *
 * @return response()
 */
router.get('/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = 'SELECT * FROM unmarked_assessments';
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
 * Add Item
 *
 * @return response()
 */
router.post('/:studentId/:skillId', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        // Get the current date and time.
        var date = new Date().toISOString().slice(0, 19).replace('T', ' ');
        let sqlQuery =
            `
        INSERT INTO skill_tree.unmarked_assessments (student_id, skill_id, total_score, current_score, num_unmarked_questions_remaining, date) 
        VALUES(` +
            req.params.studentId +
            `, ` +
            req.params.skillId +
            `, ` +
            req.body.totalScore +
            `, ` +
            req.body.currentScore +
            `, ` +
            req.body.numUnmarkedQuestions +
            `, '` +
            date +
            `')
        ON DUPLICATE KEY UPDATE 
        total_score = VALUES(total_score), 
        current_score = VALUES(current_score), 
        date = VALUES(date);`;

        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                } else {
                    // If both the username and password are not correct, check if the account exists.
                    let sqlQuery2 =
                        `SELECT id FROM skill_tree.unmarked_assessments
                     WHERE skill_tree.unmarked_assessments.student_id = ` +
                        req.params.studentId +
                        `
                        AND skill_tree.unmarked_assessments.skill_id = ` +
                        req.params.skillId +
                        `;`;

                    let query2 = conn.query(sqlQuery2, (err, results) => {
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
        sqlQuery =
            `UPDATE unmarked_assessments SET current_score = current_score + 1, num_unmarked_questions_remaining = num_unmarked_questions_remaining - 1 WHERE id = ` +
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

router.put('/:id/decrease-grade', (req, res, next) => {
    if (req.session.userName) {
        var sqlQuery;
        sqlQuery =
            `UPDATE unmarked_assessments SET num_unmarked_questions_remaining = num_unmarked_questions_remaining - 1 WHERE id = ` +
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

/**
 * Delete Item
 *
 * @return response()
 */
router.delete('/:id', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery =
            'DELETE FROM unmarked_assessments WHERE id=' + req.params.id;
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
 * Add Item
 *
 * @return response()
 */
router.put('/:studentId/:skillId', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        var date = new Date().toISOString().slice(0, 19).replace('T', ' ');
        let sqlQuery = `
        UPDATE skill_tree.unmarked_assessments 
        SET total_score = ${req.body.totalScore}, current_score = ${req.body.currentScore}, num_unmarked_questions_remaining = ${req.body.numUnmarkedQuestions}, date = '${date}'
        WHERE student_id = '${req.params.studentId}' AND skill_id = '${req.params.skillId}'
        `;

        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                } else {
                    // If both the username and password are not correct, check if the account exists.
                    let sqlQuery2 =
                        `SELECT id FROM skill_tree.unmarked_assessments
                     WHERE skill_tree.unmarked_assessments.student_id = ` +
                        req.params.studentId +
                        `
                        AND skill_tree.unmarked_assessments.skill_id = ` +
                        req.params.skillId +
                        `;`;

                    let query2 = conn.query(sqlQuery2, (err, results) => {
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
