/*------------------------------------------
--------------------------------------------
Middleware
--------------------------------------------
--------------------------------------------*/
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const fs = require('node:fs/promises');
router.use(bodyParser.json());
/*
/AWS S3 images
*/
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
// S3 needs access to the .env variables
require('dotenv').config();
const skillInfoboxImagesBucketName =
    process.env.S3_SKILL_INFOBOX_IMAGE_BUCKET_NAME;
const skillInfoboxImageThumbnailsBucketName =
    process.env.S3_SKILL_INFOBOX_IMAGE_THUMBNAILS_BUCKET_NAME;
const userAvatarImageThumbnailsBucketName =
    process.env.S3_USER_AVATAR_IMAGE_THUMBNAILS_BUCKET_NAME;
const bucketRegion = process.env.S3_BUCKET_REGION;
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const accessSecretKey = process.env.S3_SECRET_ACCESS_KEY;
const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: accessSecretKey
    },
    region: bucketRegion
});
const sharp = require('sharp');
const dayjs = require('dayjs');

// DB
const conn = require('../config/db');

//Middlewares
const isAuthenticated = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/adminMiddleware');
const checkRoleHierarchy = require('../middlewares/roleMiddleware');
const { recordUserAction } = require('../utilities/record-user-action');

// Helper Function
const { saveIconToAWS } = require('../utilities/save-image-to-aws');
const {
    getVectorData,
    insertSkillsVectorIntoDataBase
} = require('../utilities/vectorization-skill');
/*------------------------------------------
--------------------------------------------
Routes
--------------------------------------------
--------------------------------------------*/
/**
 * Create New Item
 *
 */
router.post(
    '/add',
    isAuthenticated,
    checkRoleHierarchy('editor'),
    async (req, res, next) => {
        // Add the skill.
        let data = {};
        data = {
            name: req.body.name,
            description: req.body.description,
            parent: req.body.parent,
            mastery_requirements: req.body.mastery_requirements,
            type: req.body.type,
            level: req.body.level
        };

        // Create the skill page url field.
        data.url = data.name.replace(/\//g, 'or');
        data.url = data.url.replace(/ /g, '_');

        /*
         * Send icon image to S3
         */
        // Check if empty.
        if (req.body.icon_image.length > 1) {
            // Get file from Base64 encoding (client sends as base64)
            let fileData = Buffer.from(
                req.body.icon_image.replace(/^data:image\/\w+;base64,/, ''),
                'base64'
            );

            let fullSizeData = {
                // The name it will be saved as on S3
                Key: data.url,
                // The image
                Body: fileData,
                ContentEncoding: 'base64',
                ContentType: 'image/jpeg',
                // The S3 bucket
                Bucket: skillInfoboxImagesBucketName
            };

            // Send to the bucket.
            const fullSizeCommand = new PutObjectCommand(fullSizeData);
            await s3.send(fullSizeCommand);

            const thumbnailFileData = await sharp(fileData)
                .resize({ width: 330 })
                .toBuffer();

            let thumbnailData = {
                // The name it will be saved as on S3
                Key: data.url,
                // The image
                Body: thumbnailFileData,
                ContentEncoding: 'base64',
                ContentType: 'image/jpeg',
                // The S3 bucket
                Bucket: skillInfoboxImageThumbnailsBucketName
            };

            // Send to the bucket.
            const thumbnailCommand = new PutObjectCommand(thumbnailData);
            await s3.send(thumbnailCommand);
        }

        // Insert the new skill.
        let sqlQuery1 = `INSERT INTO skills SET ?;`;
        conn.query(sqlQuery1, data, (err, results) => {
            try {
                if (err) {
                    // Check if skill name exists already.
                    if (err.code == 'ER_DUP_ENTRY') {
                        // check if deleted.
                        let existingNameQuery = `SELECT is_deleted
                    FROM skills
                    WHERE name = ${conn.escape(data.name)};`;

                        conn.query(existingNameQuery, (err, result) => {
                            try {
                                if (err) {
                                    throw err;
                                } else {
                                    if (result[0].is_deleted == 0) {
                                        res.json({
                                            result: 'This skill already exists.'
                                        });
                                    } else if (result[0].is_deleted == 1) {
                                        // Undelete skill.
                                        let unDeleteSkillQuery = `UPDATE skills
                                    SET is_deleted = 0
                                    WHERE name = ${conn.escape(data.name)};`;
                                        conn.query(
                                            unDeleteSkillQuery,
                                            (err) => {
                                                try {
                                                    if (err) {
                                                        throw err;
                                                    }
                                                    res.json({
                                                        result: 'This skill was deleted, but has now been undeleted. Please find it and edit it.'
                                                    });
                                                } catch (err) {
                                                    next(err);
                                                }
                                            }
                                        );
                                    }
                                }
                            } catch (err) {
                                next(err);
                            }
                        });

                        return;
                    }
                    throw err;
                } else {
                    // Get its id.
                    let sqlQuery2 = `SELECT LAST_INSERT_ID();`;
                    conn.query(sqlQuery2, data, async (err, results) => {
                        const skillId = Object.values(results[0])[0];
                        try {
                            if (err) {
                                throw err;
                            } else {
                                // Add vector of skill into skill_vectors table
                                const skillData = {
                                    id: skillId,
                                    name: req.body.name
                                };
                                const vectorData = await getVectorData(
                                    skillData
                                );
                                insertSkillsVectorIntoDataBase(vectorData);
                                console.log('successful vectorize');
                                // Add skill revision history (this is the first revision.)
                                let revisionHistoryQuery = `INSERT INTO skill_history
                            (id, version_number, user_id, name, description,
                            mastery_requirements, level)
                            VALUES
                            (${conn.escape(skillId)},
                            1,
                            ${conn.escape(req.session.userId)},
                            ${conn.escape(
                                    req.body.name
                                )},                           
                            ${conn.escape(
                                    req.body.description
                                )},                                                      
                            ${conn.escape(req.body.mastery_requirements)},
                            ${conn.escape(req.body.level)});`;

                                conn.query(
                                    revisionHistoryQuery,
                                    data,
                                    (err) => {
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
                                                        res.json({
                                                            result: 'skill added'
                                                        });
                                                    }
                                                );
                                            }
                                        } catch (err) {
                                            next(err);
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
    }
);

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
                    mastery_requirements: skill.mastery_requirements,
                    type: skill.type,
                    level: skill.level,
                    is_filtered: skill.is_filtered,
                    order: skill.order,
                    is_copy_of_skill_id: req.body.skillToBeCopied.id,
                    display_name: skill.name,
                    url: skill.url
                };

                // Create the copy with new parent.
                let sqlQuery1 = `INSERT INTO skills SET ?;`;
                conn.query(sqlQuery1, data, (err) => {
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
        'SELECT id, name, parent, type, level, URL, is_filtered FROM skills WHERE skills.is_deleted = 0';
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

    /* Truncate Vertical Tree to grade level based on which button student presses
         on grade level key.
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

    res.setHeader('Content-Type', 'application/json');
    let sqlQuery = `
    SELECT id, name, parent, type, level, skills.order as skillorder, display_name, url
    FROM skills
    WHERE is_filtered = 'available' AND is_deleted = 0
    AND level IN (${levelsToShow})
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
    const sqlQuery = `SELECT 
                        s.*,
                        parent_skill.type AS parent_type
                    FROM 
                        skills AS s
                    LEFT JOIN 
                        skills AS parent_skill ON s.parent = parent_skill.id
                    WHERE s.url = ${conn.escape(
        req.params.skillUrl
    )} AND s.is_deleted = 0`;

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

// For sending the mastery requirements data separately to the skill tree skill panels.
// We send it separately because otherwise, if we send it with the other data, it slows
// down the page load of the skill trees.
router.get('/mastery-requirements-and-url/:id', (req, res, next) => {
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

router.get('/sub-skills/:id', (req, res, next) => {
    // Not checking if user is logged in, as this is available for guest access.
    res.setHeader('Content-Type', 'application/json');
    // Get skill.
    const getSubSkillsSqlQuery = `SELECT name, url
    FROM skills
    WHERE skills.parent = ${conn.escape(req.params.id)}
     AND skills.is_deleted = 0
     AND skills.type = 'sub';`;

    conn.query(getSubSkillsSqlQuery, (err, results) => {
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
            SELECT skills.id, name, skills.url, level
            FROM user_visited_skills
            INNER JOIN skills 
            ON skills.id = user_visited_skills.skill_id
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
    async (req, res, next) => {
        if (req.session.userName) {
            // Add new record to the skills_versions table.
            let versionNumber = req.body.version_number + 1;
            let url = req.body.url;

            const uuidDate = Date.now();
            // Save edit icon to AWS
            const iconUrl = await saveIconToAWS(
                req.body.icon_image,
                url,
                uuidDate
            );

            let addVersionHistoryInsertSQLQuery = `
                    INSERT INTO skill_history
                    (id, version_number, user_id, name, description, icon_image,
                    mastery_requirements, level, skill_history.order, comment)
                    VALUES
                    (${conn.escape(req.params.id)},
                    ${conn.escape(versionNumber)},
                    ${conn.escape(req.session.userId)},
                    ${conn.escape(req.body.name)},                    
                    ${conn.escape(req.body.description)},
                    ${conn.escape(iconUrl)},
                    ${conn.escape(
                req.body.mastery_requirements
            )},                    
                    ${conn.escape(req.body.level)},                    
                    ${conn.escape(req.body.order)},
                    ${conn.escape(req.body.comment)});`;
            conn.query(addVersionHistoryInsertSQLQuery, async (err) => {
                try {
                    if (err) {
                        throw err;
                    }

                    // Update record in skill table.
                    let updateRecordSQLQuery = `UPDATE skills 
                        SET name = ${conn.escape(req.body.name)},
                        url = ${conn.escape(req.body.url)},
                        parent = ${conn.escape(req.body.parent)},
                        description = ${conn.escape(
                        req.body.description
                    )},                         
                        mastery_requirements = ${conn.escape(
                        req.body.mastery_requirements
                    )}, 
                        type = ${conn.escape(req.body.type)}, 
                        level = ${conn.escape(req.body.level)}, 
                        skills.order = ${conn.escape(req.body.order)}, 
                        version_number = ${conn.escape(versionNumber)}, 
                        edited_date = current_timestamp, 
                        is_human_edited = 1
                        WHERE id = ${conn.escape(req.params.id)};`;

                    conn.query(updateRecordSQLQuery, async (err, results) => {
                        try {
                            if (err) {
                                throw err;
                            } else {
                                // Update new Icon to if user changed it

                                // Save edit icon to AWS
                                await saveIconToAWS(req.body.icon_image, url);

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
                    console.error(err);
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
        // Add data.
        let sqlQuery = `INSERT INTO skills_awaiting_approval (skill_id, user_id, mastery_requirements, icon_image, comment)
         VALUES (${conn.escape(req.params.id)}, 
         ${conn.escape(req.body.userId)}, 
         ${conn.escape(req.body.mastery_requirements)}, 
         ${conn.escape(req.body.icon_image)},          
         ${conn.escape(req.body.comment)})
         
         ON DUPLICATE KEY
         UPDATE mastery_requirements = ${conn.escape(
            req.body.mastery_requirements
        )}, 
         date = CURRENT_TIMESTAMP(), 
         icon_image = ${conn.escape(req.body.icon_image)},          
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
                    let url = results[0].url;

                    versionNumber = versionNumber + 1;

                    let addVersionHistoryInsertSQLQuery = `
                    INSERT INTO skill_history
                    (id, version_number, user_id, name, description, icon_image,
                    mastery_requirements, level, skill_history.order, comment)
                    VALUES
                    (${conn.escape(previousId)},
                    ${conn.escape(versionNumber)},
                    ${conn.escape(req.session.userId)},
                    ${conn.escape(previousName)},                    
                    ${conn.escape(previousDescription)},
                    ${conn.escape(req.body.icon_image)},                    
                    ${conn.escape(
                        req.body.mastery_requirements
                    )},                    
                    ${conn.escape(previousLevel)},                    
                    ${conn.escape(previousOrder)},
                    ${conn.escape(req.body.comment)});`;

                    conn.query(addVersionHistoryInsertSQLQuery, async (err) => {
                        try {
                            if (err) {
                                throw err;
                            }

                            /*
                             * Send icon image to S3
                             */
                            if (req.body.icon_image.length > 1) {
                                // Get file from Base64 encoding (client sends as base64)
                                let fileData = Buffer.from(
                                    req.body.icon_image.replace(
                                        /^data:image\/\w+;base64,/,
                                        ''
                                    ),
                                    'base64'
                                );

                                let fullSizeData = {
                                    // The name it will be saved as on S3
                                    Key: url,
                                    // The image
                                    Body: fileData,
                                    ContentEncoding: 'base64',
                                    ContentType: 'image/jpeg',
                                    // The S3 bucket
                                    Bucket: skillInfoboxImagesBucketName
                                };

                                // Send to the bucket.
                                const fullSizeCommand = new PutObjectCommand(
                                    fullSizeData
                                );
                                await s3.send(fullSizeCommand);

                                const thumbnailFileData = await sharp(fileData)
                                    .resize({ width: 330 })
                                    .toBuffer();

                                let thumbnailData = {
                                    // The name it will be saved as on S3
                                    Key: url,
                                    // The image
                                    Body: thumbnailFileData,
                                    ContentEncoding: 'base64',
                                    ContentType: 'image/jpeg',
                                    // The S3 bucket
                                    Bucket: skillInfoboxImageThumbnailsBucketName
                                };

                                // Send to the bucket.
                                const thumbnailCommand = new PutObjectCommand(
                                    thumbnailData
                                );
                                await s3.send(thumbnailCommand);
                            }

                            // Update record in skill table.
                            let updateRecordSQLQuery = `UPDATE skills SET 
                            mastery_requirements = ${conn.escape(
                                req.body.mastery_requirements
                            )},      
                            is_human_edited = 1,                                                  
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
                                                userAction: `${req.body.edit
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
resources.created_at, resources.is_human_edited, users.username,  CONCAT('https://${userAvatarImageThumbnailsBucketName}.s3.${bucketRegion}.amazonaws.com/', users.id, '?v=', UNIX_TIMESTAMP()) AS avatar
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
router.post(
    '/:id/mc-questions/add',
    isAuthenticated,
    isAdmin,
    (req, res, next) => {
        if (req.session.userName) {
            // Trim whitespace off the CSVs (Generative AI adds whitespace to the questions).
            // For each question.
            for (let i = 0; i < req.body.questionArray.length; i++) {
                // Add the questions.
                let data = {};
                data = {
                    name: req.body.questionArray[i].name.trim(),
                    question: req.body.questionArray[i].question.trim(),
                    correct_answer:
                        req.body.questionArray[i].correct_answer.trim(),
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
    }
);

/**
 * Create New Essay Questions
 * From CSV file.
 * @return response()
 */
router.post(
    '/:id/essay-questions/add',
    isAuthenticated,
    isAdmin,
    (req, res, next) => {
        if (req.session.userName) {
            // For each question.
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
    }
);

// For the search feature on the Collapsable Skill Tree.
router.get('/name-list', (req, res, next) => {
    if (req.session) {
        res.setHeader('Content-Type', 'application/json');

        // Check if student is member of a cohort.
        let isInCohortSQLQuery = `
        SELECT cohort_id 
        FROM cohorts_users
        WHERE user_id = ${conn.escape(req.session.userId)};
        `;

        conn.query(isInCohortSQLQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                let sqlQuery = '';

                // For admins, so skills should be removed.
                if (req.session.role == 'admin') {
                    sqlQuery = `SELECT id, name, parent, display_name
                    FROM skills
                    WHERE is_deleted = 0;`;
                    // For instructors and admins, globally filtered skills should be removed.
                } else if (
                    req.session.role == 'editor' ||
                    req.session.role == 'instructor'
                ) {
                    sqlQuery = `SELECT id, name, parent, display_name
                    FROM skills
                    WHERE is_deleted = 0
                    AND is_filtered = 'available';`;

                    // For students, both globally filtered skills and skills that
                    // have been filtered for their cohort, should be removed.
                } else if (req.session.role == 'student') {
                    let cohortId;
                    if (results.length == 0) {
                        cohortId = 0;
                    } else cohortId = results[0].cohort_id;

                    // Check what skills are available for this cohort.
                    sqlQuery = `
                    SELECT skills.id, skills.name, parent, display_name, show_children
                    FROM skills
                    LEFT OUTER JOIN user_skills
                    ON skills.id = user_skills.skill_id
                    WHERE user_skills.user_id = ${conn.escape(
                        req.session.userId
                    )}
                    AND is_filtered = 'available' 
                    AND is_deleted = 0
                    AND skills.id NOT IN 
                    (SELECT skill_id 
                    FROM cohort_skill_filters
                    WHERE cohort_id = ${conn.escape(cohortId)})
                    
                    UNION
                    SELECT skills.id, name, parent, display_name, ""
                    FROM skills
                    WHERE skills.id NOT IN 
                    (SELECT skills.id
                    FROM skills
                    LEFT OUTER JOIN user_skills
                    ON skills.id = user_skills.skill_id
                    WHERE user_skills.user_id = ${conn.escape(
                        req.session.userId
                    )}) 
                    AND is_filtered = 'available' 
                    AND is_deleted = 0
                    AND skills.id NOT IN 
                    (SELECT skill_id 
                    FROM cohort_skill_filters
                    WHERE cohort_id = ${conn.escape(cohortId)});                
                    `;
                }

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
                            }
                        }

                        // Make the array nested, as we need to remove child nodes of filtered skills.
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
                                1;
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

                        // Convert back to single flat array.
                        function flat(array) {
                            var result = [];
                            array.forEach(function (a) {
                                result.push(a);
                                if (Array.isArray(a.children)) {
                                    result = result.concat(flat(a.children));
                                }
                            });
                            return result;
                        }

                        let flatArray = flat(studentSkills);

                        // Only return the name field.
                        var namesArray = flatArray.map(function (a) {
                            return { name: a.name };
                        });

                        res.json(namesArray);
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

// For the search feature on the Collapsable Skill Tree.
router.get('/name-list-old', (req, res, next) => {
    let query = `SELECT id, name, parent, display_name
    FROM skills
    WHERE is_deleted = 0
    AND is_filtered = 'available';`;

    // Show globally filtered skills for admins.
    if (req.session) {
        if (req.session.role == 'admin') {
            query = `SELECT id, name, parent, display_name
            FROM skills
            WHERE is_deleted = 0;`;
        }
    }

    conn.query(query, (err, results) => {
        try {
            if (err) {
                throw err;
            }

            // Need to make the array nested, as need to filter out skills that have been
            // globally filtered, as well as their descendants.

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

            // Convert back to single flat array.
            function flat(array) {
                var result = [];
                array.forEach(function (a) {
                    result.push(a);
                    if (Array.isArray(a.children)) {
                        result = result.concat(flat(a.children));
                    }
                });
                return result;
            }

            let flatArray = flat(filteredNestedSkills);

            // Only return the name field.
            var namesArray = flatArray.map(function (a) {
                return { name: a.name };
            });

            res.json(namesArray);
        } catch (err) {
            next(err);
        }
    });
});

// Advanced / Semantic Search Feature.
// Import OpenAI package.
const { OpenAI } = require('openai');
// To access the .env file.
require('dotenv').config();
// Include API key.
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// router.get('/skills-vectorization', isAuthenticated, async (req, res, next) => {
//     try {
//         const rowData = {
//             rows: []
//         }
//         // get skill name list
//         let sqlQuery = 'SELECT * FROM skills';
//         conn.query(sqlQuery, async (err, results) => {
//             if (err) {
//                 throw err;
//             }
//             const promises = [];
//             console.log(results.length)
//             // We use text-embedding-3-small model to make vector data from skill name
//             for (let index = 0; index < results.length; index++) {
//                 const element = results[index];

//                 promises.push(getVectorData(element, rowData))
//             }
//             res.json(results)

//             Promise.all(promises)
//                 .then(async () => {
//                     console.log(rowData)
//                     const content = JSON.stringify(rowData)
//                     await fs.writeFile('./vector.json', content);
//                     res.json('all done check vector.json : ');
//                 })
//                 .catch((e) => {
//                     throw e
//                 });
//         })
//     } catch (err) {
//         res.status = 500;
//         console.log(err);
//         res.json({ mess: 'fails' })
//     }
// })
const vectorList = require('../../vector.json')

router.get('/insert-vectors-to-db', async (req, res) => {
    try {
        console.log(vectorList.rows.length);
        const promises = [];
        vectorList.rows.forEach((skillVector) => {
            promises.push(insertSkillsVectorIntoDataBase(skillVector));
        });
        Promise.all(promises).then(res.json({ mess: 'seem good' }));
    } catch (error) {
        res.status = 500;
        res.end;
        console.error(error);
    }
});

router.post('/find-with-context', isAuthenticated, async (req, res, next) => {
    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: req.body.input,
            dimensions: 720
        });

        const inputVector = response.data[0].embedding;
        let sqlQuery = `SELECT *
                    FROM skills_vector
                    ORDER BY VEC_DISTANCE(skills_vector.embedding,
                          VEC_FromText('[${inputVector}]'))
                    LIMIT 25`;
        // sql for instructor and editor account
        conn.query(sqlQuery, (err, results) => {
            if (err) {
                throw err;
            }
            res.json(results);
        });

    } catch (error) {
        console.error(error);
        res.status = 500;
        res.end;
    }
});

module.exports = router;
