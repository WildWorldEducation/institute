/*------------------------------------------
--------------------------------------------
Middleware
--------------------------------------------
--------------------------------------------*/
const express = require('express');
// Router.
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());
// DB
const conn = require('../config/db');

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

//Middlewares
const isAuthenticated = require('../middlewares/authMiddleware');
const checkRoleHierarchy = require('../middlewares/roleMiddleware');

/*------------------------------------------
--------------------------------------------
Routes
--------------------------------------------
--------------------------------------------*/

/**
 *
 * Get All Items of a Particular Skill
 *
 */
// Used for choosing parent skill when adding a new skill.
router.get('/:skillId/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT * 
        FROM skill_history 
        WHERE id = ${conn.escape(req.params.skillId)}
        ORDER BY edited_date DESC;`;

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
 *
 * Get A Single Skill Revision
 *
 */
router.get('/:skillId/:versionNumber', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT * 
            FROM skill_history 
            WHERE id = ${conn.escape(req.params.skillId)}
            AND version_number = ${conn.escape(req.params.versionNumber)};`;

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
 *
 * Revert current skill to this version.
 *
 */
router.put(
    '/:skillId/revert-to/:versionNumber',
    isAuthenticated,
    checkRoleHierarchy('editor'),
    (req, res, next) => {
        if (req.session.userName) {
            let skillRevision = {};
            let currentSkill = {};
            // Get the skill revision.
            let getSkillRevisionSqlQuery = `SELECT * 
            FROM skill_history 
            WHERE id = ${conn.escape(req.params.skillId)}
            AND version_number = ${conn.escape(req.params.versionNumber)};`;

            conn.query(getSkillRevisionSqlQuery, (err, results) => {
                try {
                    if (err) {
                        throw err;
                    }
                    skillRevision = results[0];

                    // Get the current skill.
                    let getCurrentSkillSqlQuery = `SELECT * 
                    FROM skills 
                    WHERE id = ${conn.escape(req.params.skillId)};`;

                    conn.query(getCurrentSkillSqlQuery, (err, results) => {
                        try {
                            if (err) {
                                throw err;
                            }
                            currentSkill = results[0];

                            // Prep data.
                            let type = currentSkill.type;
                            let parent = currentSkill.parent;
                            let versionNumber = currentSkill.version_number + 1;

                            // Insert the current skill into the skill history.
                            let addNewRevisionSqlQuery = `
                            INSERT INTO skill_history
                            (id, version_number, user_id, name, description, icon_image,
                            mastery_requirements, level, skill_history.order, comment)
                            VALUES
                            (${conn.escape(skillRevision.id)},
                            ${conn.escape(versionNumber)},
                            ${conn.escape(req.session.userId)},
                            ${conn.escape(
                                skillRevision.name
                            )},                    
                            ${conn.escape(skillRevision.description)},
                            ${conn.escape(skillRevision.icon_image.length > 0 ? skillRevision.icon_image : currentSkill.icon_image)},
                            ${conn.escape(
                                skillRevision.mastery_requirements
                            )},                    
                            ${conn.escape(
                                skillRevision.level
                            )},                    
                            ${conn.escape(skillRevision.order)},
                            ${conn.escape(req.body.comment)});`;

                            conn.query(addNewRevisionSqlQuery, (err) => {
                                try {
                                    if (err) {
                                        throw err;
                                    }

                                    // Update record in skill table.
                                    let updateRecordSQLQuery = `UPDATE skills SET name =
                                    ${conn.escape(skillRevision.name)}, 
                                    parent = ${conn.escape(parent)},
                                    description = ${conn.escape(
                                        skillRevision.description
                                    )}, 
                                    icon_image = ${conn.escape(
                                        currentSkill.icon_image
                                    )}, 
                                    banner_image = ${conn.escape(
                                        currentSkill.banner_image
                                    )}, 
                                    mastery_requirements = ${conn.escape(
                                        skillRevision.mastery_requirements
                                    )}, 
                                    type = ${conn.escape(type)}, 
                                    level = ${conn.escape(
                                        skillRevision.level
                                    )}, 
                                    skills.order = ${conn.escape(
                                        skillRevision.order
                                    )}, 
                                    version_number = ${conn.escape(
                                        versionNumber
                                    )},
                                    
                                    edited_date = current_timestamp
                                    WHERE id = ${conn.escape(
                                        req.params.skillId
                                    )};`;

                                    conn.query(updateRecordSQLQuery, async (err) => {
                                        try {
                                            if (err) {
                                                console.error(err)
                                                throw err;
                                            }
                                            /*
                                            * Send icon image to S3
                                            */

                                            if (skillRevision.icon_image.length > 1) {
                                                // Get file from Base64 encoding (client sends as base64)
                                                let fileData = Buffer.from(
                                                    skillRevision.icon_image.replace(
                                                        /^data:image\/\w+;base64,/,
                                                        ''
                                                    ),
                                                    'base64'
                                                );

                                                let url = currentSkill.url;

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
                                            res.end();
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
                } catch (err) {
                    next(err);
                }
            });
        }
    }
);

// Export the router for app to use.
module.exports = router;
