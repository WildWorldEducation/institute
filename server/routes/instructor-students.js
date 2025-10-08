/*------------------------------------------
--------------------------------------------
Middleware.
--------------------------------------------
--------------------------------------------*/
//Middlewares
const isAuthenticated = require('../middlewares/authMiddleware');
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
                res.status = 200;
                res.json({ message: 'success' })
                res.end();
            } catch (err) {
                next(err);
            }
        });
    }
});
// Assign new teacher for a student
router.put(
    '/change-teacher/:teacherId/:userId',
    isAuthenticated,
    (req, res, next) => {
        try {
            let sql = `UPDATE instructor_students
                           SET instructor_id = ${conn.escape(req.params.teacherId)}
                           WHERE student_id = ${conn.escape(req.params.userId)}`;

            conn.query(sql, (err, results) => {
                try {
                    if (err) {
                        throw err;
                    }
                    res.json(results);
                } catch (err) {
                    next(err);
                }
            });
        } catch (err) {
            next(err);
        }
    }
);
// Export the router for app to use.
module.exports = router;
