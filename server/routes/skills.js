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

//Middlewares
const isAuthenticated = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/adminMiddleware');
const checkRoleHierarchy = require('../middlewares/roleMiddleware');
const { recordUserAction } = require('../utilities/record-user-action');

/*------------------------------------------
--------------------------------------------
Routes
--------------------------------------------
--------------------------------------------*/

/**
 * Create New Item
 *
 * @return response()
 */
router.post('/add', isAuthenticated, isAdmin, async (req, res, next) => {
    // No need to escape single quotes for SQL to accept,
    // as using '?'.
    // Add the skill.
    let data = {};
    data = {
        name: req.body.name,
        description: req.body.description,
        parent: req.body.parent,
        icon_image: req.body.icon_image,
        banner_image: req.body.banner_image,
        mastery_requirements: req.body.mastery_requirements,
        type: req.body.type,
        level: req.body.level
    };

    // Insert the new skill.
    let sqlQuery1 = `INSERT INTO skills SET ?;`;
    let query = conn.query(sqlQuery1, data, (err, results) => {
        try {
            if (err) {
                throw err;
            } else {
                // Get its id.
                let sqlQuery2 = `SELECT LAST_INSERT_ID();`;
                let query = conn.query(sqlQuery2, data, (err, results) => {
                    const skillId = Object.values(results[0])[0];
                    try {
                        if (err) {
                            throw err;
                        } else {
                            // Add skill revision history (this is the first revision.)
                            let revisionHistoryQuery = `INSERT INTO skill_history
                            (id, version_number, user_id, name, description, icon_image, banner_image,
                            mastery_requirements, level)
                            VALUES
                            (${skillId},
                            1,
                            ${req.session.userId},
                            '${req.body.name}',                           
                            '${req.body.description}',
                            '${req.body.icon_image}',
                            '${req.body.banner_image}',
                            '${req.body.mastery_requirements}',
                            '${req.body.level}');`;

                            conn.query(revisionHistoryQuery, data, (err) => {
                                try {
                                    if (err) {
                                        throw err;
                                    } else {
                                        // add create skill action into user_actions
                                        const actionData = {
                                            action: 'create',
                                            content_id: skillId,
                                            user_id: req.session.userId,
                                            content_type: 'skill'
                                        };
                                        const actionQuery =
                                            'INSERT INTO user_actions SET ?';
                                        conn.query(
                                            actionQuery,
                                            actionData,
                                            (err) => {
                                                if (err) throw err;
                                                else {
                                                    // Insert any new filters for the skill.
                                                    for (
                                                        let i = 0;
                                                        i <
                                                        req.body.filters.length;
                                                        i++
                                                    ) {
                                                        let sqlQuery3 =
                                                            `
                            INSERT INTO skill_tags (skill_id, tag_id)
                            VALUES(` +
                                                            skillId +
                                                            `, ` +
                                                            req.body.filters[
                                                                i
                                                            ] +
                                                            `);`;
                                                        let query = conn.query(
                                                            sqlQuery3,
                                                            (err, results) => {
                                                                try {
                                                                    if (err) {
                                                                        throw err;
                                                                    } else {
                                                                        res.end();
                                                                    }
                                                                } catch (err) {
                                                                    next(err);
                                                                }
                                                            }
                                                        );
                                                    }
                                                }
                                            }
                                        );
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
            }
        } catch (err) {
            next(err);
        }
    });
});

/**
 * Get All Items
 *
 * @return response()
 */
// Used for choosing parent skill when adding a new skill.
router.get('/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = 'SELECT * FROM skills WHERE skills.is_deleted = 0';
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

// Nested List - for "Admin Role"
router.get('/nested-list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `
    SELECT id, name, parent, type, level, is_filtered, skills.order as skillorder
    FROM skills
    WHERE is_deleted = 0
    ORDER BY skillorder;`;
        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                // Create the 'children' array.
                for (var i = 0; i < results.length; i++) {
                    results[i].children = [];
                }

                for (var i = 0; i < results.length; i++) {
                    if (results[i].parent != null && results[i].parent != 0) {
                        var parentId = results[i].parent;
                        // go through all rows again, add children
                        for (let j = 0; j < results.length; j++) {
                            if (results[j].id == parentId) {
                                results[j].children.push(results[i]);
                            }
                        }
                    }
                }

                let nestedSkills = [];
                for (var i = 0; i < results.length; i++) {
                    if (results[i].parent == null || results[i].parent == 0) {
                        nestedSkills.push(results[i]);
                    }
                }

                res.json(nestedSkills);
            } catch (err) {
                next(err);
            }
        });
    }
});

// Filtered Nested List - for "Instructor Role"
router.get('/filtered-nested-list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `
    SELECT id, name, parent, type, level, skills.order as skillorder
    FROM skills
    WHERE is_filtered = 'available' AND is_deleted = 0
    ORDER BY skillorder;`;
        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                // Create the 'children' array.
                for (var i = 0; i < results.length; i++) {
                    results[i].children = [];
                }

                for (var i = 0; i < results.length; i++) {
                    if (results[i].parent != null && results[i].parent != 0) {
                        var parentId = results[i].parent;
                        // go through all rows again, add children
                        for (let j = 0; j < results.length; j++) {
                            if (results[j].id == parentId) {
                                results[j].children.push(results[i]);
                            }
                        }
                    }
                }

                let filteredNestedSkills = [];
                for (var i = 0; i < results.length; i++) {
                    if (results[i].parent == null || results[i].parent == 0) {
                        filteredNestedSkills.push(results[i]);
                    }
                }

                res.json(filteredNestedSkills);
            } catch (err) {
                next(err);
            }
        });
    }
});

/**
 * Get Single Item
 *
 * @return response()
 */
router.get('/show/:id', (req, res, next) => {
    let skill;
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        // Get skill.
        const sqlQuery = `SELECT *
                          FROM skills
                          WHERE skills.id = ${req.params.id} AND skills.is_deleted = 0`;
        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                skill = results[0];
                res.json(skill);
            } catch (err) {
                next(err);
            }
        });
    }
});

// For sending the mastery requirements data separately to the skill tree skill panels.
// We send it separately because otherwise, if we send it with the other data, it slows
// down the page load of the skill trees.
router.get('/mastery-requirements/:id', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        // Get skill.
        const sqlQuery = `SELECT mastery_requirements
                          FROM skills
                          WHERE skills.id = ${req.params.id} AND skills.is_deleted = 0`;
        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                masteryRequirements = results[0].mastery_requirements;
                res.json(masteryRequirements);
            } catch (err) {
                next(err);
            }
        });
    }
});

router.get('/record-visit/:id', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        //Register visit datetime.
        let visitSqlQuery = `
 INSERT INTO user_visited_skills (user_id, skill_id, visited_at)
 VALUES (${req.session.userId}, ${req.params.id}, NOW())
 ON DUPLICATE KEY UPDATE visited_at = NOW();
`;
        let visitQuery = conn.query(visitSqlQuery, (err) => {
            try {
                if (err) {
                    throw err;
                }
            } catch (err) {
                next(err);
            }
        });
    }
});

router.get('/last-visited', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        //Get last visited.
        let sqlQuery = `
            SELECT skills.id, name
            FROM user_visited_skills
            INNER JOIN skills ON skills.id = user_visited_skills.skill_id
            WHERE user_id = ${req.session.userId}
            AND skills.is_deleted = 0
            ORDER BY visited_at DESC
            LIMIT 5;
        `;

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
 * Edit Item
 *
 * @return response()
 */
router.put(
    '/:id/edit',
    isAuthenticated,
    checkRoleHierarchy('editor'),
    (req, res, next) => {
        if (req.session.userName) {
            // Prep data.
            // Escape single quotes for SQL to accept.
            if (req.body.name != null)
                req.body.name = req.body.name.replace(/'/g, "\\'");
            if (req.body.description != null)
                req.body.description = req.body.description.replace(
                    /'/g,
                    "\\'"
                );
            if (req.body.mastery_requirements != null)
                req.body.mastery_requirements =
                    req.body.mastery_requirements.replace(/'/g, "\\'");
            if (req.body.comment != null)
                req.body.comment = req.body.comment.replace(/'/g, "\\'");

            // Add new record to the skills_versions table.

            let versionNumber = req.body.version_number + 1;

            let addVersionHistoryInsertSQLQuery = `
                    INSERT INTO skill_history
                    (id, version_number, user_id, name, description, icon_image, banner_image,
                    mastery_requirements, level, skill_history.order, comment)
                    VALUES
                    (${req.params.id},
                    ${versionNumber},
                    ${req.session.userId},
                    '${req.body.name}',                    
                    '${req.body.description}',
                    '${req.body.icon_image}',
                    '${req.body.banner_image}',
                    '${req.body.mastery_requirements}',                    
                    '${req.body.level}',                    
                    ${req.body.order},
                    '${req.body.comment}');`;

            conn.query(addVersionHistoryInsertSQLQuery, (err) => {
                try {
                    if (err) {
                        throw err;
                    }

                    // Update record in skill table.
                    let updateRecordSQLQuery =
                        `UPDATE skills SET name = '` +
                        req.body.name +
                        `', parent = '` +
                        req.body.parent +
                        `', description = '` +
                        req.body.description +
                        `', icon_image = '` +
                        req.body.icon_image +
                        `', banner_image = '` +
                        req.body.banner_image +
                        `', mastery_requirements = '` +
                        req.body.mastery_requirements +
                        `', type = '` +
                        req.body.type +
                        `', level = '` +
                        req.body.level +
                        `', skills.order = ` +
                        req.body.order +
                        `, version_number = ${versionNumber}
                                , edited_date = current_timestamp
                                WHERE id = ` +
                        req.params.id +
                        `;`;

                    conn.query(updateRecordSQLQuery, (err, results) => {
                        try {
                            if (err) {
                                throw err;
                            } else {
                                // add edit (update) action into user_actions table
                                const actionData = {
                                    action: 'update',
                                    content_id: req.params.id,
                                    user_id: req.session.userId,
                                    content_type: 'skill'
                                };

                                const addActionQuery = `INSERT INTO user_actions SET ?`;
                                conn.query(
                                    addActionQuery,
                                    actionData,
                                    (err) => {
                                        if (err) throw err;
                                        res.end();
                                    }
                                );
                            }
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
    }
);

/**
 * Submit skill edit for review.
 *
 * @return response()
 */
router.post('/:id/edit-for-review', isAuthenticated, (req, res, next) => {
    if (req.session.userName) {
        // Prep data.
        // Escape single quotes for SQL to accept.
        if (req.body.mastery_requirements != null)
            req.body.mastery_requirements =
                req.body.mastery_requirements.replace(/'/g, "\\'");
        if (req.body.comment != null)
            req.body.comment = req.body.comment.replace(/'/g, "\\'");

        // Add data.
        let sqlQuery = `INSERT INTO skills_awaiting_approval (skill_id, user_id, mastery_requirements, icon_image, banner_image, comment)
         VALUES (${req.params.id}, ${req.body.userId}, '${req.body.mastery_requirements}', '${req.body.icon_image}', '${req.body.banner_image}', 
         '${req.body.comment}')
         
         ON DUPLICATE KEY
         UPDATE mastery_requirements = '${req.body.mastery_requirements}', date = CURRENT_TIMESTAMP(), icon_image = '${req.body.icon_image}', banner_image = '${req.body.banner_image}', comment = '${req.body.comment}';`;

        // Update record in skill table.

        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                } else {
                    recordUserAction(
                        {
                            userId: req.body.userId,
                            userAction: 'submit_update_for_review',
                            contentId: req.params.id,
                            contentType: 'skill'
                        },
                        (err) => {
                            if (err) {
                                throw err;
                            } else {
                                res.end();
                            }
                        }
                    );
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
 * Save item submitted for review.
 *
 * @return response()
 */
router.put(
    '/:id/edit-for-review/save',
    isAuthenticated,
    checkRoleHierarchy('editor'),
    (req, res, next) => {
        if (req.session.userName) {
            // Prep data.
            // Escape single quotes for SQL to accept.
            if (req.body.mastery_requirements != null)
                req.body.mastery_requirements =
                    req.body.mastery_requirements.replace(/'/g, "\\'");
            if (req.body.comment != null)
                req.body.comment = req.body.comment.replace(/'/g, "\\'");

            // Add old record to the skills_versions table.
            // insert the above into the skills_version table,
            // along with the new fields
            let getPreviousRecordSQLQuery =
                `SELECT * FROM skills where id = ` + req.params.id;

            conn.query(getPreviousRecordSQLQuery, (err, results) => {
                try {
                    if (err) {
                        throw err;
                    }

                    let previousId = results[0].id;
                    let previousName = results[0].name;
                    let previousDescription = results[0].description;
                    let previousLevel = results[0].level;
                    let previousOrder = results[0].order;
                    let versionNumber = results[0].version_number;

                    // Escape single quotes for SQL to accept.
                    if (previousName != null)
                        previousName = previousName.replace(/'/g, "\\'");
                    if (previousDescription != null)
                        previousDescription = previousDescription.replace(
                            /'/g,
                            "\\'"
                        );
                    versionNumber = versionNumber + 1;

                    let addVersionHistoryInsertSQLQuery = `
                    INSERT INTO skill_history
                    (id, version_number, user_id, name, description, icon_image, banner_image,
                    mastery_requirements, level, skill_history.order, comment)
                    VALUES
                    (${previousId},
                    ${versionNumber},
                    ${req.session.userId},
                    '${previousName}',                    
                    '${previousDescription}',
                    '${req.body.icon_image}',
                    '${req.body.banner_image}',
                    '${req.body.mastery_requirements}',                    
                    '${previousLevel}',                    
                    ${previousOrder},
                    '${req.body.comment}');`;

                    conn.query(addVersionHistoryInsertSQLQuery, (err) => {
                        try {
                            if (err) {
                                throw err;
                            }

                            // Update record in skill table.
                            let updateRecordSQLQuery =
                                `UPDATE skills SET 
                                mastery_requirements = '` +
                                req.body.mastery_requirements +
                                `', icon_image = '` +
                                req.body.icon_image +
                                `', banner_image = '` +
                                req.body.banner_image +
                                `', version_number = ${versionNumber}                               
                                WHERE id = ` +
                                req.params.id +
                                `;`;

                            conn.query(updateRecordSQLQuery, (err) => {
                                try {
                                    if (err) {
                                        throw err;
                                    } else {
                                        recordUserAction(
                                            {
                                                userId: req.session.userId,
                                                userAction: `${
                                                    req.body.edit
                                                        ? 'edit_and_approve'
                                                        : 'approve'
                                                }`,
                                                contentId: req.params.id,
                                                contentType: 'skill'
                                            },
                                            (err) => {
                                                if (err) {
                                                    throw err;
                                                } else {
                                                    res.end();
                                                }
                                            }
                                        );
                                    }
                                } catch (err) {
                                    next(err);
                                }
                            });
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
    }
);

/**
 * Get all skill mastery requirements submitted for review.
 *
 * @return response()
 */
// Used for choosing parent skill when adding a new skill.
router.get('/submitted-for-review/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = 'SELECT * FROM skills_awaiting_approval';
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
 * Get one skill mastery requirement submitted for review.
 *
 * @return response()
 */
router.get('/submitted-for-review/:skillId/:userId', (req, res, next) => {
    let skill;
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        // Get skill.
        const sqlQuery = `SELECT *
                          FROM skills_awaiting_approval
                          WHERE skill_id = ${req.params.skillId}
                          AND user_id = ${req.params.userId}`;
        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                skill = results[0];
                res.json(skill);
            } catch (err) {
                next(err);
            }
        });
    }
});

/**
 * Delete skill mastery requirement submitted for review.
 *
 * @return response()
 */
router.delete('/submitted-for-review/:skillId/:userId', (req, res, next) => {
    if (req.session.userName) {
        const deleteQuery = `DELETE 
                             FROM skills_awaiting_approval
                             WHERE skill_id = ${req.params.skillId}
                             AND user_id  = ${req.params.userId};`;
        conn.query(deleteQuery, (err) => {
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
        const deleteQuery = `UPDATE skills SET is_deleted = 1 WHERE skills.id=${req.params.id}`;
        conn.query(deleteQuery, (err) => {
            try {
                if (err) {
                    throw err;
                } else {
                    // add delete skill actions into user_actions table
                    const actionData = {
                        action: 'delete',
                        content_id: req.params.id,
                        user_id: req.session.userId,
                        content_type: 'skill'
                    };
                    const addActionQuery = 'INSERT INTO user_actions SET ?';
                    conn.query(addActionQuery, actionData, (err) => {
                        if (err) throw err;
                        else res.end();
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

// Learning Resources
// List all for a particular skill.
router.get('/:id/resources', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT * FROM resources WHERE skill_id= ${req.params.id} AND is_deleted = 0`;
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

// Questions -------------------
/**
 * Get All Items
 *
 * @return response()
 */
router.get('/:id/mc-questions/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT * FROM mc_questions WHERE skill_id = ${req.params.id} AND is_deleted = 0`;
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

router.get('/:id/essay-questions/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT * FROM essay_questions WHERE skill_id = ${req.params.id} AND is_deleted = 0`;
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
 * Create New MC Questions
 * From CSV file.
 *
 * @return response()
 */
router.post('/:id/mc-questions/add', (req, res, next) => {
    if (req.session.userName) {
        // No need to escape single quotes for SQL to accept,
        // as using '?'.
        // Trim whitespace off the CSVs (Generative AI adds whitespace to the questions).
        // For each question.
        for (let i = 0; i < req.body.questionArray.length; i++) {
            // Add the questions.
            let data = {};
            data = {
                name: req.body.questionArray[i].name.trim(),
                question: req.body.questionArray[i].question.trim(),
                correct_answer: req.body.questionArray[i].correct_answer.trim(),
                incorrect_answer_1:
                    req.body.questionArray[i].incorrect_answer_1.trim(),
                incorrect_answer_2:
                    req.body.questionArray[i].incorrect_answer_2.trim(),
                incorrect_answer_3:
                    req.body.questionArray[i].incorrect_answer_3.trim(),
                incorrect_answer_4:
                    req.body.questionArray[i].incorrect_answer_4.trim(),
                explanation: req.body.questionArray[i].explanation.trim(),
                skill_id: req.params.id
            };
            let sqlQuery = 'INSERT INTO mc_questions SET ?';
            let query = conn.query(sqlQuery, data, (err, results) => {
                try {
                    if (err) {
                        throw err;
                    } else {
                        // add bulk-create mc_question to user_actions
                        const actionData = {
                            action: 'bulk-create',
                            content_type: 'mc_question',
                            content_id: results.insertId,
                            user_id: req.session.userId
                        };
                        const addActionQuery = `INSERT INTO user_actions SET ?`;
                        conn.query(addActionQuery, actionData, (err) => {
                            if (err) {
                                throw err;
                            } else {
                                res.end();
                            }
                        });
                    }
                } catch (err) {
                    next(err);
                }
            });
        }
    } else {
        res.redirect('/login');
    }
});

/**
 * Create New Essay Questions
 * From CSV file.
 * @return response()
 */
router.post('/:id/essay-questions/add', (req, res, next) => {
    if (req.session.userName) {
        // For each question.
        // No need to escape single quotes for SQL to accept,
        // as using '?'.
        // Trim whitespace off the CSVs (Generative AI adds whitespace to the questions).
        for (let i = 0; i < req.body.questionArray.length; i++) {
            // Add skill.
            let data = {};
            data = {
                name: req.body.questionArray[i].name.trim(),
                question: req.body.questionArray[i].question.trim(),
                skill_id: req.params.id
            };
            let sqlQuery = 'INSERT INTO essay_questions SET ?';
            query = conn.query(sqlQuery, data, (err, results) => {
                try {
                    if (err) {
                        throw err;
                    } else {
                        const actionData = {
                            action: 'bulk-create',
                            content_id: results.insertId,
                            content_type: 'essay_question',
                            user_id: req.session.userId
                        };
                        const addActionQuery = `INSERT INTO user_actions SET ?`;
                        conn.query(addActionQuery, actionData, (err) => {
                            if (err) throw err;
                            else res.end();
                        });
                    }
                } catch (err) {
                    next(err);
                }
            });
        }
    } else {
        res.redirect('/login');
    }
});

// router.get('*', (req, res) => {
//     res.redirect('/');
// });

module.exports = router;
