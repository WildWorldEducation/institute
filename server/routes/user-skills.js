/*------------------------------------------
--------------------------------------------
Middleware
--------------------------------------------
--------------------------------------------*/
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());
// DB
const conn = require('../config/db');
const {
    findParentHaveHiddenChild,
    showHiddenChildFromParent,
    convertNodesToArray
} = require('../utilities/skill-relate-functions');

/*------------------------------------------
--------------------------------------------
Routes
--------------------------------------------
--------------------------------------------*/

/* Nested list of user-skills*/
// For Collapsible Tree and Linear Tree
// And Student Collapsible Tree
// - now replaced by "filter-by-cohort" version.
router.get('/:userId', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
    SELECT skills.id, name AS skill_name, parent, is_accessible, is_mastered, type, level, skills.order as skillorder, display_name, is_copy_of_skill_id, url
    FROM skills
    LEFT OUTER JOIN user_skills
    ON skills.id = user_skills.skill_id
    WHERE user_skills.user_id = ${conn.escape(req.params.userId)} 
    AND is_filtered = 'available' 
    AND is_deleted = 0

    UNION
    SELECT skills.id, name, parent, "", "", type, level, skills.order as skillorder, display_name, is_copy_of_skill_id, url
    FROM skills
    WHERE skills.id NOT IN 

    (SELECT skills.id
    FROM skills
    LEFT OUTER JOIN user_skills
    ON skills.id = user_skills.skill_id
    WHERE user_skills.user_id = ${conn.escape(req.params.userId)}) 
    AND is_filtered = 'available' 
    AND is_deleted = 0
    ORDER BY skillorder, id;`;

        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                // Give each object a 'children' element.
                for (var i = 0; i < results.length; i++) {
                    results[i].children = [];
                }

                // Deal with skills that have multiple parents.
                // These skills have secret copies in the table.
                for (var i = 0; i < results.length; i++) {
                    if (results[i].display_name != null) {
                        results[i].skill_name = results[i].display_name;

                        for (var j = 0; j < results.length; j++) {
                            if (
                                results[i].is_copy_of_skill_id == results[j].id
                            ) {
                                results[i].is_accessible =
                                    results[j].is_accessible;
                                results[i].is_mastered = results[j].is_mastered;
                            }
                        }
                    }
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

                let studentSkills = [];
                for (var i = 0; i < results.length; i++) {
                    if (results[i].parent == null || results[i].parent == 0) {
                        studentSkills.push(results[i]);
                    }
                }

                res.json(studentSkills);
            } catch (err) {
                next(err);
            }
        });
    }
});

/* Nested list of user-skills, with the subskills separate from the other child skills */
// Used for the Radial Skill Tree.
router.get('/separate-subskills/:userId', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
    SELECT skills.id, name AS skill_name, parent, is_accessible, is_mastered, type, level, skills.order as skillorder, display_name
    FROM skills
    LEFT OUTER JOIN user_skills
    ON skills.id = user_skills.skill_id
    WHERE user_skills.user_id = ${conn.escape(req.params.userId)} 
    AND is_filtered = 'available'
    AND is_deleted = 0

    UNION
    SELECT skills.id, name, parent, "", "", type, level, skills.order as skillorder, display_name
    FROM skills
    WHERE skills.id NOT IN 

    (SELECT skills.id
    FROM skills
    LEFT OUTER JOIN user_skills
    ON skills.id = user_skills.skill_id
    WHERE user_skills.user_id = ${conn.escape(req.params.userId)}) 
    AND is_filtered = 'available'
    AND is_deleted = 0

    ORDER BY skillorder, id;`;

        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                for (var i = 0; i < results.length; i++) {
                    results[i].children = [];
                    results[i].subskills = [];
                }

                // Add children for first parent.
                for (var i = 0; i < results.length; i++) {
                    if (results[i].parent != null && results[i].parent != 0) {
                        var parentId = results[i].parent;

                        // go through all rows again, add children
                        for (let j = 0; j < results.length; j++) {
                            if (results[j].id == parentId) {
                                if (results[i].type == 'sub') {
                                    results[j].subskills.push(results[i]);
                                } else {
                                    results[j].children.push(results[i]);
                                }
                            }
                        }
                    }
                }

                // Add the first level to the array.
                let studentSkills = [];
                for (var i = 0; i < results.length; i++) {
                    if (results[i].parent == null || results[i].parent == 0) {
                        studentSkills.push(results[i]);
                    }
                }

                res.json(studentSkills);
            } catch (err) {
                next(err);
            }
        });
    }
});

/* Unnested list */
router.get('/unnested-list/:userId', (req, res, next) => {
    // Check if logged in.
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
    SELECT skills.id, name, is_accessible, is_mastered, type, url, level
    FROM skills
    LEFT OUTER JOIN user_skills
    ON skills.id = user_skills.skill_id
    WHERE user_skills.user_id = ${conn.escape(req.params.userId)}

    UNION
    SELECT skills.id, name, "", "", type, url, level
    FROM skills
    WHERE skills.id NOT IN 

    (SELECT skills.id
    FROM skills
    LEFT OUTER JOIN user_skills
    ON skills.id = user_skills.skill_id
    WHERE user_skills.user_id = ${conn.escape(req.params.userId)})
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

/* Filtered Unnested list - used on ShowSkill Vue component.*/
router.get('/filtered-unnested-list/:userId', (req, res, next) => {
    // Check if logged in.
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
    SELECT skills.id, name, is_accessible, is_mastered, type, parent, url, level
    FROM skills
    LEFT OUTER JOIN user_skills
    ON skills.id = user_skills.skill_id
    WHERE user_skills.user_id = ${conn.escape(req.params.userId)} 
    AND is_filtered = 'available'

    UNION
    SELECT skills.id, name, "", "", type, parent, url, level
    FROM skills
    WHERE skills.id NOT IN 

    (SELECT skills.id
    FROM skills
    LEFT OUTER JOIN user_skills
    ON skills.id = user_skills.skill_id
    WHERE user_skills.user_id = ${conn.escape(req.params.userId)}) 
    AND is_filtered = 'available'
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

/* Nested list of user-skills, filtered by 1 cohort that student is a member of*/
// For Collapsible Tree.
router.get('/filter-by-cohort/:userId', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        /* Apply grade level and subject filters
         */
        // Level will be sent in query param (eg: ?level='middle_school')
        const level = req.query.level;
        // Default is to show all.
        let levelsToShow =
            "'grade_school', 'middle_school', 'high_school', 'college', 'phd'";
        if (level == 'grade_school') {
            levelsToShow = "'grade_school'";
        } else if (level == 'middle_school') {
            levelsToShow = "'grade_school', 'middle_school'";
        } else if (level == 'high_school') {
            levelsToShow = "'grade_school', 'middle_school', 'high_school'";
        } else if (level == 'college') {
            levelsToShow =
                "'grade_school', 'middle_school', 'high_school', 'college'";
        } else if (level == 'phd') {
            levelsToShow =
                "'grade_school', 'middle_school', 'high_school', 'college', 'phd'";
        }

        // Check if student is member of a cohort
        let isInCohortSQLQuery = `
        SELECT cohort_id 
        FROM skill_tree.cohorts_users
        WHERE user_id = ${conn.escape(req.params.userId)};
        `;
        conn.query(isInCohortSQLQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                let cohortId;
                if (results.length == 0) {
                    cohortId = -1;
                } else cohortId = results[0].cohort_id;

                // Check what skills are available for this cohort.
                let sqlQuery = `
            SELECT skills.id, name AS skill_name, parent, is_accessible, is_mastered, type, level, skills.order as skillorder, display_name, is_copy_of_skill_id, url, show_children
            FROM skills
            LEFT OUTER JOIN user_skills
            ON skills.id = user_skills.skill_id
            WHERE user_skills.user_id = ${conn.escape(req.params.userId)}
            AND is_filtered = 'available' 
            AND is_deleted = 0
            AND level IN (${levelsToShow})
            AND skills.id NOT IN 
            (SELECT skill_id 
            FROM cohort_skill_filters
            WHERE cohort_id = ${conn.escape(cohortId)})
            
            UNION
            SELECT skills.id, name, parent, "", "", type, level, skills.order as skillorder, display_name, is_copy_of_skill_id, url, ""
            FROM skills
            WHERE skills.id NOT IN 
            
            (SELECT skills.id
            FROM skills
            LEFT OUTER JOIN user_skills
            ON skills.id = user_skills.skill_id
            WHERE user_skills.user_id = ${conn.escape(req.params.userId)}) 
            AND is_filtered = 'available' 
            AND is_deleted = 0
            AND level IN (${levelsToShow})
            AND skills.id NOT IN 
            (SELECT skill_id 
            FROM cohort_skill_filters
            WHERE cohort_id = ${conn.escape(cohortId)})    
                
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

                        // Deal with skills that have multiple parents.
                        // These skills have secret copies in the table.
                        for (var i = 0; i < results.length; i++) {
                            if (results[i].display_name != null) {
                                results[i].skill_name = results[i].display_name;

                                for (var j = 0; j < results.length; j++) {
                                    if (
                                        results[i].is_copy_of_skill_id ==
                                        results[j].id
                                    ) {
                                        results[i].is_accessible =
                                            results[j].is_accessible;
                                        results[i].is_mastered =
                                            results[j].is_mastered;
                                    }
                                }
                            }
                        }

                        // Assign children to parent skills.
                        for (var i = 0; i < results.length; i++) {
                            // Regular parent.
                            if (
                                results[i].parent != null &&
                                results[i].parent != 0
                            ) {
                                var parentId = results[i].parent;

                                // Go through all rows again, add children
                                for (let j = 0; j < results.length; j++) {
                                    if (results[j].id == parentId) {
                                        results[j].children.push(results[i]);
                                    }
                                }
                            }
                        }

                        let studentSkills = [];
                        for (var i = 0; i < results.length; i++) {
                            if (
                                results[i].parent == null ||
                                results[i].parent == 0
                            ) {
                                studentSkills.push(results[i]);
                            }
                        }

                        res.json(studentSkills);
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

/* Nested list of user-skills, filtered by 1 cohort that student is a member of*/
// For Full Vertical Tree.
router.get('/filter-by-cohort/full-vertical-tree/:userId', (req, res, next) => {
    if (req.session.userName) {
        /* Apply grade level and subject filters
         */
        let subjects = req.query.subjects;

        // Level will be sent in query param (eg: ?level='middle_school')
        const level = req.query.level;
        // Default is to show all.
        let levelsToShow =
            "'grade_school', 'middle_school', 'high_school', 'college', 'phd'";
        if (level == 'grade_school') {
            levelsToShow = "'grade_school'";
        } else if (level == 'middle_school') {
            levelsToShow = "'grade_school', 'middle_school'";
        } else if (level == 'high_school') {
            levelsToShow = "'grade_school', 'middle_school', 'high_school'";
        } else if (level == 'college') {
            levelsToShow =
                "'grade_school', 'middle_school', 'high_school', 'college'";
        } else if (level == 'phd') {
            levelsToShow =
                "'grade_school', 'middle_school', 'high_school', 'college', 'phd'";
        }

        res.setHeader('Content-Type', 'application/json');
        // Check if student is member of a cohort
        let isInCohortSQLQuery = `
        SELECT cohort_id 
        FROM skill_tree.cohorts_users
        WHERE user_id = ${conn.escape(req.params.userId)};
        `;
        conn.query(isInCohortSQLQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                let cohortId;
                if (results.length == 0) {
                    cohortId = -1;
                } else cohortId = results[0].cohort_id;

                // Check what skills are available for this cohort.
                let sqlQuery = `
            SELECT skills.id, name AS skill_name, parent, is_accessible, is_mastered, type, level, skills.order as skillorder, display_name, is_copy_of_skill_id, url
            FROM skills
            LEFT OUTER JOIN user_skills
            ON skills.id = user_skills.skill_id
            WHERE user_skills.user_id = ${conn.escape(req.params.userId)}
            AND is_filtered = 'available' 
            AND is_deleted = 0
            AND level IN (${levelsToShow})
            AND skills.id NOT IN 
            (SELECT skill_id 
            FROM cohort_skill_filters
            WHERE cohort_id = ${conn.escape(cohortId)})
            
            UNION
            SELECT skills.id, name, parent, "", "", type, level, skills.order as skillorder, display_name, is_copy_of_skill_id, url
            FROM skills
            WHERE level IN (${levelsToShow})
            AND
            skills.id NOT IN 
            
            (SELECT skills.id
            FROM skills
            LEFT OUTER JOIN user_skills
            ON skills.id = user_skills.skill_id
            WHERE user_skills.user_id = ${conn.escape(req.params.userId)}) 
            AND is_filtered = 'available' 
            AND is_deleted = 0           
            AND skills.id NOT IN 
            (SELECT skill_id 
            FROM cohort_skill_filters
            WHERE cohort_id = ${conn.escape(cohortId)})    
                         
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

                        // Deal with skills that have multiple parents.
                        // These skills have secret copies in the table.
                        for (var i = 0; i < results.length; i++) {
                            if (results[i].display_name != null) {
                                results[i].skill_name = results[i].display_name;

                                for (var j = 0; j < results.length; j++) {
                                    if (
                                        results[i].is_copy_of_skill_id ==
                                        results[j].id
                                    ) {
                                        results[i].is_accessible =
                                            results[j].is_accessible;
                                        results[i].is_mastered =
                                            results[j].is_mastered;
                                    }
                                }
                            }
                        }

                        // Assign children to parent skills.
                        for (var i = 0; i < results.length; i++) {
                            // Check that not first level nodes.
                            if (
                                results[i].parent != null &&
                                results[i].parent != 0
                            ) {
                                var parentId = results[i].parent;

                                // Go through all rows again, add children
                                for (let j = 0; j < results.length; j++) {
                                    if (results[j].id == parentId) {
                                        results[j].children.push(results[i]);
                                    }
                                }
                            }
                        }

                        let studentSkills = [];
                        for (var i = 0; i < results.length; i++) {
                            if (
                                (results[i].parent == null ||
                                    results[i].parent == 0) &&
                                // check if root name is in list of root subjects to show
                                subjects.includes(results[i].skill_name)
                            ) {
                                studentSkills.push(results[i]);
                            }
                        }

                        res.json(studentSkills);
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

/* Nested list of user-skills, filtered by 1 cohort that student is a member of*/
// For My Vertical Tree.
router.get('/filter-by-cohort/my-vertical-tree/:userId', (req, res, next) => {
    if (req.session.userName) {
        /* Apply grade level and subject filters
         */
        let subjects = req.query.subjects;

        // Level will be sent in query param (eg: ?level='middle_school')
        const level = req.query.level;
        // Default is to show all.
        let levelsToShow =
            "'grade_school', 'middle_school', 'high_school', 'college', 'phd'";
        if (level == 'grade_school') {
            levelsToShow = "'grade_school'";
        } else if (level == 'middle_school') {
            levelsToShow = "'grade_school', 'middle_school'";
        } else if (level == 'high_school') {
            levelsToShow = "'grade_school', 'middle_school', 'high_school'";
        } else if (level == 'college') {
            levelsToShow =
                "'grade_school', 'middle_school', 'high_school', 'college'";
        } else if (level == 'phd') {
            levelsToShow =
                "'grade_school', 'middle_school', 'high_school', 'college', 'phd'";
        }

        res.setHeader('Content-Type', 'application/json');
        // Check if student is member of a cohort
        let isInCohortSQLQuery = `
        SELECT cohort_id 
        FROM skill_tree.cohorts_users
        WHERE user_id = ${conn.escape(req.params.userId)};
        `;
        conn.query(isInCohortSQLQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                let cohortId;
                if (results.length == 0) {
                    cohortId = -1;
                } else cohortId = results[0].cohort_id;

                // Check what skills are available for this cohort.
                let sqlQuery = `
            SELECT skills.id, name AS skill_name, parent, is_accessible, is_mastered, type, level, skills.order as skillorder, display_name, is_copy_of_skill_id, url, show_children
            FROM skills
            LEFT OUTER JOIN user_skills
            ON skills.id = user_skills.skill_id
            WHERE user_skills.user_id = ${conn.escape(req.params.userId)}
            AND is_filtered = 'available' 
            AND is_deleted = 0
            AND level IN (${levelsToShow})
            AND skills.id NOT IN 
            (SELECT skill_id 
            FROM cohort_skill_filters
            WHERE cohort_id = ${conn.escape(cohortId)})
            
            UNION
            SELECT skills.id, name, parent, "", "", type, level, skills.order as skillorder, display_name, is_copy_of_skill_id, url, ""
            FROM skills
            WHERE level IN (${levelsToShow})
            AND
            skills.id NOT IN 
            
            (SELECT skills.id
            FROM skills
            LEFT OUTER JOIN user_skills
            ON skills.id = user_skills.skill_id
            WHERE user_skills.user_id = ${conn.escape(req.params.userId)}) 
            AND is_filtered = 'available' 
            AND is_deleted = 0           
            AND skills.id NOT IN 
            (SELECT skill_id 
            FROM cohort_skill_filters
            WHERE cohort_id = ${conn.escape(cohortId)})    
                         
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

                        // Deal with skills that have multiple parents.
                        // These skills have secret copies in the table.
                        for (var i = 0; i < results.length; i++) {
                            if (results[i].display_name != null) {
                                results[i].skill_name = results[i].display_name;

                                for (var j = 0; j < results.length; j++) {
                                    if (
                                        results[i].is_copy_of_skill_id ==
                                        results[j].id
                                    ) {
                                        results[i].is_accessible =
                                            results[j].is_accessible;
                                        results[i].is_mastered =
                                            results[j].is_mastered;
                                    }
                                }
                            }
                        }

                        // Assign children to parent skills.
                        for (var i = 0; i < results.length; i++) {
                            // Check that not first level nodes.
                            if (
                                results[i].parent != null &&
                                results[i].parent != 0
                            ) {
                                var parentId = results[i].parent;

                                // Go through all rows again, add children
                                for (let j = 0; j < results.length; j++) {
                                    if (results[j].id == parentId) {
                                        // Here we show or hide the child nodes for the Vertical Tree
                                        // based on whether the student has collapsed the node or not.
                                        if (results[j].show_children) {
                                            if (results[j].show_children == 1) {
                                                results[j].children.push(
                                                    results[i]
                                                );
                                            }
                                        } else {
                                            results[j].children.push(
                                                results[i]
                                            );
                                        }
                                    }
                                }
                            }
                        }

                        let studentSkills = [];
                        for (var i = 0; i < results.length; i++) {
                            if (
                                (results[i].parent == null ||
                                    results[i].parent == 0) &&
                                // check if root name is in list of root subjects to show
                                subjects.includes(results[i].skill_name)
                            ) {
                                studentSkills.push(results[i]);
                            }
                        }

                        res.json(studentSkills);
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

/* Nested list of user-skills, filtered by 1 cohort that student is a member of*/
// For Radial Tree.
router.get('/separate-subskills/filter-by-cohort/:userId', (req, res, next) => {
    if (req.session.userName) {
        /*
         * Apply grade level and subject filters
         */
        let subjects = req.query.subjects;
        // Level will be sent in query param (eg: ?level='middle_school')
        const level = req.query.level;
        // Default is to show all.
        let levelsToShow =
            "'domain', 'grade_school', 'middle_school', 'high_school', 'college', 'phd'";
        if (level == 'grade_school') {
            levelsToShow = "'domain', 'grade_school'";
        } else if (level == 'middle_school') {
            levelsToShow = "'domain', 'grade_school', 'middle_school'";
        } else if (level == 'high_school') {
            levelsToShow =
                "'domain', 'grade_school', 'middle_school', 'high_school'";
        } else if (level == 'college') {
            levelsToShow =
                "'domain', 'grade_school', 'middle_school', 'high_school', 'college'";
        } else if (level == 'phd') {
            levelsToShow =
                "'domain', 'grade_school', 'middle_school', 'high_school', 'college', 'phd'";
        }

        res.setHeader('Content-Type', 'application/json');

        // Check if student is member of a cohort
        let isInCohortSQLQuery = `
        SELECT cohort_id 
        FROM skill_tree.cohorts_users
        WHERE user_id = ${conn.escape(req.params.userId)};
        `;

        conn.query(isInCohortSQLQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                let cohortId;
                if (results.length == 0) {
                    cohortId = -1;
                } else cohortId = results[0].cohort_id;

                let sqlQuery = `
                SELECT skills.id, name AS skill_name, parent, is_accessible, is_mastered, type, level, skills.order as skillorder, display_name
                FROM skills
                LEFT OUTER JOIN user_skills
                ON skills.id = user_skills.skill_id
                WHERE user_skills.user_id = ${conn.escape(req.params.userId)} 
                AND is_filtered = 'available'
                AND level IN (${levelsToShow})
                AND is_deleted = 0
                AND skills.id NOT IN 
                (SELECT skill_id 
                FROM cohort_skill_filters
                WHERE cohort_id = ${conn.escape(cohortId)})
            
                UNION
                SELECT skills.id, name, parent, "", "", type, level, skills.order as skillorder, display_name
                FROM skills
                WHERE skills.id NOT IN 
            
                (SELECT skills.id
                FROM skills
                LEFT OUTER JOIN user_skills
                ON skills.id = user_skills.skill_id
                WHERE user_skills.user_id = ${conn.escape(req.params.userId)}) 
                AND is_filtered = 'available'
                AND level IN (${levelsToShow})
                AND is_deleted = 0
                AND skills.id NOT IN 
                (SELECT skill_id 
                FROM cohort_skill_filters
                WHERE cohort_id = ${conn.escape(cohortId)})
            
                ORDER BY skillorder, id;`;

                conn.query(sqlQuery, (err, results) => {
                    try {
                        if (err) {
                            throw err;
                        }

                        for (var i = 0; i < results.length; i++) {
                            results[i].children = [];
                            results[i].subskills = [];
                        }

                        // Add children for first parent.
                        for (var i = 0; i < results.length; i++) {
                            if (
                                results[i].parent != null &&
                                results[i].parent != 0
                            ) {
                                var parentId = results[i].parent;

                                // go through all rows again, add children
                                for (let j = 0; j < results.length; j++) {
                                    if (results[j].id == parentId) {
                                        if (results[i].type == 'sub') {
                                            results[j].subskills.push(
                                                results[i]
                                            );
                                        } else {
                                            results[j].children.push(
                                                results[i]
                                            );
                                        }
                                    }
                                }
                            }
                        }

                        // Add the first level to the array.
                        let studentSkills = [];
                        for (var i = 0; i < results.length; i++) {
                            if (
                                (results[i].parent == null ||
                                    results[i].parent == 0) &&
                                // check if root name is in list of root subjects to show
                                subjects.includes(results[i].skill_name)
                            ) {
                                studentSkills.push(results[i]);
                            }
                        }

                        // Count the filtered skills, to determine size of Radial Tree
                        // so that leaves not too far spaced apart.
                        let count = 0;
                        function countNestedSkills(parentChildren) {
                            var i = parentChildren.length;
                            while (i--) {
                                count++;
                                if (typeof parentChildren[i] !== 'undefined') {
                                    /*
                                     * Run the above function again recursively.
                                     */
                                    if (
                                        parentChildren[i].children &&
                                        Array.isArray(
                                            parentChildren[i].children
                                        ) &&
                                        parentChildren[i].children.length > 0
                                    )
                                        countNestedSkills(
                                            parentChildren[i].children
                                        );
                                }
                            }
                            return count;
                        }

                        countNestedSkills(studentSkills);
                        const numSkills = count;

                        res.json({ skills: studentSkills, count: numSkills });
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
 * Make skill accessible.
 *
 * @return response()
 */
router.get('/accessible/:userId/:skillId', (req, res, next) => {
    if (req.session.userName) {
        // Make this skill accessible.
        let sqlQuery = `
        INSERT INTO user_skills (user_id, skill_id, is_accessible) 
        VALUES(${conn.escape(req.params.userId)},
        ${conn.escape(req.params.skillId)}, 1) 
        ON DUPLICATE KEY UPDATE is_accessible=1;
        `;
        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.redirect('back');
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

/**
 * Make skill locked.
 *
 * @return response()
 */
router.get('/inaccessible/:userId/:skillId', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = `
        INSERT INTO user_skills (user_id, skill_id, is_accessible) 
        VALUES(${conn.escape(req.params.userId)}, ${conn.escape(
            req.params.skillId
        )}, 0) 
        ON DUPLICATE KEY UPDATE is_accessible=0;
        `;

        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.redirect('back');
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

/**
 * Hide /show child nodes on the Vertical Skill Tree.
 *
 * @return response()
 */
// Hide child nodes on the Vertical Skill Tree.
router.get('/hide-children/:userId/:skillId', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = `
        INSERT INTO user_skills (user_id, skill_id, show_children) 
        VALUES(${conn.escape(req.params.userId)}, ${conn.escape(
            req.params.skillId
        )}, 0) 
        ON DUPLICATE KEY UPDATE show_children=0;
        `;

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

// Show child nodes on the Vertical Skill Tree.
router.get('/show-children/:userId/:skillId', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = `
        INSERT INTO user_skills (user_id, skill_id, show_children) 
        VALUES(${conn.escape(req.params.userId)}, ${conn.escape(
            req.params.skillId
        )}, 1) 
        ON DUPLICATE KEY UPDATE show_children=1;
        `;

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

// Expand all child nodes on the Vertical Skill Tree.
router.get('/expand-all-children/:userId', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = `
        UPDATE user_skills
        SET show_children = 1
        WHERE user_id = ${conn.escape(req.params.userId)};`;

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
 * this route handle a case when user want to find node that hidden by their parent
 * we find a node in user cohort and their parent until we hit a node that toggle child off.
 *
 * @return response()
 */
router.post('/find-hidden-skill/:userId', (req, res, next) => {
    if (req.session.userName) {
        const skillName = req.body.skillName;
        const userId = req.params.userId;
        // Check if student is member of a cohort
        let isInCohortSQLQuery = `
        SELECT cohort_id 
        FROM skill_tree.cohorts_users
        WHERE user_id = ${conn.escape(userId)};
        `;
        conn.query(isInCohortSQLQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                let cohortId;
                if (results.length == 0) {
                    cohortId = -1;
                } else cohortId = results[0].cohort_id;

                // Check what skills are available for this cohort.
                let sqlQuery = `
            SELECT skills.id, name AS skill_name, parent, is_accessible, is_mastered, type, level, skills.order as skillorder, display_name, is_copy_of_skill_id, url, show_children
            FROM skills
            LEFT OUTER JOIN user_skills
            ON skills.id = user_skills.skill_id
            WHERE user_skills.user_id = ${conn.escape(userId)}
            AND is_filtered = 'available' 
            AND is_deleted = 0
            AND skills.id NOT IN 
            (SELECT skill_id 
            FROM cohort_skill_filters
            WHERE cohort_id = ${conn.escape(cohortId)})
            
            UNION
            SELECT skills.id, name, parent, "", "", type, level, skills.order as skillorder, display_name, is_copy_of_skill_id, url, ""
            FROM skills
            WHERE skills.id NOT IN 
            
            (SELECT skills.id
            FROM skills
            LEFT OUTER JOIN user_skills
            ON skills.id = user_skills.skill_id
            WHERE user_skills.user_id = ${conn.escape(userId)}) 
            AND is_filtered = 'available' 
            AND is_deleted = 0
            AND skills.id NOT IN 
            (SELECT skill_id 
            FROM cohort_skill_filters
            WHERE cohort_id = ${conn.escape(cohortId)})    
                
            ORDER BY skillorder, id;
            `;
                conn.query(sqlQuery, (err, results) => {
                    if (err) {
                        throw err;
                    }
                    // Give each object a 'children' element.
                    for (var i = 0; i < results.length; i++) {
                        results[i].children = [];
                    }

                    // Deal with skills that have multiple parents.
                    // These skills have secret copies in the table.
                    for (var i = 0; i < results.length; i++) {
                        if (results[i].display_name != null) {
                            results[i].skill_name = results[i].display_name;

                            for (var j = 0; j < results.length; j++) {
                                if (
                                    results[i].is_copy_of_skill_id ==
                                    results[j].id
                                ) {
                                    results[i].is_accessible =
                                        results[j].is_accessible;
                                    results[i].is_mastered =
                                        results[j].is_mastered;
                                }
                            }
                        }
                    }

                    // Assign children to parent skills.
                    for (var i = 0; i < results.length; i++) {
                        // Regular parent.
                        if (
                            results[i].parent != null &&
                            results[i].parent != 0
                        ) {
                            var parentId = results[i].parent;

                            // Go through all rows again, add children
                            for (let j = 0; j < results.length; j++) {
                                if (results[j].id == parentId) {
                                    results[j].children.push(results[i]);
                                }
                            }
                        }
                    }

                    let studentSkills = [];
                    for (var i = 0; i < results.length; i++) {
                        if (
                            results[i].parent == null ||
                            results[i].parent == 0
                        ) {
                            studentSkills.push(results[i]);
                        }
                    }
                    const skillList = convertNodesToArray(studentSkills);
                    const parentPath = findParentHaveHiddenChild(
                        skillList,
                        skillName
                    );
                    showHiddenChildFromParent(parentPath, req.params.userId);

                    return res.json({ mess: 'ok' });
                });
            } catch (err) {
                console.error(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

/**
 * Make skill unmastered.
 *
 * @return response()
 */
router.get('/unmastered/:userId/:skillId', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = `
        INSERT INTO user_skills (user_id, skill_id, is_mastered) 
        VALUES(${conn.escape(req.params.userId)}, ${conn.escape(
            req.params.skillId
        )}, 0) 
        ON DUPLICATE KEY UPDATE is_mastered=0;`;

        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.redirect('back');
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

/**
 * For making a skill mastered.
 *
 * 1) Making descendants unlocked.
 ** If children are categories, the function is applied to them recursively also. They are only unlocked.
 ** If children are regular skills, they become unlocked.
 ** If children are super skills (inner cluster nodes), their sub skills become unlocked.
 ** If the skill this is applied to is a sub skill, and all its sibling skills are also mastered,
 ** its parent (super skill) becomes mastered.
 *
 * 2) making ancestor domains unlocked.
 *
 */
router.post('/make-mastered/:userId', (req, res, next) => {
    if (req.session.userName) {
        // Store the skill data.
        let skill = req.body.skill;
        let userId = req.params.userId;

        // Get a list of all skills.
        let sqlQuery1 = 'SELECT * FROM skills;';
        conn.query(sqlQuery1, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                let skills = results;

                // Check if the skill that was mastered has any copies in the tree,
                // that also need to be made mastered now.
                let allSkillsToBeMadeMastered = [];
                allSkillsToBeMadeMastered.push(skill);
                for (let i = 0; i < skills.length; i++) {
                    if (skills[i].is_copy_of_skill_id == skill.id) {
                        allSkillsToBeMadeMastered.push(skills[i]);
                    }
                }

                // Get user skills.
                let sqlQuery2 = `
                SELECT skills.id, name, is_accessible, is_mastered, type
                FROM skills
                LEFT OUTER JOIN user_skills
                ON skills.id = user_skills.skill_id
                WHERE user_skills.user_id = ${conn.escape(req.params.userId)}
            
                UNION
                SELECT skills.id, name, "", "", type
                FROM skills
                WHERE skills.id NOT IN 
            
                (SELECT skills.id
                FROM skills
                LEFT OUTER JOIN user_skills
                ON skills.id = user_skills.skill_id
                WHERE user_skills.user_id = ${conn.escape(req.params.userId)})
                ORDER BY id;`;

                conn.query(sqlQuery2, (err, results) => {
                    try {
                        if (err) {
                            throw err;
                        }
                        let unnestedList = results;

                        for (
                            let i = 0;
                            i < allSkillsToBeMadeMastered.length;
                            i++
                        ) {
                            // Recursive function.
                            makeMastered(
                                req.params.userId,
                                allSkillsToBeMadeMastered[i]
                            );
                        }

                        // Functions that are called recursively.
                        function makeMastered(userId, skill) {
                            // We only unlock domains here because for domains we need to
                            // check their descendants recursively, while we dont do this
                            // for skills.
                            let value;
                            if (skill.type == 'domain') {
                                value = 0;
                            } else {
                                value = 1;
                            }

                            let sqlQuery = `
                            INSERT INTO user_skills (user_id, skill_id, is_mastered, is_accessible) 
                            VALUES(${conn.escape(req.params.userId)},
                            ${conn.escape(skill.id)},
                            ${conn.escape(value)},
                            1) 
                            ON DUPLICATE KEY UPDATE is_mastered= ${conn.escape(
                                value
                            )}, is_accessible=1;
                            `;

                            conn.query(sqlQuery, (err) => {
                                try {
                                    if (err) {
                                        throw err;
                                    }
                                    // Check if is a sub skill.
                                    if (skill.type != 'sub') {
                                        // Get all the child skills.
                                        const childSkills = [];
                                        for (
                                            let i = 0;
                                            i < skills.length;
                                            i++
                                        ) {
                                            if (skills[i].parent == skill.id) {
                                                childSkills.push(skills[i]);
                                            }
                                        }

                                        let subSkills = [];
                                        // Make them accessible/unlocked if regular type skills.
                                        for (
                                            let i = 0;
                                            i < childSkills.length;
                                            i++
                                        ) {
                                            if (
                                                childSkills[i].type == 'regular'
                                            ) {
                                                makeAccessible(
                                                    userId,
                                                    childSkills[i].id
                                                );
                                            } else if (
                                                childSkills[i].type == 'domain'
                                            ) {
                                                makeMastered(
                                                    userId,
                                                    childSkills[i]
                                                );
                                            }
                                            // If super type skills, make their subskills accessible.
                                            else if (
                                                childSkills[i].type == 'super'
                                            ) {
                                                for (
                                                    let j = 0;
                                                    j < skills.length;
                                                    j++
                                                ) {
                                                    if (
                                                        skills[j].parent ==
                                                            childSkills[i].id &&
                                                        skills[j].type == 'sub'
                                                    ) {
                                                        subSkills.push(
                                                            skills[j].id
                                                        );
                                                    }
                                                }
                                            }
                                        }
                                        for (
                                            let i = 0;
                                            i < subSkills.length;
                                            i++
                                        ) {
                                            makeAccessible(
                                                userId,
                                                subSkills[i]
                                            );
                                        }
                                    }
                                    // If this skill is a sub skill.
                                    else {
                                        // Get its sibling skills.
                                        let siblingSkills = [];
                                        for (
                                            let i = 0;
                                            i < skills.length;
                                            i++
                                        ) {
                                            if (
                                                skills[i].parent ==
                                                    skill.parent &&
                                                skills[i].id != skill.id
                                            ) {
                                                if (skills[i].type == 'sub') {
                                                    siblingSkills.push(
                                                        skills[i]
                                                    );
                                                }
                                            }
                                        }

                                        //Check if all the siblings are mastered.
                                        let allMastered = true;
                                        for (
                                            let i = 0;
                                            i < unnestedList.length;
                                            i++
                                        ) {
                                            for (
                                                let j = 0;
                                                j < siblingSkills.length;
                                                j++
                                            ) {
                                                if (
                                                    siblingSkills[j].id ==
                                                    unnestedList[i].id
                                                ) {
                                                    if (
                                                        unnestedList[i]
                                                            .is_mastered != 1
                                                    ) {
                                                        allMastered = false;
                                                    }
                                                }
                                            }
                                        }

                                        // If the others are, and now this one is, so unlock the super skill.
                                        if (allMastered) {
                                            makeAccessible(
                                                userId,
                                                skill.parent
                                            );
                                        }
                                    }
                                } catch (err) {
                                    next(err);
                                }
                            });
                        }
                        function makeAccessible(userId, skillId) {
                            // Make this skill accessible.
                            let sqlQuery3 = `
    INSERT INTO user_skills (user_id, skill_id, is_accessible) 
    VALUES(${conn.escape(userId)}, ${conn.escape(skillId)}, 1) 
    ON DUPLICATE KEY UPDATE is_accessible=1;
    `;
                            conn.query(sqlQuery3, (err) => {
                                try {
                                    if (err) {
                                        throw err;
                                    }
                                } catch (err) {
                                    next(err);
                                }
                            });
                        }

                        // This is to make any ancestor domains mastered.
                        MakeAncestorDomainsMastered(skill, userId);
                    } catch (err) {
                        next(err);
                    }
                });

                res.end();
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

function MakeAncestorDomainsMastered(skill, userId) {
    // Exit if this is a first level node.
    if (skill.parent == 0) {
        return;
    }

    // Get an updated list of user skills.
    let sqlQuery = `
SELECT skills.id, name, is_accessible, is_mastered, type, parent
FROM skills
LEFT OUTER JOIN user_skills
ON skills.id = user_skills.skill_id
WHERE user_skills.user_id = ${conn.escape(userId)}

UNION
SELECT skills.id, name, "", "", type, parent
FROM skills
WHERE skills.id NOT IN 

(SELECT skills.id
FROM skills
LEFT OUTER JOIN user_skills
ON skills.id = user_skills.skill_id
WHERE user_skills.user_id = ${conn.escape(userId)})
ORDER BY id;`;

    conn.query(sqlQuery, (err, results) => {
        try {
            if (err) {
                throw err;
            }
            let userSkills = results;

            // Go up hierarchy to find the first category node we can.
            for (let i = 0; i < userSkills.length; i++) {
                // Find recently mastered skill's parent.
                if (skill.parent == userSkills[i].id) {
                    let parent = userSkills[i];

                    // Check if it is a category.
                    if (parent.type == 'domain') {
                        // If it is, make it mastered.
                        let sqlQuery = `
                        INSERT INTO user_skills (user_id, skill_id, is_mastered, is_accessible) 
                        VALUES(${conn.escape(userId)},
                        ${conn.escape(parent.id)},
                        1, 1) 
                        ON DUPLICATE KEY UPDATE is_mastered= 1, is_accessible=1;
                        `;
                        conn.query(sqlQuery, (err) => {
                            try {
                                if (err) {
                                    throw err;
                                }
                                // Run again for parent.
                                MakeAncestorDomainsMastered(parent, userId);
                            } catch (err) {
                                console.log(err);
                                return;
                            }
                        });
                    } else {
                        return;
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }
    });
}

/*
 * TODO or TO DELETE.
 * For mastering domains. This has not been implemented and is not working.
 * The idea is that categories / domains get mastered only when all of the descendant skills
 * have been mastered.
 *
 * This is currently replaced by the above function, which simply makes a domain/category mastered
 * as soon as any of its descendants are mastered. This is done so as to get a line on the skill trees
 * that comes from the root node to the mastered node.
 */

function FindFirstAncestorDomain(skill, userId) {
    // Exit if this is a first level node.
    if (skill.parent == 0) {
        return;
    }

    // Get an updated list of user skills.

    let sqlQuery = `
SELECT skills.id, name, is_accessible, is_mastered, type, parent
FROM skills
LEFT OUTER JOIN user_skills
ON skills.id = user_skills.skill_id
WHERE user_skills.user_id = ${conn.escape(userId)}

UNION
SELECT skills.id, name, "", "", type, parent
FROM skills
WHERE skills.id NOT IN 

(SELECT skills.id
FROM skills
LEFT OUTER JOIN user_skills
ON skills.id = user_skills.skill_id
WHERE user_skills.user_id = ${conn.escape(userId)})
ORDER BY id;`;

    conn.query(sqlQuery, (err, results) => {
        try {
            if (err) {
                throw err;
            }

            let userSkills = results;
            // Go up hierarchy to find the first category node we can.
            // Store that as "domain".
            //
            // Go through all skills.
            for (let i = 0; i < userSkills.length; i++) {
                // Find skill parent.
                if (skill.parent == userSkills[i].id) {
                    let parent = userSkills[i];
                    if (parent.type == 'domain') {
                        // Get all of the domain's children.
                        let domainChildren = [];
                        for (let j = 0; j < userSkills.length; j++) {
                            if (userSkills[j].parent == parent.id) {
                                domainChildren.push(userSkills[j]);
                            }
                        }
                        // Save it and move to next function.
                        CheckIfDomainIsMastered(parent, domainChildren, userId);
                    } else {
                        // Run again for parent.
                        FindFirstAncestorDomain(userSkills, parent);
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }
    });
}

// Recursively check the domain's children, excluding subskills, including domains.
// If they are all mastered, the domain gets mastered.
// If the domain gets mastered, function then needs to find the next domain up and
// go again with that one.
function CheckIfDomainIsMastered(domain, parentChildren, userId) {
    let domainIsNowMastered = true;
    var i = parentChildren.length;
    while (i--) {
        // Check if mastered.
        // If not, exit.
        if (parentChildren[i].is_mastered != 1) {
            domainIsNowMastered = false;
            return;
        }
        // If yes, check if its descendants are also mastered.
        else {
            if (typeof parentChildren[i] !== 'undefined') {
                /*
                 * Run the above function again recursively.
                 */
                if (
                    parentChildren[i].children &&
                    Array.isArray(parentChildren[i].children) &&
                    parentChildren[i].children.length > 0
                )
                    CheckIfDomainIsMastered(parentChildren[i].children);
            }
        }
    }
    MakeDomainMastered(domain, userId);
}

// Need to make the domain mastered,
// and then check its first ancestor domain, to see if it should
// be made mastered.
function MakeDomainMastered(domain, userId) {
    let sqlQuery = `
INSERT INTO user_skills (user_id, skill_id, is_mastered, is_accessible) 
VALUES(${conn.escape(userId)}, ${conn.escape(domain.id)}, 1, 1) 
ON DUPLICATE KEY UPDATE is_mastered= 1, is_accessible=1;
`;

    conn.query(sqlQuery, (err, results) => {
        try {
            if (err) {
                throw err;
            }
            // Then need to check if this domain's parent is ready to become mastered.
            FindFirstAncestorDomain(domain, userId);
        } catch (err) {
            console.log(err);
        }
    });
}

router.get('*', (req, res) => {
    res.redirect('/');
});

module.exports = router;
