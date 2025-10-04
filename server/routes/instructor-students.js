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
        let sqlQuery = 'SELECT * FROM `instructor_students`;';
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
 * Get All Students of a Particular Instructor
 *
 * @return response()
 */
router.get('/:instructorId/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT users.id, username 
        FROM users
        JOIN instructor_students
        ON users.id = instructor_students.student_id
        WHERE instructor_students.instructor_id = ${conn.escape(
            req.params.instructorId
        )}
        AND users.is_deleted = 0;`;

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
 * Get Is Skills Locked
 *
 * @return response()
 */
router.get('/:studentId/is-skills-locked', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT is_skills_locked
        FROM instructor_students
        WHERE student_id = '${req.params.studentId}';`;
        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.json(results[0].is_skills_locked);
            } catch (err) {
                next(err);
            }
        });
    }
});

/**
 * Update whether student's skills are locked or not.
 */
router.put('/:userId/update-locked-skills', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = `
        UPDATE instructor_students
        SET is_skills_locked = ${req.body.isSkillsLocked}
        WHERE student_id = '${req.params.userId}';
        `;

        conn.query(sqlQuery, (err) => {
            try {
                if (err) {
                    throw err;
                }

                if (req.body.isSkillsLocked == 1) {
                    // make sure that the "Unlocked Skills Only" filter is turned off
                    // if the instructor locks the student's skills
                    // otherwise the student won't be able to see all skills
                    let sqlQuery2 = `
                        UPDATE users
                        SET is_unlocked_skills_only_filter = 0
                        WHERE id = '${req.params.userId}';
                        `;

                    conn.query(sqlQuery2, (err) => {
                        if (err) {
                            throw err;
                        }
                        res.end();
                    });
                }
                else {
                    res.end();
                }
            } catch (err) {
                next(err);
            }
        });
    }
});

// Export the router for app to use.
module.exports = router;
