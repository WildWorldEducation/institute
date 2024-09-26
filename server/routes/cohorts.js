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
        let sqlQuery = 'SELECT * FROM cohorts';
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
        WHERE id = ${req.params.id}`;
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
        WHERE cohort_id = ${req.params.cohortId}
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
 * Get Cohort Skill Filters
 *
 * @return response()
 */
router.get('/:id/skill-filters', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `        
    SELECT skills.id, name, parent, type, level, skills.order as skillorder, cohort_skill_filters.is_filtered
    FROM skills
    LEFT OUTER JOIN cohort_skill_filters
    ON skills.id = cohort_skill_filters.skill_id
    WHERE cohort_skill_filters.cohort_id = ${req.params.id}            
	AND is_deleted = 0

    UNION
    SELECT skills.id, name, parent, type, level, skills.order as skillorder, ''
    FROM skills
    WHERE skills.id NOT IN 

    (SELECT skills.id
    FROM skills
    LEFT OUTER JOIN cohort_skill_filters
    ON skills.id = cohort_skill_filters.skill_id
    WHERE cohort_skill_filters.cohort_id = ${req.params.id}            ) 
    AND is_deleted = 0
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
        let data = { name: req.body.name };
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

router.put('/:cohortId/edit-filters', (req, res, next) => {
    if (req.session.userName) {
        console.log(req.body);
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

// Export the router for app to use.
module.exports = router;
