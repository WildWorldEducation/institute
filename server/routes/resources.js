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
    //password: 'password',
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
 * List Sources
 */
router.get('/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = 'SELECT * FROM resources';
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

        // Check that source is not in the list of blocked domains.
        let sqlQuery1 = `SELECT * FROM blacklisted_sources`;
        let query1 = conn.query(sqlQuery1, data, (err, results) => {
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
                    let query2 = conn.query(sqlQuery2, data, (err, results) => {
                        try {
                            if (err) {
                                throw err;
                            } else {
                                res.json('');
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
        AND id > 2080
        
        ORDER BY id`;
        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                skills = results;
                skillsLength = skills.length;
                // skillsLength = 5;

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
        `. The link should be for an article, worksheets, game, video or other educational resource.
                           Please do not provide YouTube videos.
        Please strongly preference resources from the following urls:` +
        whiteListedDomains +
        `. Please provide only links to free sites, and please do not provide links aimed at parents or teachers.`;

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
            //model: 'gpt-4o',
            model: 'gpt-4-turbo',
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
    let query = conn.query(sqlQuery, data, (err, results, next) => {
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
router.post('/delete-domain', (req, res, next) => {
    if (req.session.userName) {
        let rootDomain = req.body.blockedRootDomain;

        let sqlQuery1 =
            `DELETE FROM resources
        WHERE content LIKE '%` +
            rootDomain +
            `%'`;
        let query1 = conn.query(sqlQuery1, (err, results) => {
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
                    let query2 = conn.query(sqlQuery2, (err, results) => {
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
 *
 */
router.delete('/unblock-domain/:domainId', (req, res, next) => {
    console.log('test');
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery =
            'DELETE FROM blacklisted_sources WHERE id=' + req.params.domainId;
        let query = conn.query(sqlQuery, (err, results) => {
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
        let rootDomain = req.body.whiteListedRootDomain;

        let sqlQuery =
            `INSERT IGNORE INTO whitelisted_sources (root_domain)
        VALUES ('` +
            rootDomain +
            `')`;
        let query = conn.query(sqlQuery, (err, results) => {
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
    console.log('test');
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery =
            'DELETE FROM whitelisted_sources WHERE id=' + req.params.domainId;
        let query = conn.query(sqlQuery, (err, results) => {
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
    let query1 = conn.query(sqlQuery1, (err, results) => {
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
                let sqlQuery2 =
                    `DELETE from resources WHERE id IN (` +
                    duplicateSources +
                    `);`;
                let query2 = conn.query(sqlQuery2, (err, results) => {
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
    let sqlQuery = `SELECT * FROM resources ORDER BY id`;
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

// router.get('*', (req, res) => {
//     res.redirect('/');
// });

module.exports = router;
