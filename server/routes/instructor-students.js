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
// Promisified query for async authorization checks.
const util = require('util');
const query = util.promisify(conn.query).bind(conn);

/*------------------------------------------
--------------------------------------------
Authorization helpers
--------------------------------------------
--------------------------------------------*/

// Roles that may manage any student's records without an explicit mapping.
const ADMIN_ROLES = ['platform_admin', 'school_admin'];

/**
 * Ownership guard for mutating student routes.
 * Allows the request only if the acting user is a platform/school admin,
 * or is the instructor mapped to the target student via instructor_students.
 * Target student id is read from :userId (falling back to :studentId).
 */
async function canManageStudent(req, res, next) {
    try {
        if (ADMIN_ROLES.includes(req.session.role)) {
            return next();
        }
        const studentId = req.params.userId || req.params.studentId;
        const rows = await query(
            'SELECT 1 FROM instructor_students WHERE instructor_id = ? AND student_id = ? LIMIT 1;',
            [req.session.userId, studentId]
        );
        if (rows && rows.length > 0) {
            return next();
        }
        return res.status(403).json({ message: 'Forbidden' });
    } catch (err) {
        return next(err);
    }
}

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
        WHERE student_id = ?;`;
        conn.query(sqlQuery, [req.params.studentId], (err, results) => {
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
router.put(
    '/:userId/update-locked-skills',
    isAuthenticated,
    canManageStudent,
    (req, res, next) => {
        // Coerce to a strict 0/1 integer to avoid injection and invalid values.
        const isSkillsLocked = req.body.isSkillsLocked == 1 ? 1 : 0;

        let sqlQuery = `
        UPDATE instructor_students
        SET is_skills_locked = ?
        WHERE student_id = ?;
        `;

        conn.query(sqlQuery, [isSkillsLocked, req.params.userId], (err) => {
            try {
                if (err) {
                    throw err;
                }

                if (isSkillsLocked === 1) {
                    // make sure that the "Unlocked Skills Only" filter is turned off
                    // if the instructor locks the student's skills
                    // otherwise the student won't be able to see all skills
                    let sqlQuery2 = `
                        UPDATE users
                        SET is_unlocked_skills_only_filter = 0
                        WHERE id = ?;
                        `;

                    conn.query(sqlQuery2, [req.params.userId], (err) => {
                        if (err) {
                            throw err;
                        }
                        res.end();
                    });
                } else {
                    res.end();
                }
            } catch (err) {
                next(err);
            }
        });
    }
);
// Assign new teacher for a student
router.put(
    '/change-teacher/:teacherId/:userId',
    isAuthenticated,
    canManageStudent,
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
