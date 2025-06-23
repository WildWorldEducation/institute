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
 * Get All Items per instructor
 *
 * @return response()
 */
router.get('/:instructorId/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT * 
        FROM cohorts
        WHERE instructor_id = ${conn.escape(req.params.instructorId)}`;
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
 * Get One Item
 *
 * @return response()
 */
router.get('/:id', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT * FROM cohorts
        WHERE id = ${conn.escape(req.params.id)};`;
        conn.query(sqlQuery, (err, results) => {
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
 * Get All Members of a Cohort
 *
 * @return response()
 */
router.get('/:cohortId/members', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT users.id, users.username
        FROM cohorts_users
        JOIN users
        ON cohorts_users.user_id = users.id
        WHERE cohorts_users.cohort_id = ${conn.escape(req.params.cohortId)}
        AND users.is_deleted = 0;
        `;
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
 * Get All Root Subjects Filters in a Cohort
 * Used to hide relevant subject filters on the Skill Tree view
 *
 * @return response()
 */
router.get('/:cohortId/filteredSubjects', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT skills.name
        FROM cohort_skill_filters
        JOIN skills
        ON skill_id = skills.id        
        WHERE cohort_id = ${conn.escape(req.params.cohortId)}
        AND skills.parent = 0;
        `;
        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                let filteredSubjectArray = [];
                for (let i = 0; i < results.length; i++) {
                    filteredSubjectArray.push(results[i].name);
                }

                res.json(filteredSubjectArray);
            } catch (err) {
                next(err);
            }
        });
    }
});

// WHERE IS THE BELOW ROUTE USED? CAN IT BE DELETED?
/**
 * Get Cohort Skill Filters
 *
 * @return response()
 */
router.get('/:id/skill-filters', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `        
    SELECT skills.id, name, parent, type, level, skills.order as skillorder, 1 as filtered
    FROM skills
    LEFT OUTER JOIN cohort_skill_filters
    ON skills.id = cohort_skill_filters.skill_id
    WHERE cohort_skill_filters.cohort_id = ${conn.escape(
        req.params.id
    )}            
	AND is_deleted = 0
    AND is_filtered = 'available' 

    UNION
    SELECT skills.id, name, parent, type, level, skills.order as skillorder, 0 as filtered
    FROM skills
    WHERE skills.id NOT IN 

    (SELECT skills.id
    FROM skills
    LEFT OUTER JOIN cohort_skill_filters
    ON skills.id = cohort_skill_filters.skill_id
    WHERE cohort_skill_filters.cohort_id = ${conn.escape(req.params.id)}) 
    AND is_deleted = 0
    AND is_filtered = 'available' 
    
    ORDER BY skillorder, id;
        `;
        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                // Give each object a 'children' element.
                for (var i = 0; i < results.length; i++) {
                    results[i].children = [];
                }

                // Assign children to parent skills.
                for (var i = 0; i < results.length; i++) {
                    // Regular parent.
                    if (results[i].parent != null && results[i].parent != 0) {
                        var parentId = results[i].parent;

                        // Go through all rows again, add children
                        for (let j = 0; j < results.length; j++) {
                            if (results[j].id == parentId) {
                                // bug
                                results[j].children.push(results[i]);
                            }
                        }
                    }
                }

                let cohortSkills = [];
                for (var i = 0; i < results.length; i++) {
                    if (results[i].parent == null || results[i].parent == 0) {
                        cohortSkills.push(results[i]);
                    }
                }

                res.json(cohortSkills);
            } catch (err) {
                next(err);
            }
        });
    }
});

/**
 * Create New Cohort
 *
 * @return response()
 */
router.post('/add', (req, res, next) => {
    if (req.session.userName) {
        let data = {
            name: req.body.name,
            instructor_id: req.body.instructorId
        };
        let sqlQuery = 'INSERT INTO cohorts SET ?';
        conn.query(sqlQuery, data, (err) => {
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
 * Edit Cohorts
 *
 * @return response()
 */
router.put('/edit/:cohortId', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = '';
        // If student is a member of cohort, and record does not exist already, add record.
        if (req.body.isMember) {
            sqlQuery = `
            INSERT IGNORE INTO cohorts_users (cohort_id, user_id)
            VALUES (${conn.escape(req.params.cohortId)}, ${conn.escape(
                req.body.studentId
            )});`;
            // If student is not a member of cohort, delete any record.
        } else {
            sqlQuery = `
            DELETE
            FROM cohorts_users
            WHERE cohort_id = ${conn.escape(req.params.cohortId)} 
            AND user_id =  ${conn.escape(req.body.studentId)};`;
        }

        conn.query(sqlQuery, (err) => {
            try {
                if (err) {
                    throw err;
                }
                let cohortId;
                if (req.body.isMember) {
                    cohortId = req.params.cohortId;
                } else {
                    cohortId = null;
                }

                let updateUserSQLQuery = `UPDATE users
                SET cohort_id = ${cohortId} 
                WHERE id = ${conn.escape(req.body.studentId)};`;

                conn.query(updateUserSQLQuery, (err) => {
                    try {
                        if (err) {
                            throw err;
                        }

                        res.end();
                    } catch (err) {
                        next(err);
                    }
                });
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

router.put('/:cohortId/edit-filters', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = '';
        // If skill is filtered, and record does not exist already, add record.
        if (req.body.isFiltered) {
            sqlQuery = `
            INSERT IGNORE INTO cohort_skill_filters (cohort_id, skill_id)
            VALUES (${conn.escape(req.params.cohortId)}, ${conn.escape(
                req.body.skillId
            )});`;
            // If skill is not filtered, delete any record.
        } else {
            sqlQuery = `
            DELETE
            FROM cohort_skill_filters
            WHERE cohort_id = ${conn.escape(req.params.cohortId)} 
            AND skill_id =  ${conn.escape(req.body.skillId)};`;
        }

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
 * Get All Students that are currently in cohorts
 *
 * @return response()
 */
router.get('/unavailable/:cohortId/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT user_id 
        FROM cohorts_users
        WHERE cohort_id <> ${conn.escape(req.params.cohortId)};`;

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
 * Delete Item
 *
 */
router.delete('/:cohortId', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = `DELETE FROM cohorts WHERE id=${conn.escape(
            req.params.cohortId
        )};`;
        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                let sqlQuery2 = `DELETE 
                FROM cohort_skill_filters 
                WHERE cohort_id=${conn.escape(req.params.cohortId)}`;

                conn.query(sqlQuery2, (err, results) => {
                    try {
                        if (err) {
                            throw err;
                        }

                        res.end();
                    } catch (err) {
                        next(err);
                    }
                });
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
