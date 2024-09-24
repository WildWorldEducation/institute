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
    conn.query(sqlQuery1, data, (err, results) => {
        try {
            if (err) {
                throw err;
            } else {
                // Get its id.
                let sqlQuery2 = `SELECT LAST_INSERT_ID();`;
                conn.query(sqlQuery2, data, (err, results) => {
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
                            (${conn.escape(skillId)},
                            1,
                            ${conn.escape(req.session.userId)},
                            ${conn.escape(
                                req.body.name
                            )},                           
                            ${conn.escape(req.body.description)},
                            ${conn.escape(req.body.icon_image)},
                            ${conn.escape(req.body.banner_image)},
                            ${conn.escape(req.body.mastery_requirements)},
                            ${conn.escape(req.body.level)});`;

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
                                                        let sqlQuery3 = `
                            INSERT INTO skill_tags (skill_id, tag_id)
                            VALUES(${conn.escape(skillId)},
                            ${conn.escape(req.body.filters[i])});`;

                                                        conn.query(
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

// Create a new instance of an existing skill,
// in order to have the skill show in more than one place in the tree.
router.post(
    '/add/new-instance',
    isAuthenticated,
    isAdmin,
    async (req, res, next) => {
        let skill;

        res.setHeader('Content-Type', 'application/json');
        // Get skill that is to be copied.
        const sqlQuery = `SELECT *
                          FROM skills
                          WHERE skills.id = ${conn.escape(
                              req.body.skillToBeCopied.id
                          )} AND skills.is_deleted = 0;`;

        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                skill = results[0];

                // Deal with case when skill to be copied is a sub skill,
                // and new parent is not a super skill.
                if (
                    skill.type == 'sub' &&
                    req.body.parentOfNewInstance.type != 'super'
                ) {
                    skill.type = 'regular';
                }

                data = {
                    name: skill.name + ' copy',
                    parent: req.body.parentOfNewInstance.id,
                    description: skill.description,
                    icon_image: skill.icon_image,
                    banner_image: skill.banner_image,
                    mastery_requirements: skill.mastery_requirements,
                    type: skill.type,
                    level: skill.level,
                    is_filtered: skill.is_filtered,
                    order: skill.order,
                    is_copy_of_skill_id: req.body.skillToBeCopied.id,
                    display_name: skill.name
                };

                // Create the copy with new parent.
                let sqlQuery1 = `INSERT INTO skills SET ?;`;
                conn.query(sqlQuery1, data, (err, results) => {
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
    }
);

/**
 * Get All Items
 *
 * @return response()
 */
// Used for choosing parent skill when adding a new skill.
router.get('/list', (req, res, next) => {
    // Route is accessible for guest users.
    res.setHeader('Content-Type', 'application/json');
    let sqlQuery =
        'SELECT id, name, parent, type, level, url FROM skills WHERE skills.is_deleted = 0';
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
});

// Nested List - for "Admin Role"
router.get('/nested-list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `
    SELECT id, name, parent, type, level, is_filtered, skills.order as skillorder, display_name, url
    FROM skills
    WHERE is_deleted = 0
    ORDER BY skillorder;`;
        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                // Create the 'children' array.
                for (var i = 0; i < results.length; i++) {
                    results[i].children = [];
                }

                // Deal with skills that have multiple parents.
                // These skills have secret copies in the table.
                for (var i = 0; i < results.length; i++) {
                    if (results[i].display_name != null) {
                        results[i].name = results[i].display_name;
                    }
                }

                // Add children to the parents.
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

                // Create first level of array.
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

// Filtered Nested List - for "Instructor Role" and for "Guest Access" (no account)
router.get('/filtered-nested-list', (req, res, next) => {
    // Not checking if user is logged in, as this is available for guest access.
    res.setHeader('Content-Type', 'application/json');
    let sqlQuery = `
    SELECT id, name, parent, type, level, skills.order as skillorder, display_name, url
    FROM skills
    WHERE is_filtered = 'available' AND is_deleted = 0
    ORDER BY skillorder;`;
    conn.query(sqlQuery, (err, results) => {
        try {
            if (err) {
                throw err;
            }

            // Create the 'children' array.
            for (var i = 0; i < results.length; i++) {
                results[i].children = [];
            }

            // Deal with skills that have multiple parents.
            // These skills have secret copies in the table.
            for (var i = 0; i < results.length; i++) {
                if (results[i].display_name != null) {
                    results[i].name = results[i].display_name;
                }
            }

            // First parent.
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

            // Add first level of array.
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
});

/**
 * Get Single Item
 *
 * @return response()
 */
router.get('/show/:id', (req, res, next) => {
    let skill;
    // Not checking if user is logged in, as this is available for guest access.
    res.setHeader('Content-Type', 'application/json');
    // Get skill.
    const sqlQuery = `SELECT * FROM skills
    WHERE skills.id = ${conn.escape(req.params.id)} 
    AND skills.is_deleted = 0`;

    conn.query(sqlQuery, (err, results) => {
        try {
            if (err) {
                throw err;
            }
            skill = results[0];

            if (typeof skill !== 'undefined' && skill) {
                if (skill.is_copy_of_skill_id != null) {
                    const sqlQueryForCopiedSkillNode = `SELECT *
                FROM skills
                WHERE skills.id = ${conn.escape(skill.is_copy_of_skill_id)}
                AND skills.is_deleted = 0;`;

                    conn.query(sqlQueryForCopiedSkillNode, (err, results) => {
                        try {
                            if (err) {
                                throw err;
                            }
                            let skill2 = results[0];
                            skill2.is_copy_of_skill_id = skill2.id;
                            skill2.type = skill.type;
                            skill2.parent = skill.parent;
                            skill2.version_number = skill.version_number;
                            res.json(skill2);
                        } catch (err) {
                            next(err);
                        }
                    });
                } else {
                    res.json(skill);
                }
            } else {
                res.end();
            }
        } catch (err) {
            next(err);
        }
    });
});

router.get('/url/:skillUrl', (req, res, next) => {
    let skill;
    // Not checking if user is logged in, as this is available for guest access.
    res.setHeader('Content-Type', 'application/json');
    // Get skill.
    const sqlQuery = `SELECT *
                          FROM skills
                          WHERE skills.url = ${conn.escape(
                              req.params.skillUrl
                          )} AND is_deleted = 0`;

    conn.query(sqlQuery, (err, results) => {
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
});

// For sending the mastery requirements data separately to the skill tree skill panels.
// We send it separately because otherwise, if we send it with the other data, it slows
// down the page load of the skill trees.
router.get('/mastery-requirements/:id', (req, res, next) => {
    // Not checking if user is logged in, as this is available for guest access.
    res.setHeader('Content-Type', 'application/json');
    // Get skill.
    const sqlQuery = `SELECT mastery_requirements, url
    FROM skills
    WHERE skills.id = ${conn.escape(req.params.id)}
     AND skills.is_deleted = 0;`;

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
});

router.get('/record-visit/:id', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        //Register visit datetime.
        let visitSqlQuery = `
 INSERT INTO user_visited_skills (user_id, skill_id, visited_at)
 VALUES (${conn.escape(req.session.userId)}, ${conn.escape(
            req.params.id
        )}, NOW())
 ON DUPLICATE KEY UPDATE visited_at = NOW();
`;
        conn.query(visitSqlQuery, (err) => {
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
            WHERE user_id = ${conn.escape(req.session.userId)}
            AND skills.is_deleted = 0
            ORDER BY visited_at DESC
            LIMIT 5;
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
 * Edit Skill
 *
 * @return response()
 */
router.put(
    '/:id/edit',
    isAuthenticated,
    checkRoleHierarchy('editor'),
    (req, res, next) => {
        if (req.session.userName) {
            // Add new record to the skills_versions table.
            let versionNumber = req.body.version_number + 1;

            let addVersionHistoryInsertSQLQuery = `
                    INSERT INTO skill_history
                    (id, version_number, user_id, name, description, icon_image, banner_image,
                    mastery_requirements, level, skill_history.order, comment)
                    VALUES
                    (${conn.escape(req.params.id)},
                    ${conn.escape(versionNumber)},
                    ${conn.escape(req.session.userId)},
                    ${conn.escape(req.body.name)},                    
                    ${conn.escape(req.body.description)},
                    ${conn.escape(req.body.icon_image)},
                    ${conn.escape(req.body.banner_image)},
                    ${conn.escape(
                        req.body.mastery_requirements
                    )},                    
                    ${conn.escape(req.body.level)},                    
                    ${conn.escape(req.body.order)},
                    ${conn.escape(req.body.comment)});`;

            conn.query(addVersionHistoryInsertSQLQuery, (err) => {
                try {
                    if (err) {
                        throw err;
                    }

                    // Update record in skill table.
                    let updateRecordSQLQuery = `UPDATE skills 
                        SET name = ${conn.escape(req.body.name)}, 
                        parent = ${conn.escape(req.body.parent)},
                        description = ${conn.escape(req.body.description)}, 
                        icon_image = ${conn.escape(req.body.icon_image)}, 
                        banner_image = ${conn.escape(req.body.banner_image)}, 
                        mastery_requirements = ${conn.escape(
                            req.body.mastery_requirements
                        )}, 
                        type = ${conn.escape(req.body.type)}, 
                        level = ${conn.escape(req.body.level)}, 
                        skills.order = ${conn.escape(req.body.order)}, 
                        version_number = ${conn.escape(versionNumber)}, 
                        edited_date = current_timestamp
                        WHERE id = ${conn.escape(req.params.id)};`;

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
         VALUES (${conn.escape(req.params.id)}, 
         ${conn.escape(req.body.userId)}, 
         ${conn.escape(req.body.mastery_requirements)}, 
         ${conn.escape(req.body.icon_image)}, 
         ${conn.escape(req.body.banner_image)}, 
         ${conn.escape(req.body.comment)})
         
         ON DUPLICATE KEY
         UPDATE mastery_requirements = ${conn.escape(
             req.body.mastery_requirements
         )}, 
         date = CURRENT_TIMESTAMP(), 
         icon_image = ${conn.escape(req.body.icon_image)}, 
         banner_image = ${conn.escape(req.body.banner_image)}, 
         comment = ${conn.escape(req.body.comment)};`;

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
 * Accept skill submitted for review.
 *
 * @return response()
 */
router.put(
    '/:id/edit-for-review/save',
    isAuthenticated,
    checkRoleHierarchy('editor'),
    (req, res, next) => {
        if (req.session.userName) {
            // Add old record to the skills_versions table.
            // insert the above into the skills_version table,
            // along with the new fields
            let getPreviousRecordSQLQuery = `SELECT * FROM skills where id = ${conn.escape(
                req.params.id
            )};`;

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
                    (${conn.escape(previousId)},
                    ${conn.escape(versionNumber)},
                    ${conn.escape(req.session.userId)},
                    ${conn.escape(previousName)},                    
                    ${conn.escape(previousDescription)},
                    ${conn.escape(req.body.icon_image)},
                    ${conn.escape(req.body.banner_image)},
                    ${conn.escape(
                        req.body.mastery_requirements
                    )},                    
                    ${conn.escape(previousLevel)},                    
                    ${conn.escape(previousOrder)},
                    ${conn.escape(req.body.comment)});`;

                    conn.query(addVersionHistoryInsertSQLQuery, (err) => {
                        try {
                            if (err) {
                                throw err;
                            }

                            // Update record in skill table.
                            let updateRecordSQLQuery = `UPDATE skills SET 
                            mastery_requirements = ${conn.escape(
                                req.body.mastery_requirements
                            )}, 
                            icon_image = ${conn.escape(req.body.icon_image)}, 
                            banner_image = ${conn.escape(
                                req.body.banner_image
                            )}, 
                            version_number = ${conn.escape(
                                versionNumber
                            )}                               
                            WHERE id = ${conn.escape(req.params.id)};`;

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
 * Get all skills submitted for review.
 *
 * @return response()
 */
// Used for choosing parent skill when adding a new skill.
router.get('/submitted-for-review/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT * 
             FROM skills_awaiting_approval JOIN skills ON skills_awaiting_approval.skill_id = skills.id
             ORDER BY skills_awaiting_approval.date DESC
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
 * Get one skill submitted for review.
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
                          WHERE skill_id = ${conn.escape(req.params.skillId)}
                          AND user_id = ${conn.escape(req.params.userId)};`;

        conn.query(sqlQuery, (err, results) => {
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
 * Delete skill submitted for review.
 *
 * @return response()
 */
router.delete('/submitted-for-review/:skillId/:userId', (req, res, next) => {
    if (req.session.userName) {
        const deleteQuery = `DELETE 
                             FROM skills_awaiting_approval
                             WHERE skill_id = ${conn.escape(req.params.skillId)}
                             AND user_id  = ${conn.escape(req.params.userId)};`;

        conn.query(deleteQuery, (err) => {
            try {
                if (err) {
                    throw err;
                }
                // Add dismiss actions
                const actionData = {
                    action: 'dismiss-edit',
                    content_id: req.params.skillId,
                    user_id: req.session.userId,
                    content_type: 'skill'
                };

                const addActionQuery = `INSERT INTO user_actions SET ?`;
                conn.query(addActionQuery, actionData, (err) => {
                    if (err) throw err;
                    res.end();
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

/**
 * Delete Item
 *
 * @return response()
 */
router.delete('/:id', (req, res, next) => {
    if (req.session.userName) {
        const deleteQuery = `UPDATE skills SET is_deleted = 1 WHERE skills.id=${conn.escape(
            req.params.id
        )};`;
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
    // Not checking if user is logged in, as this is available for guest access.
    res.setHeader('Content-Type', 'application/json');
    let sqlQuery = `SELECT resources.id, resources.user_id, resources.skill_id, resources.content,
resources.created_at, users.username, users.avatar  
FROM resources
JOIN users ON resources.user_id = users.id
WHERE skill_id= ${conn.escape(req.params.id)}
AND resources.is_deleted = 0`;

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
        let sqlQuery = `SELECT * 
        FROM mc_questions 
        WHERE skill_id = ${conn.escape(req.params.id)} 
        AND is_deleted = 0`;
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

router.get('/:id/essay-questions/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT * 
        FROM essay_questions 
        WHERE skill_id = ${conn.escape(req.params.id)} 
        AND is_deleted = 0`;

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

router.get('/:id/image-questions/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT * 
        FROM image_questions 
        WHERE skill_id = ${conn.escape(req.params.id)} 
        AND is_deleted = 0`;
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
            conn.query(sqlQuery, data, (err, results) => {
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
