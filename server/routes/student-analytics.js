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
const {
    getSkillListRootParent
} = require('../utilities/skill-relate-functions');

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
 * PER STUDENT --------------------------------------
 */
/* Get skills whose assessments have been started, but are not yet mastered */
router.get(
    '/started-unmastered-assessments/:studentId',
    async (req, res, next) => {
        if (req.session.userName) {
            let sqlQuery = `            
                SELECT assessment_attempts.id, url, name, date, level
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
            SELECT skills.id, name, url, level, skills.parent, user_skills.last_visited_date, user_skills.mastered_date
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
                // sqlQuery = `SELECT skills.id, name, url, level, skills.parent, user_skills.last_visited_date, user_skills.mastered_date
                //             FROM skills
                //             LEFT OUTER JOIN user_skills
                //             ON skills.id = user_skills.skill_id
                //             WHERE user_skills.user_id = ${conn.escape(
                //                 req.params.studentId
                //             )}`;
                // conn.query(sqlQuery, (err, fullSkillList) => {
                //     if (err) {
                //         throw err;
                //     }
                // const skillWithRootParent = getSkillListRootParent(
                //     results,
                //     fullSkillList
                // );
                // });
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
            AND TIMESTAMPDIFF(SECOND, first_visited_date, last_visited_date) > 120
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

/* Get duration on platform per student per day */
router.get('/student-duration-per-day/:studentId', (req, res, next) => {
    // Check if logged in.
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
            SELECT date, duration AS quantity
            FROM user_duration_per_day            
            WHERE user_id = ${conn.escape(
                req.params.studentId
            )}                           
            ORDER BY date ASC;`;

        conn.query(sqlQuery, (err, result) => {
            try {
                if (err) {
                    throw err;
                }

                res.json(result);
            } catch (err) {
                next(err);
            }
        });
    }
});

/* Get student progress (number of total skills mastered over time) */
router.get('/student-progress/:studentId', (req, res, next) => {
    // Check if logged in.
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        // First, get the date the student started on the platform
        let firstInteractionSQLQuery = `SELECT date
            FROM user_duration_per_day
            WHERE user_id = ${conn.escape(req.params.studentId)}  
            ORDER BY date ASC
            LIMIT 1;`;

        conn.query(firstInteractionSQLQuery, (err, firstInteractionResult) => {
            try {
                if (err) {
                    throw err;
                }

                if (firstInteractionResult.length === 0) {
                    return res.status(404).json({
                        error: 'No skill activity'
                    });
                }

                let sqlQuery = `
                    SELECT CAST(mastered_date AS DATE) AS date, SUM(COUNT(*)) OVER(ORDER BY date) AS quantity
                    FROM user_skills
                    JOIN skills
                    ON skills.id = user_skills.skill_id
                    WHERE is_mastered = 1
                    AND user_id = ${conn.escape(req.params.studentId)}        
                    AND type <> 'domain'      
                    GROUP BY date
                    ORDER BY date ASC;`;

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

                        let flag = false;
                        for (let i = 0; i < results.length; i++) {
                            if (
                                firstInteractionResult[0].date ==
                                results[i].date
                            ) {
                                flag = true;
                            }
                        }

                        if (!flag) {
                            results.unshift({
                                date: firstInteractionResult[0].date,
                                quantity: 0
                            });
                        }

                        res.json(results);
                    } catch (err) {
                        next(err);
                    }
                });
            } catch (err) {
                next(err);
            }
        });
    }
});

router.get(
    '/avg-tokens-to-master-skills/student/:studentId',
    (req, res, next) => {
        // Check if logged in.
        if (req.session.userName) {
            res.setHeader('Content-Type', 'application/json');

            let sqlQuery = `
                SELECT token_count AS quantity, skills.name AS name  
                FROM user_skills                
                JOIN skills
                ON skills.id = user_skills.skill_id                       
                AND user_skills.user_id = ${conn.escape(req.params.studentId)}
                AND token_count > 0
				ORDER BY quantity DESC;        
            `;

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
    }
);

/**
 * PER COHORT -------------------------------------------------
 */
/**
 * Get number of skills each student in cohort has failed more than once
 * and has not mastered.
 **/
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
 * Get number of skills each student in cohort has failed more than once
 * and has not mastered.
 **/
router.get('/failed-assessments/cohort/:cohortId', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
            SELECT name, COUNT(name) AS quantity
            FROM
                (SELECT username AS name, COUNT(assessment_attempts.skill_id) AS quantity
                FROM assessment_attempts
                JOIN cohorts_users
                ON assessment_attempts.user_id = cohorts_users.user_id
                JOIN users
                ON users.id = assessment_attempts.user_id
                WHERE cohorts_users.cohort_id = ${conn.escape(
                    req.params.cohortId
                )}
                AND assessment_attempts.skill_id NOT IN
                    (SELECT DISTINCT user_skills.skill_id
                    FROM user_skills
                    JOIN assessment_attempts
                    ON user_skills.user_id = assessment_attempts.user_id 
                    WHERE is_mastered = 1)
                GROUP by assessment_attempts.skill_id, users.username
                HAVING COUNT(assessment_attempts.skill_id) > 1) AS subquery
            GROUP BY name;`;

        conn.query(sqlQuery, (err, results) => {
            if (err) {
                console.error('SQL Error in cohort failed assessments:', err);
                return res
                    .status(500)
                    .json({ error: 'Database error', details: err.message });
            }

            if (!results || results.length === 0) {
            }

            const cleanResults = results.map((row) => ({
                name: row.name || 'Unknown Student',
                quantity: parseInt(row.quantity, 10) || 0
            }));

            res.json(cleanResults);
        });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

/* Attempted assessments per cohort
 */
router.get('/attempted-assessments/cohort/:cohortId', (req, res, next) => {
    // Check if logged in.
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
            SELECT COUNT(*) AS quantity, username AS name
            FROM assessment_attempts
            JOIN users
            ON assessment_attempts.user_id = users.id
            JOIN cohorts_users
            ON assessment_attempts.user_id = cohorts_users.user_id
            WHERE cohorts_users.cohort_id = ${conn.escape(req.params.cohortId)}
            GROUP BY username
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

/* Get duration on platform per cohort per day */
router.get('/cohort-duration-per-day/:cohortId', (req, res, next) => {
    // Check if logged in.
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
            SELECT date, SUM(duration) AS quantity
            FROM user_duration_per_day
            JOIN cohorts_users
            ON user_duration_per_day.user_id = cohorts_users.user_id
            WHERE cohorts_users.cohort_id = ${conn.escape(
                req.params.cohortId
            )}              
            GROUP BY date
            ORDER BY date ASC;`;

        conn.query(sqlQuery, (err, result) => {
            try {
                if (err) {
                    throw err;
                }

                res.json(result);
            } catch (err) {
                next(err);
            }
        });
    }
});

/* Get all student in cohort total durations */
router.get('/cohort-total-durations/:cohortId', (req, res, next) => {
    // Check if logged in.
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
         SELECT username AS name, SUM(duration) AS quantity
            FROM user_duration_per_day
            JOIN cohorts_users
            ON user_duration_per_day.user_id = cohorts_users.user_id
            JOIN users
            ON users.id = user_duration_per_day.user_id
            WHERE cohorts_users.cohort_id = ${conn.escape(
                req.params.cohortId
            )}              
            GROUP BY cohorts_users.user_id;`;

        conn.query(sqlQuery, (err, result) => {
            try {
                if (err) {
                    throw err;
                }

                res.json(result);
            } catch (err) {
                next(err);
            }
        });
    }
});

/* Get all student in cohort durations per skill*/
router.get(
    '/cohort-student-durations-per-skill/:cohortId',
    (req, res, next) => {
        // Check if logged in.
        if (req.session.userName) {
            res.setHeader('Content-Type', 'application/json');

            let sqlQuery = `
            SELECT skills.name, SUM(duration) AS quantity
            FROM user_skills            
            JOIN cohorts_users
            ON user_skills.user_id = cohorts_users.user_id
			JOIN skills
            ON skills.id = user_skills.skill_id
            WHERE cohorts_users.cohort_id = ${conn.escape(
                req.params.cohortId
            )}              
            GROUP BY skills.name
            HAVING quantity > 0
            ORDER BY quantity DESC;`;

            conn.query(sqlQuery, (err, result) => {
                try {
                    if (err) {
                        throw err;
                    }

                    res.json(result);
                } catch (err) {
                    next(err);
                }
            });
        }
    }
);

/* Get cohort progress (number of total skills mastered over time) */
router.get('/cohort-progress/:cohortId', (req, res, next) => {
    // Check if logged in.
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        // First, get the date the first student in the cohort student started on the platform
        let firstInteractionSQLQuery = `
            SELECT date
            FROM user_duration_per_day
            JOIN cohorts_users
            ON cohorts_users.user_id = user_duration_per_day.user_id
            WHERE cohort_id = ${conn.escape(req.params.cohortId)}  
            ORDER BY date ASC
            LIMIT 1;`;

        conn.query(firstInteractionSQLQuery, (err, firstInteractionResult) => {
            try {
                if (err) {
                    throw err;
                }

                if (firstInteractionResult.length === 0) {
                    return res.status(404).json({
                        error: 'No skill activity'
                    });
                }

                let sqlQuery = `
                    SELECT CAST(mastered_date AS DATE) AS date, SUM(COUNT(*)) OVER(ORDER BY date) AS quantity
                    FROM user_skills
                    JOIN cohorts_users
                    ON cohorts_users.user_id = user_skills.user_id
                    JOIN skills
                    ON skills.id = user_skills.skill_id
                    WHERE is_mastered = 1
                    AND cohort_id = ${conn.escape(req.params.cohortId)}        
                    AND type <> 'domain'      
                    GROUP BY date
                    ORDER BY date ASC;`;

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

                        let flag = false;
                        for (let i = 0; i < results.length; i++) {
                            if (
                                firstInteractionResult[0].date ==
                                results[i].date
                            ) {
                                flag = true;
                            }
                        }

                        if (!flag) {
                            results.unshift({
                                date: firstInteractionResult[0].date,
                                quantity: 0
                            });
                        }

                        res.json(results);
                    } catch (err) {
                        next(err);
                    }
                });
            } catch (err) {
                next(err);
            }
        });
    }
});

/**
 * FOR ALL STUDENTS OF AN INSTRUCTOR -------------------------------------------------------
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
            WHERE instructor_students.instructor_id = ${conn.escape(
                req.params.userId
            )}
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
 * Get failed assessments per student for all students of an instructor
 **/
router.get('/failed-assessments/all-students/:userId', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
        SELECT name, COUNT(name) AS quantity
        FROM
            (SELECT username AS name, COUNT(assessment_attempts.skill_id) AS quantity
            FROM assessment_attempts
            JOIN instructor_students
            ON assessment_attempts.user_id = instructor_students.student_id
            JOIN users
            ON users.id = assessment_attempts.user_id
            WHERE instructor_students.instructor_id = ${conn.escape(
                req.params.userId
            )}
            AND assessment_attempts.skill_id NOT IN
                (SELECT DISTINCT user_skills.skill_id
                FROM user_skills
                JOIN assessment_attempts
                ON user_skills.user_id = assessment_attempts.user_id 
                WHERE is_mastered = 1)
            GROUP by assessment_attempts.skill_id, users.username
            HAVING COUNT(assessment_attempts.skill_id) > 1) AS subquery
        GROUP BY name;`;

        conn.query(sqlQuery, (err, results) => {
            if (err) {
                console.error(
                    'SQL Error in all students failed assessments:',
                    err
                );
                return res
                    .status(500)
                    .json({ error: 'Database error', details: err.message });
            }

            if (!results || results.length === 0) {
                return res.json([]);
            }

            const cleanResults = results.map((row) => ({
                name: row.name || 'Unknown Student',
                quantity: parseInt(row.quantity, 10) || 0
            }));

            res.json(cleanResults);
        });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

/* Attempted assessments per student for all students of an instructor
 */
router.get('/attempted-assessments/all-students/:userId', (req, res, next) => {
    // Check if logged in.
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
            SELECT COUNT(*) AS quantity, username AS name
            FROM assessment_attempts
            JOIN users
            ON assessment_attempts.user_id = users.id
            JOIN instructor_students
            ON assessment_attempts.user_id = instructor_students.student_id
            WHERE instructor_students.instructor_id = ${conn.escape(
                req.params.userId
            )}
            GROUP BY username
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

/* Get duration on platform per cohort per day */
router.get('/all-students-duration-per-day/:userId', (req, res, next) => {
    // Check if logged in.
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
            SELECT date, SUM(duration) AS quantity
            FROM user_duration_per_day
            JOIN instructor_students
            ON instructor_students.student_id = user_duration_per_day.user_id
            WHERE instructor_students.instructor_id = ${conn.escape(
                req.params.userId
            )}              
            GROUP BY date
            ORDER BY date ASC;`;

        conn.query(sqlQuery, (err, result) => {
            try {
                if (err) {
                    throw err;
                }

                res.json(result);
            } catch (err) {
                next(err);
            }
        });
    }
});

/* Get all students of instructor durations */
router.get('/all-students-total-durations/:userId', (req, res, next) => {
    // Check if logged in.
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
            SELECT username AS name, SUM(duration) AS quantity
            FROM user_duration_per_day
            JOIN instructor_students
            ON user_duration_per_day.user_id = instructor_students.student_id
            JOIN users
            ON users.id = user_duration_per_day.user_id
            WHERE instructor_students.instructor_id = ${conn.escape(
                req.params.userId
            )}              
            GROUP BY instructor_students.student_id;`;

        conn.query(sqlQuery, (err, result) => {
            try {
                if (err) {
                    throw err;
                }

                res.json(result);
            } catch (err) {
                next(err);
            }
        });
    }
});

/* Get all student of instructor durations per skill*/
router.get(
    '/all-students-student-durations-per-skill/:userId',
    (req, res, next) => {
        // Check if logged in.
        if (req.session.userName) {
            res.setHeader('Content-Type', 'application/json');

            let sqlQuery = `            
                SELECT skills.name, SUM(duration) AS quantity
                FROM user_skills            
                JOIN instructor_students
                ON user_skills.user_id = instructor_students.student_id
                JOIN skills
                ON skills.id = user_skills.skill_id
                WHERE instructor_students.instructor_id = ${conn.escape(
                    req.params.userId
                )}              
                GROUP BY skills.name
                HAVING quantity > 0
                ORDER BY quantity DESC;`;

            conn.query(sqlQuery, (err, result) => {
                try {
                    if (err) {
                        throw err;
                    }

                    res.json(result);
                } catch (err) {
                    next(err);
                }
            });
        }
    }
);

/* Get all students of instructor progress (number of total skills mastered over time) */
router.get('/all-students-progress/:userId', (req, res, next) => {
    // Check if logged in.
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        // First, get the date the first student in the cohort student started on the platform
        let firstInteractionSQLQuery = `
            SELECT date
            FROM user_duration_per_day
            JOIN instructor_students
            ON instructor_students.student_id = user_duration_per_day.user_id
            WHERE instructor_students.instructor_id = ${conn.escape(
                req.params.userId
            )}  
            ORDER BY date ASC
            LIMIT 1;`;

        conn.query(firstInteractionSQLQuery, (err, firstInteractionResult) => {
            try {
                if (err) {
                    throw err;
                }

                if (firstInteractionResult.length === 0) {
                    return res.status(404).json({
                        error: 'No skill activity'
                    });
                }

                let sqlQuery = `
                    SELECT CAST(mastered_date AS DATE) AS date, SUM(COUNT(*)) OVER(ORDER BY date) AS quantity
                    FROM user_skills
                    JOIN instructor_students
                    ON instructor_students.student_id = user_skills.user_id
                    JOIN skills
                    ON skills.id = user_skills.skill_id
                    WHERE is_mastered = 1
                    AND instructor_students.instructor_id = ${conn.escape(
                        req.params.userId
                    )}        
                    AND type <> 'domain'      
                    GROUP BY date
                    ORDER BY date ASC;`;

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

                        let flag = false;
                        for (let i = 0; i < results.length; i++) {
                            if (
                                firstInteractionResult[0].date ==
                                results[i].date
                            ) {
                                flag = true;
                            }
                        }

                        if (!flag) {
                            results.unshift({
                                date: firstInteractionResult[0].date,
                                quantity: 0
                            });
                        }

                        res.json(results);
                    } catch (err) {
                        next(err);
                    }
                });
            } catch (err) {
                next(err);
            }
        });
    }
});

/**
 * PER TENANT --------------------------------------
 */
router.get(
    '/avg-tokens-to-master-skills/tenant/:tenantId',
    (req, res, next) => {
        // Check if logged in.
        if (req.session.userName) {
            res.setHeader('Content-Type', 'application/json');

            let sqlQuery = `
                SELECT AVG(token_count) AS quantity, skills.name AS name  
                FROM user_skills
                JOIN users 
                ON user_skills.user_id = users.id
                JOIN skills
                ON skills.id = user_skills.skill_id
                WHERE is_mastered = 1
                AND type <> 'domain'
                AND users.tenant_id = ${conn.escape(req.params.tenantId)}
                GROUP BY skill_id
                ORDER BY quantity DESC;                          
            `;

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
    }
);

router.get('/total-tokens-per-skill/tenant/:tenantId', (req, res, next) => {
    // Check if logged in.
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
            SELECT SUM(token_count) AS quantity, skills.name AS name  
            FROM user_skills
            JOIN users 
            ON user_skills.user_id = users.id
            JOIN skills
            ON skills.id = user_skills.skill_id                
            AND type <> 'domain'
            AND users.tenant_id = ${conn.escape(req.params.tenantId)}
            AND token_count > 0
            GROUP BY skill_id                
            ORDER BY quantity DESC;                   
            `;

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

// router.get('/total-tokens-per-day/tenant/:tenantId', (req, res, next) => {
//     // Check if logged in.
//     if (req.session.userName) {
//         res.setHeader('Content-Type', 'application/json');

//         let sqlQuery = `
//             SELECT SUM(token_count) AS quantity, skills.name AS name
//             FROM user_skills
//             JOIN users
//             ON user_skills.user_id = users.id
//             JOIN skills
//             ON skills.id = user_skills.skill_id
//             AND type <> 'domain'
//             AND users.tenant_id = ${conn.escape(req.params.tenantId)}
//             AND token_count > 0
//             GROUP BY skill_id
//             ORDER BY quantity DESC;
//             `;

//         conn.query(sqlQuery, (err, results) => {
//             try {
//                 if (err) {
//                     throw err;
//                 }

//                 if (results.length === 0) {
//                     return res.status(404).json({
//                         error: 'No skill activity'
//                     });
//                 }

//                 res.json(results);
//             } catch (err) {
//                 next(err);
//             }
//         });
//     }
// });

router.get('/avg-times-on-skills/tenant/:tenantId', (req, res, next) => {
    // Check if logged in.
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
            SELECT AVG(duration) AS quantity, skills.name AS name
            FROM user_skills
            JOIN users 
            ON user_skills.user_id = users.id
            JOIN skills
            ON skills.id = user_skills.skill_id
            WHERE type <> 'domain'
            AND duration > 0
            AND users.tenant_id = ${conn.escape(req.params.tenantId)}
            GROUP BY skill_id
            ORDER BY quantity DESC;                          
            `;

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

router.get(
    '/percentage-students-mastered-one-skill/tenant/:tenantId',
    (req, res, next) => {
        // Check if logged in.
        if (req.session.userName) {
            let allStudentsSQLQuery = `
                SELECT COUNT(users.id) AS quantity
                FROM users
                WHERE tenant_id = ${conn.escape(req.params.tenantId)}
                AND role = 'student'
                AND is_deleted = 0;`;

            conn.query(allStudentsSQLQuery, (err, allStudentsResults) => {
                try {
                    if (err) {
                        throw err;
                    }

                    if (allStudentsResults.length === 0) {
                        return res.status(404).json({
                            error: 'No users in the tenant'
                        });
                    }

                    let masteredAtLeastOneSkillSQLQuery = `
                        SELECT COUNT(distinct users.id) AS quantity
                        FROM user_skills
                        JOIN users
                        ON user_skills.user_id = users.id
                        WHERE is_mastered = 1
                        AND role = 'student'
                        AND tenant_id = ${conn.escape(req.params.tenantId)};`;

                    conn.query(
                        masteredAtLeastOneSkillSQLQuery,
                        (err, masteredOneSkillResults) => {
                            try {
                                if (err) {
                                    throw err;
                                }

                                let allStudents =
                                    allStudentsResults[0].quantity || 0;

                                let studentsMasteredNoSkills =
                                    allStudents -
                                    masteredOneSkillResults[0].quantity;

                                let results = [
                                    {
                                        name: 'Mastered no skills',
                                        value: studentsMasteredNoSkills
                                    },
                                    {
                                        name: 'Mastered one skill',
                                        value: masteredOneSkillResults[0]
                                            .quantity
                                    }
                                ];

                                res.json(results);
                            } catch (err) {
                                next(err);
                            }
                        }
                    );
                } catch (err) {
                    next(err);
                }
            });
        }
    }
);

router.get(
    '/percentage-students-mastered-one-skill/instructor/:instructorId',
    (req, res, next) => {
        // Check if logged in.
        if (req.session.userName) {
            let allStudentsSQLQuery = `
                SELECT COUNT(*) AS quantity
                FROM instructor_students
                JOIN users
                ON instructor_students.student_id = users.id
                WHERE instructor_students.instructor_id = ${conn.escape(
                    req.params.instructorId
                )}
                AND is_deleted = 0;`;

            conn.query(allStudentsSQLQuery, (err, allStudentsResults) => {
                try {
                    if (err) {
                        throw err;
                    }

                    if (allStudentsResults.length === 0) {
                        return res.status(404).json({
                            error: 'No users in the tenant'
                        });
                    }

                    let masteredAtLeastOneSkillSQLQuery = `
                        SELECT COUNT(distinct users.id) AS quantity
                        FROM instructor_students
                        JOIN user_skills
                        ON instructor_students.student_id = user_skills.user_id
                        JOIN users 
                        ON users.id = user_skills.user_id
                        WHERE is_mastered = 1
                        AND role = 'student'
                        AND is_deleted = 0
                        AND instructor_students.instructor_id = ${conn.escape(
                            req.params.instructorId
                        )}`;

                    conn.query(
                        masteredAtLeastOneSkillSQLQuery,
                        (err, masteredOneSkillResults) => {
                            try {
                                if (err) {
                                    throw err;
                                }

                                let allStudents =
                                    allStudentsResults[0].quantity || 0;

                                let studentsMasteredNoSkills =
                                    allStudents -
                                    masteredOneSkillResults[0].quantity;

                                let results = [
                                    {
                                        name: 'Mastered no skills',
                                        value: studentsMasteredNoSkills
                                    },
                                    {
                                        name: 'Mastered one skill',
                                        value: masteredOneSkillResults[0]
                                            .quantity
                                    }
                                ];

                                res.json(results);
                            } catch (err) {
                                next(err);
                            }
                        }
                    );
                } catch (err) {
                    next(err);
                }
            });
        }
    }
);

/* Get tenant progress (number of total skills mastered over time) */
router.get('/tenant-progress/:tenantId', (req, res, next) => {
    // Check if logged in.
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        // First, get the date the first student in the tenant student started on the platform
        let firstInteractionSQLQuery = `
            SELECT date
            FROM user_duration_per_day
            JOIN users
            ON users.id = user_duration_per_day.user_id
            WHERE tenant_id = ${conn.escape(req.params.tenantId)}  
            ORDER BY date ASC
            LIMIT 1;`;

        conn.query(firstInteractionSQLQuery, (err, firstInteractionResult) => {
            try {
                if (err) {
                    throw err;
                }

                if (firstInteractionResult.length === 0) {
                    return res.status(404).json({
                        error: 'No skill activity'
                    });
                }

                let sqlQuery = `
                    SELECT CAST(mastered_date AS DATE) AS date, SUM(COUNT(*)) OVER(ORDER BY date) AS quantity
                    FROM user_skills
                    JOIN users
                    ON users.id = user_skills.user_id
                    JOIN skills
                    ON skills.id = user_skills.skill_id
                    WHERE is_mastered = 1
                    AND tenant_id = ${conn.escape(req.params.tenantId)}        
                    AND type <> 'domain'      
                    GROUP BY date
                    ORDER BY date ASC;`;

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

                        let flag = false;
                        for (let i = 0; i < results.length; i++) {
                            if (
                                firstInteractionResult[0].date ==
                                results[i].date
                            ) {
                                flag = true;
                            }
                        }

                        if (!flag) {
                            results.unshift({
                                date: firstInteractionResult[0].date,
                                quantity: 0
                            });
                        }

                        res.json(results);
                    } catch (err) {
                        next(err);
                    }
                });
            } catch (err) {
                next(err);
            }
        });
    }
});

/* Get tenant duration per day */
router.get('/tenant-duration-per-day/:tenantId', (req, res, next) => {
    // Check if logged in.
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
            SELECT SUM(duration) AS quantity, date
            FROM user_duration_per_day            
            JOIN users
            ON users.id = user_duration_per_day.user_id
            WHERE users.tenant_id = ${conn.escape(req.params.tenantId)}  
            GROUP BY date
            ORDER BY date ASC;`;

        conn.query(sqlQuery, (err, result) => {
            try {
                if (err) {
                    throw err;
                }

                res.json(result);
            } catch (err) {
                next(err);
            }
        });
    }
});

/* Get nuber of skills passed by number of students that have passed that number */
router.get(
    '/num-skills-passed-per-num-students/:tenantId',
    (req, res, next) => {
        // Check if logged in.
        if (req.session.userName) {
            res.setHeader('Content-Type', 'application/json');

            let sqlQuery = `
                SELECT quantity AS "num_skills_passed", COUNT(sub.quantity) AS "num_students"
                FROM
                (SELECT COUNT(*) AS quantity, users.username AS name
                FROM user_skills
                JOIN users
                ON users.id = user_skills.user_id
                WHERE is_mastered = 1
                AND tenant_id = ${conn.escape(req.params.tenantId)}
                AND role = "student"
                GROUP BY user_id) AS sub
                GROUP BY quantity;`;

            conn.query(sqlQuery, (err, result) => {
                try {
                    if (err) {
                        throw err;
                    }

                    res.json(result);
                } catch (err) {
                    next(err);
                }
            });
        }
    }
);

/* Get nuber of assessments passed */
router.get('/passed-assessments/tenant/:tenantId', (req, res, next) => {
    // Check if logged in.
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
            SELECT skills.name as name, count(*) as quantity
            FROM user_skills
            JOIN users
            ON users.id = user_skills.user_id
            JOIN skills
            ON skills.id = user_skills.skill_id
            WHERE tenant_id = ${conn.escape(req.params.tenantId)}
            AND is_mastered = 1
            AND type <> 'domain'
            GROUP BY name;`;

        conn.query(sqlQuery, (err, result) => {
            try {
                if (err) {
                    throw err;
                }

                res.json(result);
            } catch (err) {
                next(err);
            }
        });
    }
});

/**
 * RECORD DATA -------------------------------------------
 */
/**
 * Record time per skill
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

/**
 * Record time on app per day per student
 */
router.post('/record-time-on-app/:userId', (req, res, next) => {
    if (req.session.userName) {
        const duration = req.body.duration;

        let sqlQuery = `
        INSERT INTO user_duration_per_day (user_id, date, duration) 
        VALUES(${conn.escape(req.params.userId)}, CURDATE(), ${conn.escape(
            duration
        )}) 
        
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

// Export the router for app to use.
module.exports = router;
