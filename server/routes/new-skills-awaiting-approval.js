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

//Middlewares
const isAuthenticated = require('../middlewares/authMiddleware');
const { sendMail, sendNewSkillNotificationMail } = require('../utilities/mailSender');
const { recordUserAction } = require('../utilities/record-user-action');
const { stringToSnakeCase } = require('../utilities/formatter');

// AWS Setup
require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
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
/*------------------------------------------
--------------------------------------------
Routes
--------------------------------------------
--------------------------------------------*/
/**
 * List Items
 *
 * @return response()
 */
router.get('/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT * 
            FROM new_skills_awaiting_approval`;

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
 * Show Item
 *
 * @return response()
 */
router.get('/show/:id', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT * 
            FROM new_skills_awaiting_approval
            WHERE id = ${req.params.id};`;

        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                if (results[0]) {
                    return res.json(results[0]);
                }
                return res.json({ mess: 'no result' })
            } catch (err) {
                next(err);
            }
        });
    }
});

/**
 * Submit New Skill For Review
 *
 */
router.post(
    '/submit-new-skill-for-review',
    isAuthenticated,
    async (req, res, next) => {
        let data = {};
        data = {
            user_id: req.body.user_id,
            name: req.body.name,
            parent: req.body.parent,
            mastery_requirements: req.body.mastery_requirements,
            icon_image: req.body.icon_image,
            type: req.body.type,
            level: req.body.level
        };

        // Insert the new skill.
        let sqlQuery = `INSERT INTO new_skills_awaiting_approval SET ?;`;
        conn.query(sqlQuery, data, async (err, result) => {
            try {
                if (err) {
                    throw err;
                }

                //add create skill action into user_actions table
                recordUserAction(
                    {
                        userId: data.user_id,
                        userAction: 'submit',
                        contentId: result.insertId,
                        contentType: 'new_skill'
                    },
                    (err) => {
                        if (err) {
                            throw err;
                        } else {
                            sqlQuery = `SELECT users.username FROM users WHERE users.id = ${conn.escape(data.user_id)}`
                            conn.query(sqlQuery, async (err, result) => {
                                if (err)
                                    throw err;
                                const userName = result[0].username;
                                const newSkillData = { ...data, userName: userName }
                                // send notification email to web master
                                await sendNewSkillNotificationMail(newSkillData);
                                res.end();
                            })
                        }
                    }
                );
            } catch (err) {
                console.error(err)
                next(err);
            }
        });
    }
);

/**
 * Delete skill submitted for review.
 *
 * @return response()
 */
router.delete('/:id', (req, res, next) => {
    if (req.session.userName) {
        const deleteQuery = `DELETE 
                             FROM new_skills_awaiting_approval
                             WHERE id = ${conn.escape(req.params.id)}`;
        const action = req.query.action

        // Only record delete action if new skill is dismiss because if it is approve then delete we only record approve action

        conn.query(deleteQuery, (err, result) => {
            try {
                if (err) {
                    throw err;
                }
                if (action === 'dismiss') {

                    recordUserAction(
                        {
                            userId: req.session.userId,
                            userAction: 'delete',
                            contentId: result.insertId,
                            contentType: 'new_skill'
                        },
                        (err) => {
                            if (err) {
                                throw err;
                            } else {
                                res.end()
                            }
                        }
                    );
                }
            } catch (err) {
                console.error(err);
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
router.post('/accept/:id', async (req, res, next) => {
    if (req.session.userName) {
        // Add the skill.
        let data = {};
        data = {
            name: req.body.name,
            url: stringToSnakeCase(req.body.name),
            parent: req.body.parent,
            mastery_requirements: req.body.mastery_requirements,
            type: req.body.type,
            level: req.body.level,
            is_human_edited: true,
        };

        try {
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

            const insertQuery = `INSERT INTO skills SET ?;`;

            conn.query(insertQuery, data, (err, result) => {

                if (err) {
                    throw err;

                }
                recordUserAction(
                    {
                        userId: req.session.userId,
                        userAction: 'approve',
                        contentId: result.insertId,
                        contentType: 'new_skill'
                    },
                    (err) => {
                        if (err) {
                            throw err;
                        }
                        res.json({ mess: 'ok' })
                    }
                );

            });
        } catch (error) {
            console.error(error)
            res.status = 500;
            res.end;
        }
    } else {
        res.redirect('/login');
    }
});




/**
 * Edit skill submitted for review.
 *
 * @return response()
 */
router.put('/:id', (req, res, next) => {
    if (req.session.userName) {
        const updateQuery = `
                             UPDATE new_skills_awaiting_approval
                             SET name = ${conn.escape(req.body.name)},
                                 parent = ${conn.escape(req.body.parent)},
                                 mastery_requirements = ${conn.escape(req.body.mastery_requirements)},
                                 icon_image = ${conn.escape(req.body.icon_image)},
                                 type = ${conn.escape(req.body.type)},
                                 level = ${conn.escape(req.body.level)},
                                 user_id = ${conn.escape(req.body.user_id)}
                             WHERE id = ${conn.escape(req.params.id)}`;
        conn.query(updateQuery, (err, result) => {
            try {
                if (err) {
                    throw err;
                }
                recordUserAction(
                    {
                        userId: req.session.userId,
                        userAction: 'update',
                        contentId: req.params.id,
                        contentType: 'new_skill'
                    },
                    (err) => {
                        if (err) {
                            throw err;
                        } else {
                            res.end()
                        }
                    }
                );
                res.end();
            } catch (err) {
                console.error(err)
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});


// Export the router for app to use.
module.exports = router;
