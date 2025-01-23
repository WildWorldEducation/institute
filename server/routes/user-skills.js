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
// For Full Vertical Tree - includes filters.
router.get('/filter-by-cohort/full-vertical-tree/:userId', (req, res, next) => {
    if (req.session.userName) {
        /* Apply grade level, subject and isUnlockedOnly filters
         */
        let subjects = req.query.subjects;
        // To deal with problems related to the "&" sign in "Science & Invention".
        subjects = subjects.replace(
            'Science and Invention',
            'Science & Invention'
        );

        let isUnlockedOnly = req.query.isUnlockedOnly;

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

                // If no results, set to -1, as this basically skip this part of the query.
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

                                // Only unlocked skills
                                if (isUnlockedOnly == 1) {
                                    // Go through all rows again, add children
                                    for (let j = 0; j < results.length; j++) {
                                        if (results[j].id == parentId) {
                                            if (results[i].is_accessible == 1) {
                                                results[j].children.push(
                                                    results[i]
                                                );
                                            }
                                        }
                                    }
                                }
                                // Locked and unlocked skills
                                else {
                                    // Go through all rows again, add children
                                    for (let j = 0; j < results.length; j++) {
                                        if (results[j].id == parentId) {
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
                                // Filter by subject.
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
                                        // Add a flag to say this node has child skills, so it can be expanded.
                                        results[j].has_children = true;
                                        // Here we show or hide the child nodes for the Vertical Tree
                                        // based on whether the student has collapsed the node or not.
                                        if (results[j].show_children == 1) {
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
                                results[i].parent == null ||
                                results[i].parent == 0
                            ) {
                                studentSkills.push(results[i]);
                            }
                        }

                        // Find the depth of nodes expanded, to determine width of Vertical Tree
                        // let depth = 0;
                        // let skillDepth;
                        // function determineDepth(parentChildren, depth) {
                        //     depth++;
                        //     skillDepth = depth;
                        //     var i = parentChildren.length;
                        //     while (i--) {
                        //         if (typeof parentChildren[i] !== 'undefined') {
                        //             /*
                        //              * Run the above function again recursively.
                        //              */
                        //             if (
                        //                 parentChildren[i].children &&
                        //                 Array.isArray(
                        //                     parentChildren[i].children
                        //                 ) &&
                        //                 parentChildren[i].children.length > 0
                        //             )
                        //                 determineDepth(
                        //                     parentChildren[i].children,
                        //                     depth
                        //                 );
                        //         }
                        //     }
                        // }

                        // determineDepth(studentSkills, depth);
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

/* Nested list of user-skills, filtered by 1 cohort that student is a member of*/
// For Instructor Student Skill Tree - includes filters.
router.get(
    '/filter-by-cohort/instructor-student-vertical-tree/:studentId',
    (req, res, next) => {
        if (req.session.userName) {
            /* Apply grade level, subject and isUnlockedOnly filters
             */
            let subjects = req.query.subjects;
            // To deal with problems related to the "&" sign in "Science & Invention".
            subjects = subjects.replace(
                'Science and Invention',
                'Science & Invention'
            );

            let isUnlockedOnly = req.query.isUnlockedOnly;

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

                    // If no results, set to -1, as this basically skip this part of the query.
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
                                    results[i].skill_name =
                                        results[i].display_name;

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

                                    // Only unlocked skills
                                    if (isUnlockedOnly == 1) {
                                        // Go through all rows again, add children
                                        for (
                                            let j = 0;
                                            j < results.length;
                                            j++
                                        ) {
                                            if (results[j].id == parentId) {
                                                if (
                                                    results[i].is_accessible ==
                                                    1
                                                ) {
                                                    results[j].children.push(
                                                        results[i]
                                                    );
                                                }
                                            }
                                        }
                                    }
                                    // Locked and unlocked skills
                                    else {
                                        // Go through all rows again, add children
                                        for (
                                            let j = 0;
                                            j < results.length;
                                            j++
                                        ) {
                                            if (results[j].id == parentId) {
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
                                    // Filter by subject.
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
    }
);

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
 * Making descendants accessible:
 ** If children are regular skills or categories, they become unlocked.
 ** If children are super skills (inner cluster nodes), their sub skills become unlocked.
 ** If the skill this is applied to is a sub skill, and all its sibling skills are also mastered,
 ** its parent (super skill) becomes unlocked.
 */
router.post('/make-mastered/:userId', (req, res, next) => {
    if (req.session.userName) {
        // Store the skill data.
        let skillId = req.body.skill.id;

        // Get a list of all skills.
        let sqlQuery1 = 'SELECT * FROM skills;';
        conn.query(sqlQuery1, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                let skills = results;

                // Check if the skill that is getting mastered has any copies in the tree,
                // that also need to be made mastered now.
                let allSkillsToBeMadeMastered = [];

                for (let i = 0; i < skills.length; i++) {
                    if (
                        skills[i].is_copy_of_skill_id == skillId ||
                        skills[i].id == skillId
                    ) {
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

                        function makeMastered(userId, skill) {
                            let sqlQuery = `
                            INSERT INTO user_skills (user_id, skill_id, is_mastered, is_accessible) 
                            VALUES(${conn.escape(req.params.userId)},
                            ${conn.escape(skill.id)},
                            1,
                            1) 
                            ON DUPLICATE KEY UPDATE is_mastered= 1, is_accessible=1;
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
                                                childSkills[i].type ==
                                                    'regular' ||
                                                childSkills[i].type == 'domain'
                                            ) {
                                                makeAccessible(
                                                    userId,
                                                    childSkills[i].id
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

/*
 * To recommend the next skill after completing one.
 * Shows the next node in the "branch".
 */
router.get(
    '/get-next-accessible-in-branch/:userId/:skillId',
    (req, res, next) => {
        if (req.session.userName) {
            let sqlQuery = `
        	SELECT skills.id, name, url, level
            FROM skills
            JOIN user_skills
            ON skills.id = user_skills.skill_id
            WHERE user_id = '${req.params.userId}'
            AND skills.parent = ${req.params.skillId}
            AND is_accessible = 1
            AND (is_mastered IS NULL OR is_mastered <> 1);
            `;

            console.log(sqlQuery);

            conn.query(sqlQuery, (err, results) => {
                try {
                    if (err) {
                        throw err;
                    }

                    console.log(results);
                    res.json(results);
                } catch (err) {
                    next(err);
                }
            });
        } else {
            res.redirect('/login');
        }
    }
);

router.get('*', (req, res) => {
    res.redirect('/');
});

module.exports = router;
