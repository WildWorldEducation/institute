/*------------------------------------------
--------------------------------------------
Middleware
--------------------------------------------
--------------------------------------------*/
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
// For images I think.
router.use(express.json({ limit: '25mb' }));
router.use(express.urlencoded({ limit: '25mb', extended: true }));
router.use(bodyParser.json());
const isAuthenticated = require('../middlewares/authMiddleware');
// DB
const conn = require('../config/db');

/*------------------------------------------
--------------------------------------------
Routes
--------------------------------------------
--------------------------------------------*/

/**
 * List Sources
 */
router.get('/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = 'SELECT * FROM resources WHERE resources.is_deleted = 0';
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
 * Create New Source
 *
 * @return response()
 */
router.post('/add/:skillId', (req, res, next) => {
    if (req.session.userName) {
        // Add data.
        let data = {
            skill_id: req.params.skillId,
            user_id: req.body.userId,
            content: req.body.editordata,
            is_human_edited: 1
        };

        // Check that source is not in the list of blocked domains.
        let sqlQuery1 = `SELECT * FROM blacklisted_sources`;
        conn.query(sqlQuery1, data, (err, results) => {
            try {
                if (err) {
                    throw err;
                } else {
                    // Check if url is in blocked domains.
                    // Get the blocked domain urls.
                    let blockedDomains = [];
                    for (let i = 0; i < results.length; i++) {
                        blockedDomains.push(results[i].root_domain);
                    }
                    for (let i = 0; i < blockedDomains.length; i++) {
                        if (data.content.includes(blockedDomains[i])) {
                            res.json('blocked');
                            return;
                        }
                    }

                    // Add the source.
                    let sqlQuery2 = 'INSERT INTO resources SET ?';
                    conn.query(sqlQuery2, data, (err, result) => {
                        try {
                            if (err) {
                                throw err;
                            } else {
                                // add create resource action to user-actions table
                                const actionData = {
                                    content_type: 'resource',
                                    content_id: result.insertId,
                                    action: 'create',
                                    user_id: data.user_id
                                };
                                const actionQuery =
                                    'INSERT INTO user_actions SET ?';
                                conn.query(actionQuery, actionData, (err) => {
                                    if (err) {
                                        throw err;
                                    } else {
                                        res.json('');
                                    }
                                });
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
        let sqlQuery1 = `SELECT user_id FROM resources WHERE id= ${conn.escape(
            req.params.resourceId
        )};`;

        conn.query(sqlQuery1, (err, results) => {
            try {
                if (err) {
                    throw err;
                } else {
                    postUserId = results[0].user_id;
                    if (
                        postUserId == req.session.userId ||
                        req.session.role == 'admin' ||
                        req.session.role == 'editor'
                    ) {
                        // Delete the post.
                        // new query using visibility flag
                        const deleteResourceQuery = `UPDATE resources 
                        SET is_deleted = 1 
                        WHERE resources.id = ${conn.escape(
                            req.params.resourceId
                        )};`;

                        conn.query(deleteResourceQuery, (err) => {
                            try {
                                if (err) {
                                    throw err;
                                } else {
                                    // add delete action into user_actions table
                                    const actionData = {
                                        action: 'delete',
                                        content_id: req.params.resourceId,
                                        content_type: 'resource',
                                        user_id: req.session.userId
                                    };

                                    const createAction =
                                        'INSERT INTO user_actions SET ?';
                                    conn.query(
                                        createAction,
                                        actionData,
                                        (err) => {
                                            if (err) throw err;
                                            else res.end();
                                        }
                                    );
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
        //Extra backend security check that the user is allowed to edit the post.
        let postUserId;
        const sqlQuery1 = `SELECT user_id FROM resources WHERE id=${conn.escape(
            req.params.id
        )};`;

        conn.query(sqlQuery1, (err, results) => {
            try {
                if (err) {
                    throw err;
                } else {
                    postUserId = results[0].user_id;
                    if (
                        postUserId == req.session.userId ||
                        req.session.role == 'admin' ||
                        req.session.role == 'editor'
                    ) {
                        // Edit the source.
                        let sqlQuery2 = `UPDATE resources 
                            SET content= ${conn.escape(req.body.editordata)},
                            is_human_edited = 1
                            WHERE id= ${conn.escape(req.params.id)};`;

                        conn.query(sqlQuery2, (err) => {
                            if (err) throw err;
                            else {
                                // add update action into user_actions table
                                const actionData = {
                                    content_id: req.params.id,
                                    content_type: 'resource',
                                    action: 'update',
                                    user_id: postUserId
                                };
                                const actionQuery =
                                    'INSERT INTO user_actions SET ?';
                                conn.query(actionQuery, actionData, (err) => {
                                    if (err) {
                                        throw err;
                                    }
                                });
                            }
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
        let sqlQuery = `SELECT * FROM resources 
        WHERE id=${conn.escape(req.params.id)} 
        AND is_deleted = 0`;

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

// Includes deleted sources.
router.get('/user-activity-report/show/:id', (req, res) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT * FROM resources WHERE id=${conn.escape(
            req.params.id
        )};`;

        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                let result = {};
                if (typeof results[0] !== 'undefined' && results[0]) {
                    result.source = results[0];
                } else {
                    result.source = 'not found';
                }
                res.json(result);
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
        AND is_deleted = 0            
        AND id IN (351, 353, 357, 359, 362, 367, 370, 373, 374, 388,
        389, 390, 391, 392, 393, 399, 400, 401,
402,
408,
423,
424,
430,
431,
434,
435,
438,
439,
443,
444,
446,
447,
449,
451,
455,
457,
462,
463,
465,
466,
469,
470,
471,
472,
476,
480,
481,
482,
483,
501,
502,
503,
506,
511,
514,
630,
1001,
1087,
1542,
2339
)
        
        ORDER BY id`;
        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                skills = results;
                skillsLength = skills.length;

                // User input number of sources per skill required.
                numSourcesRequired = req.body.numSources;
                numSourcesForSkillRemaining = numSourcesRequired;
                // For going through all skills.
                let index = 0;
                // To prevent duplication of links.
                let usedLinks = [];
                // For dev to check if wasting too many ChatGPT tokens.
                let brokenLinkCount = 0;
                // Check new urls agains this list.
                let blockedDomains = [];
                let whiteListedDomains = [];

                // As we are posting sources for all skills, we get all skills.
                let sqlQuery2 = `SELECT * FROM blacklisted_sources`;
                let query2 = conn.query(sqlQuery2, (err, results) => {
                    try {
                        if (err) {
                            throw err;
                        }
                        // Get the blocked domain urls.
                        for (let i = 0; i < results.length; i++) {
                            blockedDomains.push(results[i].root_domain);
                        }
                        // As we are posting sources for all skills, we get all skills.
                        let sqlQuery3 = `SELECT * FROM whitelisted_sources`;
                        let query3 = conn.query(sqlQuery3, (err, results) => {
                            try {
                                if (err) {
                                    throw err;
                                }
                                // Get the whitelisted domain urls.
                                for (let i = 0; i < results.length; i++) {
                                    whiteListedDomains.push(
                                        results[i].root_domain
                                    );
                                }
                                // We go through all skills sequencially, one at a time.
                                getSource(
                                    usedLinks,
                                    brokenLinkCount,
                                    index,
                                    numSourcesForSkillRemaining,
                                    blockedDomains,
                                    whiteListedDomains
                                );
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
});

function getSingleSource(skillId) {
    // The user posting the source.
    userId = 24;
    // As we are posting sources for all skills, we get all skills.
    let sqlQuery = `SELECT * FROM skills 
        WHERE type <> 'domain'  
        AND is_deleted = 0            
        AND id = ${skillId}
        
        ORDER BY id`;
    let query = conn.query(sqlQuery, (err, results) => {
        try {
            if (err) {
                throw err;
            }

            skills = results;
            skillsLength = skills.length;

            // User input number of sources per skill required.
            numSourcesRequired = 7;
            numSourcesForSkillRemaining = numSourcesRequired;
            // For going through all skills.
            let index = 0;
            // To prevent duplication of links.
            let usedLinks = [];
            // For dev to check if wasting too many ChatGPT tokens.
            let brokenLinkCount = 0;
            // Check new urls agains this list.
            let blockedDomains = [];
            let whiteListedDomains = [];

            // As we are posting sources for all skills, we get all skills.
            let sqlQuery2 = `SELECT * FROM blacklisted_sources`;
            let query2 = conn.query(sqlQuery2, (err, results) => {
                try {
                    if (err) {
                        throw err;
                    }
                    // Get the blocked domain urls.
                    for (let i = 0; i < results.length; i++) {
                        blockedDomains.push(results[i].root_domain);
                    }
                    // As we are posting sources for all skills, we get all skills.
                    let sqlQuery3 = `SELECT * FROM whitelisted_sources`;
                    let query3 = conn.query(sqlQuery3, (err, results) => {
                        try {
                            if (err) {
                                throw err;
                            }
                            // Get the whitelisted domain urls.
                            for (let i = 0; i < results.length; i++) {
                                whiteListedDomains.push(results[i].root_domain);
                            }
                            // We go through all skills sequencially, one at a time.
                            getSource(
                                usedLinks,
                                brokenLinkCount,
                                index,
                                numSourcesForSkillRemaining,
                                blockedDomains,
                                whiteListedDomains
                            );
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

// let skillId = 344;
//getSingleSource(skillIds[i]);

// Get source from ChatGPT.
async function getSource(
    usedLinks,
    brokenLinkCount,
    index,
    numSourcesForSkillRemaining,
    blockedDomains,
    whiteListedDomains
) {
    // Get the skill data.-----
    // Replace underscore with space.
    let level = skills[index].level.replace(/_/g, ' ');
    let name = skills[index].name;
    // Remove HTML formatting from mastery requirements.
    let masteryRequirements = skills[index].mastery_requirements.replace(
        /<[^>]*>?/gm,
        ''
    );

    // Create prompt for ChatGPT.
    let prompt =
        `
                   I am a ` +
        level +
        ` student.
                       Please provide me with a single JSON object containing a URL link, named "url",
                       with site/page/subject name, named "name", and a description of the webpage, named
                       "description", so I can learn more about ` +
        name +
        `, as described by this text: ` +
        masteryRequirements +
        `. The link should be for an article, game, video or other educational resource.
                           Please do not provide YouTube videos.
        Please strongly preference resources from the following urls:` +
        whiteListedDomains +
        `. Please provide only links to free sites, and please do not provide links aimed at parents or teachers.
        Do not consider links from the following sites: ` +
        blockedDomains +
        `.`;

    // Attempting to prevent the app from crashing if anything goes wrong with the API call.
    // ie, error handling.
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
            model: 'gpt-4o',
            //model: 'gpt-4-turbo',
            response_format: { type: 'json_object' }
        });
        let responseJSON = completion.choices[0].message.content;
        // Escape newline characters in response.
        escapedResponseJSON = responseJSON.replace(/\\n/g, '\\n');
        // Convert string to object.
        var responseObj = JSON.parse(escapedResponseJSON);
        console.log(typeof responseObj);
        console.log(responseObj);
        // Check if webpages actually exist (because with GPT4 +- half links dont exist.)
        checkSources(
            responseObj,
            usedLinks,
            brokenLinkCount,
            index,
            numSourcesForSkillRemaining,
            blockedDomains
        );
    } catch (err) {
        console.log('Error with ChatGPT API call: ' + err);
        return;
    }
}

// Check if the source link actually exists,
// and has not been hallucinated by ChatGPT.
const urlExist = (...args) =>
    import('url-exist').then(({ default: fetch }) => fetch(...args));

async function checkSources(
    responseObj,
    usedLinks,
    brokenLinkCount,
    index,
    numSourcesForSkillRemaining,
    blockedDomains
) {
    // Check if link has already been used.
    if (usedLinks.includes(responseObj.url)) {
        console.log('Duplicate link: ' + responseObj.url + '.');
        // Get another source.
        getSource(
            usedLinks,
            brokenLinkCount,
            index,
            numSourcesForSkillRemaining,
            blockedDomains
        );
        return;
    }

    // Check if in blocked domains list.
    for (let i = 0; i < blockedDomains.length; i++) {
        if (responseObj.url.includes(blockedDomains[i])) {
            console.log('Blacklisted domain: ' + responseObj.url + '.');
            // Get another source.
            getSource(
                usedLinks,
                brokenLinkCount,
                index,
                numSourcesForSkillRemaining,
                blockedDomains
            );
            return;
        }
    }

    // Check if url exists.
    const urlExists = await urlExist(responseObj.url);
    // To try to prevent duplication, thereby saving ChatGPT tokens.
    usedLinks.push(responseObj.url);
    if (urlExists) {
        // Add to database.
        addSource(
            responseObj,
            usedLinks,
            brokenLinkCount,
            index,
            numSourcesForSkillRemaining,
            blockedDomains
        );
    } else {
        brokenLinkCount++;
        console.log('Broken links: ' + brokenLinkCount);
        // Get another source.
        getSource(
            usedLinks,
            brokenLinkCount,
            index,
            numSourcesForSkillRemaining,
            blockedDomains
        );
    }
}

// Add to DB.
async function addSource(
    responseObj,
    usedLinks,
    brokenLinkCount,
    index,
    numSourcesForSkillRemaining,
    blockedDomains
) {
    // Create source.
    let link =
        '<p>' +
        responseObj.description +
        '</p>' +
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

    console.log(responseObj.url);

    let sqlQuery = 'INSERT INTO resources SET ?';
    conn.query(sqlQuery, data, (err, results, next) => {
        try {
            if (err) {
                throw err;
            } else {
                console.log('Added skill id: ' + skillId);
                numSourcesForSkillRemaining--;
                // Get next source for same skill.
                if (numSourcesForSkillRemaining > 0) {
                    getSource(
                        usedLinks,
                        brokenLinkCount,
                        index,
                        numSourcesForSkillRemaining,
                        blockedDomains
                    );
                }
                // Get first source for next skill.
                else if (index < skillsLength - 1) {
                    numSourcesForSkillRemaining = numSourcesRequired;
                    index++;
                    // Clear these for the next skill.
                    usedLinks = [];
                    getSource(
                        usedLinks,
                        brokenLinkCount,
                        index,
                        numSourcesForSkillRemaining,
                        blockedDomains
                    );
                }
                // When all finished.
                else {
                    //end.
                    console.log('All sources created.');
                }
            }
        } catch (err) {
            next(err);
        }
    });
}

// Delete all sources from a particular root domain.
// Note these should be totally deleted, as they dont need to be able to be undeleted.
router.post('/delete-domain', (req, res, next) => {
    if (req.session.userName) {
        let rootDomain = conn.escape(req.body.blockedRootDomain);

        let sqlQuery1 =
            `DELETE FROM resources
        WHERE content LIKE '%` +
            rootDomain +
            `%'`;
        conn.query(sqlQuery1, (err, results) => {
            try {
                if (err) {
                    throw err;
                } else {
                    // Add to blacklisted root domain list.
                    let sqlQuery2 =
                        `INSERT IGNORE INTO blacklisted_sources (root_domain)
        VALUES ('` +
                        rootDomain +
                        `')`;
                    conn.query(sqlQuery2, (err, results) => {
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
 * List Blocked Root Domains
 *
 * @return response()
 */
router.get('/list-blocked-domains', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = 'SELECT * FROM `blacklisted_sources`';
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
 * Unblock Blocked Root Domain
 *
 */
router.delete('/unblock-domain/:domainId', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `DELETE FROM blacklisted_sources 
        WHERE id= ${conn.escape(req.params.domainId)};`;

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
    }
});

// Add root domain to whitelist for sources.
router.post('/add-domain-to-whitelist', (req, res, next) => {
    if (req.session.userName) {
        let rootDomain = conn.escape(req.body.whiteListedRootDomain);
        let sqlQuery =
            `INSERT IGNORE INTO whitelisted_sources (root_domain)
        VALUES ('` +
            rootDomain +
            `')`;

        conn.query(sqlQuery, (err, results) => {
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
 * List Whitelisted Root Domains
 *
 * @return response()
 */
router.get('/list-whitelisted-domains', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = 'SELECT * FROM `whitelisted_sources`';
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
 * Unblock Blocked Root Domain
 */
router.delete('/remove-domain-from-whitelist/:domainId', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `DELETE FROM whitelisted_sources 
        WHERE id= ${conn.escape(req.params.domainId)};`;

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
    }
});

/**
 * Delete Duplicate Sources.
 */
function deleteDuplicateSources() {
    console.log('Searching for and deleting duplicate sources.');
    // Get all sources.
    let sqlQuery1 = `SELECT * FROM resources ORDER BY id`;
    conn.query(sqlQuery1, (err, results) => {
        try {
            if (err) {
                throw err;
            }
            let sources = results;
            let duplicateSources = [];
            for (let i = 0; i < sources.length; i++) {
                // extract the url.
                var source1 = sources[i].content.match(`href="(.*)" target`);
                if (source1 != null) {
                    var source1Url = source1[1];
                    for (let j = 0; j < sources.length; j++) {
                        // extract the url.
                        var source2 =
                            sources[j].content.match(`href="(.*)" target`);
                        if (source2 != null) {
                            var source2Url = source2[1];
                            // Only compare for the same skill.
                            if (sources[i].skill_id == sources[j].skill_id) {
                                // Make sure not the same source.
                                if (sources[i].id != sources[j].id) {
                                    if (source1Url == source2Url) {
                                        duplicateSources.push(sources[j].id);
                                        // Remove sources from the list, so that only one set of duplicates are deleted.
                                        sources.splice(i, 1);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (duplicateSources.length > 0)
                console.log('Duplicate source IDs found: ' + duplicateSources);
            // Delete them.
            if (duplicateSources.length > 0) {
                // Note: these should be totally deleted. Dont need to ever be undeleted.
                let sqlQuery2 =
                    `DELETE from resources WHERE id IN (` +
                    duplicateSources +
                    `);`;
                conn.query(sqlQuery2, (err, results) => {
                    try {
                        if (err) {
                            throw err;
                        }
                        console.log(
                            'Duplicate sources deleted: ' +
                                duplicateSources.length
                        );
                    } catch (err) {
                        console.log(err);
                    }
                });
            } else {
                console.log('No duplicate sources found.');
            }
        } catch (err) {
            console.log(err);
        }
    });
}
router.delete('/delete-duplicate-sources', (req, res, next) => {
    if (req.session.userName) {
        deleteDuplicateSources();
    }
});

/**
 * Search For and Delete Broken Links.
 */

// First get all links in all sources.
var sourceLinks = [];
function getSources() {
    // Get all sources.
    let sqlQuery = `SELECT * FROM resources 
    WHERE is_deleted = 0 
    ORDER BY id`;
    let query = conn.query(sqlQuery, (err, results) => {
        try {
            if (err) {
                throw err;
            }
            let sources = results;
            for (let i = 0; i < sources.length; i++) {
                // extract the url.
                var source = sources[i].content.match(`href="(.*)" target`);
                if (source != null) {
                    sourceLinks.push(source[1]);
                }
            }
            deleteBrokenSources(sourceLinks);
        } catch (err) {
            console.log(err);
        }
    });
}
// Then check them manually.
// Run by devs, not admins.
// Currently makes mistakes, so need to check manually and delete manually.
const { UrlChecker } = require('broken-link-checker');
function deleteBrokenSources(sourceLinks) {
    var i = 0;
    const urlChecker = new UrlChecker(
        {
            acceptedSchemes: ['http', 'https'],
            excludeLinksToSamePage: true
        },
        {
            error: (error) => {
                console.error(error);
            },
            end: () => {
                if (i < sourceLinks.length) {
                    i++;
                    urlChecker.enqueue(sourceLinks[i]);
                }
            },
            link: (result) => {
                if (result.broken) {
                    console.log(result);
                }
            }
        }
    );
    urlChecker.enqueue(sourceLinks[i]);
}

router.delete('/delete-broken-sources', (req, res, next) => {
    console.log('scanning for broken links');
    if (req.session.userName) {
        getSources();
    }
});

/*
 * Downvoted Sources.
 */
// Provide number of downvoted sources, for the Settings page
// For admins, and Daniel (the head editor).
router.get('/downvoted', isAuthenticated, (req, res, next) => {
    // Get all sources.
    let sqlQuery = `SELECT resource_id, SUM(vote) as vote
        FROM resources
        JOIN user_votes
        ON resources.id = user_votes.resource_id
        WHERE is_deleted = 0
        GROUP BY resource_id
        HAVING vote < 0`;

    conn.query(sqlQuery, (err, results) => {
        try {
            if (err) {
                throw err;
            }

            res.json(results.length);
        } catch (err) {
            console.log(err);
        }
    });
});

router.delete('/downvoted', (req, res, next) => {
    let sqlQuery = `SELECT resource_id, SUM(vote) as vote
        FROM resources      
        JOIN user_votes
        ON resources.id = user_votes.resource_id
        WHERE is_deleted = 0
        GROUP BY resource_id
        HAVING vote < 0`;

    conn.query(sqlQuery, (err, results) => {
        try {
            if (err) {
                throw err;
            }

            let sourcesToDelete = results;
            let index = 0;
            let userId = req.session.userId;
            function respond() {
                res.end();
            }
            // Cycle through all these sources.
            if (sourcesToDelete.length > 0)
                deleteDownVotedSources(index, sourcesToDelete, userId, respond);
            else res.end();
        } catch (err) {
            console.log(err);
        }
    });
});

function deleteDownVotedSources(index, sourcesToDelete, userId, respond) {
    // Delete the source.
    const deleteSourceQuery = `UPDATE resources 
    SET is_deleted = 1 
    WHERE resources.id = ${conn.escape(sourcesToDelete[index].resource_id)};`;

    conn.query(deleteSourceQuery, (err) => {
        try {
            if (err) {
                throw err;
            }

            // Add delete action into user_actions table
            const actionData = {
                action: 'bulk-delete',
                content_id: sourcesToDelete[index].resource_id,
                content_type: 'resource',
                user_id: userId
            };

            const createAction = 'INSERT INTO user_actions SET ?';
            conn.query(createAction, actionData, (err) => {
                if (err) throw err;

                index++;
                if (index < sourcesToDelete.length) {
                    // Call the function again, cycling through the sources
                    deleteDownVotedSources(
                        index,
                        sourcesToDelete,
                        userId,
                        respond
                    );
                } else {
                    respond(); // return sourcesToDelete.length + ' sources deleted.';
                }
            });
        } catch (err) {
            console.log(err);
        }
    });
}

module.exports = router;
