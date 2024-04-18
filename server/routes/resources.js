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
// Import OpenAI package.
const { OpenAI } = require('openai');
// Include API key.
// To access the .env file.
require('dotenv').config();
const openai = new OpenAI({
    apiKey: process.env.CHAT_GPT_API_KEY
});

let userId;
let skills;
let skillsLength;
let numSourcesRequired;
let numSourcesForSkillRemaining;
router.post('/generate-sources', (req, res, next) => {
    if (req.session.userName) {
        // The user posting the source.
        userId = req.session.userId;
        res.setHeader('Content-Type', 'application/json');
        // As we are posting sources for all skills, we get all skills.
        let sqlQuery = `SELECT * FROM skills 
        WHERE type <> 'domain'      
        ORDER BY id`;
        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                skills = results;
                //skillsLength = skills.length;
                skillsLength = 2;

                // User input number of sources per skill required.
                numSourcesRequired = req.body.numSources;
                numSourcesForSkillRemaining = numSourcesRequired;
                // Go through all skills that are not domains.
                // Using a recursive function, rather than a regular for loop,
                // So that it can break if error detected.
                //                function loop(index, timeDelay, skillCount) {
                // Error handling. Break the loop if some problem with ChatGPT (eg no funds).
                // if (breakLoop == true) {
                //     printFailState();
                //     return;
                // }
                //if (index < skillCount) {
                //  index++;
                //   setTimeout(() => {
                // To try to prevent duplication from ChatGPT.
                let index = 0;
                let usedLinks = [];

                // For dev to check if wasting too many ChatGPT tokens.
                let brokenLinkCount = 0;

                getSource(
                    usedLinks,
                    brokenLinkCount,
                    index,
                    numSourcesForSkillRemaining
                );

                // Next skill.
                //  loop(index, timeDelay, skillCount);
                //    }, timeDelay);
                //   }
                //  }

                //loop(0, 500, skills.length);
                //   loop(0, 2000, 2);

                // function printFailState() {
                //     console.log('Operation failed, check console for error.');
                // }
            } catch (err) {
                next(err);
            }
        });
    }
});
// Get source from ChatGPT.
async function getSource(
    usedLinks,
    brokenLinkCount,
    index,
    numSourcesForSkillRemaining
) {
    // Get the skill data.
    // Replace underscore with space.
    let level = skills[index].level.replace(/_/g, ' ');
    let name = skills[index].name;
    // Remove HTML formatting.
    let masteryRequirements = skills[index].mastery_requirements.replace(
        /<[^>]*>?/gm,
        ''
    );
    let prompt =
        `
                   I am a ` +
        level +
        ` student.
                       Please provide me with a JSON object containing a URL link, named "url",
                       with site/page/subject name, named "name", so I can learn more about ` +
        name +
        `, as described by this text: ` +
        masteryRequirements +
        `. The link should be for an article, worksheets, game, video or other educational resource.
                           Please do not provide Youtube videos.`;

    // Attempting to prevent the app from crashing if anythign goes wrong with the API call.
    try {
        console.log('Get source: ' + name);
        console.log(
            'numSourcesForSkillRemaining: ' + numSourcesForSkillRemaining
        );
        const completion = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                {
                    role: 'user',
                    content:
                        prompt +
                        ` Please respond with a JSON object.
                Do not provide any of the following URLs: ` +
                        usedLinks
                }
            ],
            model: 'gpt-4-turbo',
            response_format: { type: 'json_object' }
        });
        let responseJSON = completion.choices[0].message.content;
        // Escape newline characters in response.
        escapedResponseJSON = responseJSON.replace(/\\n/g, '\\n');
        // Convert string to object.
        var responseObj = JSON.parse(escapedResponseJSON);
        // Check if webpages actually exist (because with GPT4 +- half links dont exist.)
        checkSources(
            responseObj,
            usedLinks,
            brokenLinkCount,
            index,
            numSourcesForSkillRemaining
        );
    } catch (err) {
        // Variable to stop the loop through the skills.
        breakLoop = true;
        console.log('Error with ChatGPT API call: ' + err);
        return;
    }
}

// Check if the source link actually exists.
const urlExists = require('url-exists');
async function checkSources(
    responseObj,
    usedLinks,
    brokenLinkCount,
    index,
    numSourcesForSkillRemaining
) {
    //console.log(usedLinks);

    if (usedLinks.includes(responseObj.url)) {
        console.log('Duplicate link: ' + responseObj.url + '.');
        // Get another source.
        getSource(
            usedLinks,
            brokenLinkCount,
            index,
            numSourcesForSkillRemaining
        );
        return;
    }
    // Make this synchronous
    // so as to not waste tokens on duplicates,
    // and more importantly, prevent ChatGPT API from crashing due to being overwhelmed.
    const urlExistsPromise = (url) =>
        new Promise((resolve, reject) =>
            urlExists(url, (err, exists) =>
                err ? reject(err) : resolve(exists)
            )
        );
    urlExistsPromise(responseObj.url).then((exists) => {
        // To try to prevent duplication, thereby saving ChatGPT tokens.
        usedLinks.push(responseObj.url);
        if (exists) {
            // Add to database.
            addSource(
                responseObj,
                usedLinks,
                brokenLinkCount,
                index,
                numSourcesForSkillRemaining
            );
        } else {
            brokenLinkCount++;
            // console.log(
            //     'Broken link: ' +
            //         responseObj.url +
            //         '. Num of broken links from ChatGPT (tokens wasted): ' +
            //         brokenLinkCount
            // );
            // Get another source.
            getSource(
                usedLinks,
                brokenLinkCount,
                index,
                numSourcesForSkillRemaining
            );
        }
    });
}

// Add to DB.
async function addSource(
    responseObj,
    usedLinks,
    brokenLinkCount,
    index,
    numSourcesForSkillRemaining
) {
    // Create source.
    let link =
        '<p><a href="' +
        responseObj.url +
        '" target="_blank">' +
        responseObj.name +
        '</a></p>';

    let skillId = skills[index].id;
    let data = {
        user_id: userId,
        skill_id: skillId,
        content: link
    };

    let sqlQuery = 'INSERT INTO resources SET ?';
    let query = conn.query(sqlQuery, data, (err, results, next) => {
        try {
            if (err) {
                throw err;
            } else {
                console.log('Added skill id: ' + skillId);
                numSourcesForSkillRemaining--;
                if (numSourcesForSkillRemaining > 0) {
                    getSource(
                        usedLinks,
                        brokenLinkCount,
                        index,
                        numSourcesForSkillRemaining
                    );
                } else if (index < skillsLength - 1) {
                    numSourcesForSkillRemaining = numSourcesRequired;
                    index++;
                    getSource(
                        usedLinks,
                        brokenLinkCount,
                        index,
                        numSourcesForSkillRemaining
                    );
                } else {
                    //end
                }
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
