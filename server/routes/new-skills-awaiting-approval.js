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
                res.json(results[0]);
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

                // send notification email to web master
                await sendNewSkillNotificationMail(data);
                res.end();
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

        const insertQuery = `INSERT INTO skills SET ?;`;

        conn.query(insertQuery, (err) => {
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
 * Delete skill submitted for review.
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
        conn.query(updateQuery, (err) => {
            try {
                if (err) {
                    throw err;
                }
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



/**
 * Delete skill submitted for review.
 *
 * @return response()
 */
router.get('/send-mail', async (req, res, next) => {

    await sendNewSkillNotificationMail()
    res.json({ mess: 'ok' })
});

// Export the router for app to use.
module.exports = router;
