const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bodyParser = require('body-parser');

// For images I think.
router.use(express.json({ limit: '25mb' }));
router.use(express.urlencoded({ limit: '25mb', extended: true }));
router.use(bodyParser.json());

/*------------------------------------------
--------------------------------------------
Database Connection
--------------------------------------------
--------------------------------------------*/
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'C0ll1ns1n5t1tut32022',
    password: 'password',
    database: 'skill_tree'
});

/*------------------------------------------
--------------------------------------------
Shows Mysql Connect
--------------------------------------------
--------------------------------------------*/
conn.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MariaDB connected...');
});

/**
 * Create New Source
 *
 * @return response()
 */
router.post('/add/:skillId', (req, res, next) => {
    if (req.session.userName) {
        // No need to escape single quotes for SQL to accept,
        // as using '?'.
        // Add data.
        let data = {
            skill_id: req.params.skillId,
            user_id: req.body.userId,
            content: req.body.editordata
        };
        let sqlQuery = 'INSERT INTO resources SET ?';
        let query = conn.query(sqlQuery, data, (err, results) => {
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
 * Delete Source
 *
 * @return response()
 */
router.delete('/delete/:resourceId', (req, res, next) => {
    if (req.session.userName) {
        // Check if the user has the right to delete the learning resource.
        var postUserId;
        let sqlQuery1 =
            'SELECT user_id FROM resources WHERE id=' + req.params.resourceId;
        let query1 = conn.query(sqlQuery1, (err, results) => {
            try {
                if (err) {
                    throw err;
                } else {
                    postUserId = results[0].user_id;
                    if (
                        postUserId == req.session.userId ||
                        req.session.role == 'admin'
                    ) {
                        // Delete the post.
                        let sqlQuery2 =
                            'DELETE FROM resources WHERE id=' +
                            req.params.resourceId;
                        let query2 = conn.query(sqlQuery2, (err, results) => {
                            try {
                                if (err) {
                                    throw err;
                                }
                            } catch (err) {
                                next(err);
                            }
                        });
                    }
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
 * Edit Source
 *
 * @return response()
 */
router.put('/edit/:id', (req, res, next) => {
    if (req.session.userName) {
        // Escape single quotes for SQL to accept.
        if (req.body.editordata != null)
            req.body.editordata = req.body.editordata.replace(/'/g, "\\'");

        //Extra backend security check that the user is allowed to edit the post.
        var postUserId;
        let sqlQuery1 =
            'SELECT user_id FROM resources WHERE id=' + req.params.id;
        let query1 = conn.query(sqlQuery1, (err, results) => {
            try {
                if (err) {
                    throw err;
                } else {
                    postUserId = results[0].user_id;
                    if (postUserId == req.session.userId) {
                        // Edit the post.
                        let sqlQuery2 =
                            "UPDATE resources SET content='" +
                            req.body.editordata +
                            "' WHERE id=" +
                            req.params.id;
                        let query2 = conn.query(sqlQuery2, (err, results) => {
                            if (err) throw err;
                            res.end();
                        });
                    }
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
 * Show Source
 *
 * @return response()
 */
router.get('/show/:id', (req, res) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = 'SELECT * FROM resources WHERE id=' + req.params.id;
        let query = conn.query(sqlQuery, (err, results) => {
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
 * Generate Sources
 *
 * @return response()
 */
// Import OpenAI.
const { OpenAI } = require('openai');
const openai = new OpenAI({
    // TODO: remove from code.
    apiKey: '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'
});
// Used for choosing parent skill when adding a new skill.
router.post('/generate-sources', (req, res, next) => {
    if (req.session.userName) {
        let userId = req.session.userId;
        let skills;
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = 'SELECT * FROM skills';
        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                skills = results;
                // Testing just one skill.
                // TODO, change to loop of all skills.
                // replace underscore with space.
                let numOfSoucesRequired = 3;
                for (let i = 0; i < numOfSoucesRequired; i++) {
                    let skillId = skills[4].id;
                    let level = skills[4].level.replace(/_/g, ' ');
                    let name = skills[4].name;

                    let prompt =
                        `
                    I am a ` +
                        level +
                        ` student.
                        Please provide me with a JSON object containing a URL link, named "url",
                        with site/page/subject name, named "name", so I can learn more about ` +
                        name +
                        `. The link should be for a video, article, worksheets, game, or other educational resource.`;

                    let usedLinks = [];
                    let brokenLinkCount = 0;
                    getSource(
                        userId,
                        skillId,
                        prompt,
                        usedLinks,
                        brokenLinkCount
                    );
                }
            } catch (err) {
                next(err);
            }
        });
    }
});
async function getSource(userId, skillId, prompt, usedLinks, brokenLinkCount) {
    const completion = await openai.chat.completions.create({
        messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            {
                role: 'user',
                content:
                    prompt +
                    ` Please respond with a JSON object.
                Do not provide any of the following links: ` +
                    usedLinks
            }
        ],
        model: 'gpt-4-turbo',
        response_format: { type: 'json_object' }
    });
    let responseJSON = completion.choices[0].message.content;
    //console.log(responseJSON);
    // Escape newline characters in response.
    escapedResponseJSON = responseJSON.replace(/\\n/g, '\\n');
    // Convert string to object.
    var responseObj = JSON.parse(escapedResponseJSON);
    checkSources(
        userId,
        skillId,
        prompt,
        responseObj,
        usedLinks,
        brokenLinkCount
    );
}

const urlExists = require('url-exists');
async function checkSources(
    userId,
    skillId,
    prompt,
    responseObj,
    usedLinks,
    brokenLinkCount
) {
    urlExists(responseObj.url, function (err, exists) {
        //console.log(responseObj);
        //console.log(exists);
        usedLinks.push(responseObj.url);
        if (exists) {
            addSource(userId, skillId, responseObj);
        } else {
            brokenLinkCount++;
            console.log(brokenLinkCount);
            getSource(userId, skillId, prompt, usedLinks, brokenLinkCount);
        }
    });
}

async function addSource(userId, skillId, responseObj) {
    let link =
        '<p><a href="' +
        responseObj.url +
        '" target="_blank">' +
        responseObj.name +
        '</a></p>';

    let data = {
        user_id: userId,
        skill_id: skillId,
        content: link
    };

    let sqlQuery = 'INSERT INTO resources SET ?';
    let query = conn.query(sqlQuery, data, (err, results) => {
        try {
            if (err) {
                throw err;
            } else {
                console.log(link);
            }
        } catch (err) {
            next(err);
        }
    });
}

router.get('*', (req, res) => {
    res.redirect('/');
});

module.exports = router;
