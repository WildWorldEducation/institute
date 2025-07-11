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
// for querying DB
const util = require('util');
const query = util.promisify(conn.query).bind(conn);

/*------------------------------------------
--------------------------------------------
Routes
--------------------------------------------
--------------------------------------------*/

/**
 * Assessment reports ----------------
 *
 */
/**
 * per student
 */

// /* Get the skill activity of the student */
// router.get('/last-visited-skills/:studentId', async (req, res, next) => {
//     if (req.session.userName) {
//         let sqlQuery = `
//             SELECT skills.id, name, skills.url, level, icon, last_visited_date
//             FROM user_skills
//             INNER JOIN skills
//             ON skills.id = user_skills.skill_id
//             WHERE user_id = ${conn.escape(req.params.studentId)}
//             AND skills.is_deleted = 0
//             ORDER BY last_visited_date DESC;
//         `;

//         conn.query(sqlQuery, (err, results) => {
//             if (err) return next(err); // Pass error to error handler

//             if (results.length === 0) {
//                 return res.status(404).json({ error: 'No recent skills' });
//             }

//             res.json(results);
//         });
//     }
// });

/* Get skills whose assessments have been started, but are not yet mastered */
router.get(
    '/started-unmastered-assessments/:studentId',
    async (req, res, next) => {
        if (req.session.userName) {
            let sqlQuery = `            
                SELECT assessment_attempts.id, url, name, date
                    FROM assessment_attempts
                    JOIN skills ON skills.id = assessment_attempts.skill_id
                    WHERE assessment_attempts.user_id = ${conn.escape(
                        req.params.studentId
                    )};                      
           `;

            conn.query(sqlQuery, (err, results) => {
                if (err) return next(err); // Pass error to error handler

                if (results.length === 0) {
                    return res.status(404).json({
                        error: 'No started unmastered assessments'
                    });
                }

                res.json(results);
            });
        }
    }
);

/* Get mastered skills, though not domains/categories */
router.get('/mastered-skills/:studentId', (req, res, next) => {
    // Check if logged in.
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
            SELECT skills.id, name, url, level, user_skills.mastered_date AS date
            FROM skills
            LEFT OUTER JOIN user_skills
            ON skills.id = user_skills.skill_id            
            WHERE user_skills.user_id = ${conn.escape(req.params.studentId)}
            AND is_mastered = 1
            AND type <> 'domain'
            ORDER BY id;`;

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

/* Get assessments that have been failed multiple times, and not yet passed */
router.get('/multiple-fails/:studentId', (req, res, next) => {
    // Check if logged in.
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
            SELECT skills.id, skills.name, COUNT(name) AS quantity
                    FROM assessment_attempts
                    JOIN skills ON skills.id = assessment_attempts.skill_id
                    WHERE assessment_attempts.user_id = ${conn.escape(
                        req.params.studentId
                    )}
					AND assessment_attempts.skill_id NOT IN 
                    (SELECT skill_id
                    FROM user_skills
                    WHERE user_skills.user_id = ${conn.escape(
                        req.params.studentId
                    )}
                    AND is_mastered = 1)  
                    group by id, name
                    HAVING COUNT(*) > 1;`;

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
 * Per cohort ------
 */
/* Get mastered skills, though not domains/categories */
router.get('/mastered-skills/cohort/:cohortId', (req, res, next) => {
    // Check if logged in.
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
            SELECT COUNT(*) as quantity, users.username AS name
            FROM user_skills
            JOIN skills
            ON skills.id = user_skills.skill_id            
            JOIN cohorts_users
            ON user_skills.user_id = cohorts_users.user_id
            JOIN users
            ON user_skills.user_id = users.id     
            WHERE cohorts_users.cohort_id = ${conn.escape(req.params.cohortId)}
            AND is_mastered = 1
            AND type <> 'domain'
            GROUP BY user_skills.user_id
            ORDER BY quantity DESC;`;

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
 * ---------------------------------------------------------------
 */

/**
 * All students of an instructors ------
 */
/* Get mastered skills, though not domains/categories */
router.get('/mastered-skills/all-students/:userId', (req, res, next) => {
    // Check if logged in.
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
            SELECT COUNT(*) as quantity, users.username AS name
            FROM user_skills
            JOIN skills
            ON skills.id = user_skills.skill_id            
            JOIN instructor_students
            ON user_skills.user_id = instructor_students.student_id
            JOIN users
            ON user_skills.user_id = users.id     
            WHERE instructor_students.instructor_id = ${conn.escape(req.params.userId)}
            AND is_mastered = 1
            AND type <> 'domain'
            GROUP BY user_skills.user_id
            ORDER BY quantity DESC;`;

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
 * ---------------------------------------------------------------
 */

/**
 * Record time per skill
 *
 */
router.post('/record-duration/:userId/:skillId', (req, res, next) => {
    if (req.session.userName) {
        const duration = req.body.duration;

        let sqlQuery = `
        INSERT INTO user_skills (user_id, skill_id, duration) 
        VALUES(${conn.escape(req.params.userId)}, ${conn.escape(
            req.params.skillId
        )}, ${conn.escape(duration)}) 
        ON DUPLICATE KEY UPDATE duration= duration + ${conn.escape(duration)};
        `;

        conn.query(sqlQuery, (err) => {
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

/* Get time spent on each skill per student */
router.get('/skill-durations/:studentId', (req, res, next) => {
    // Check if logged in.
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
            SELECT skills.id, name, url, level, icon, type, duration AS quantity
            FROM skills
            LEFT OUTER JOIN user_skills
            ON skills.id = user_skills.skill_id
            WHERE user_skills.user_id = ${conn.escape(
                req.params.studentId
            )}            
            AND type <> 'domain'
            AND duration > 0
            ORDER BY id;`;

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

/* Get time spent on all skills per student */
router.get('/all-skills-duration/:studentId', (req, res, next) => {
    // Check if logged in.
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
            SELECT SUM(duration) as duration
            FROM skills
            LEFT OUTER JOIN user_skills
            ON skills.id = user_skills.skill_id
            WHERE user_skills.user_id = ${conn.escape(
                req.params.studentId
            )}            
            AND type <> 'domain'
            AND duration > 0
            ORDER BY id;`;

        conn.query(sqlQuery, (err, result) => {
            try {
                if (err) {
                    throw err;
                }

                res.json(result[0]);
            } catch (err) {
                next(err);
            }
        });
    }
});

/* Skill Activity report 
   Get the start and end time for each skill per user 
*/
router.get('/skill-activity-report/:studentId', (req, res, next) => {
    // Check if logged in.
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
            SELECT skills.id AS id, name, url, mastered_date, first_visited_date AS startDate, last_visited_date AS endDate
            FROM user_skills
            JOIN skills
            ON user_skills.skill_id = skills.id
            WHERE user_id = ${conn.escape(req.params.studentId)}
            AND first_visited_date IS NOT NULL    
            AND skills.type <> 'domain'
            ORDER BY endDate DESC
        ;`;

        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                if (results.length === 0) {
                    return res.status(404).json({
                        error: 'No skill activity'
                    });
                }

                res.json(results);
            } catch (err) {
                next(err);
            }
        });
    }
});

// Export the router for app to use.
module.exports = router;
