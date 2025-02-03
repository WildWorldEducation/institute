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

/*------------------------------------------
--------------------------------------------
Routes
--------------------------------------------
--------------------------------------------*/
/*
 * Create
 */
router.post('/:userId/create', isAuthenticated, async (req, res, next) => {
    try {
        let userId = req.params.userId;
        let name = req.body.name;
        let skills = req.body.skills;

        let createLearningTrackQuery = `INSERT INTO learning_tracks (user_id, name)
        VALUES ('${userId}', '${name}');
        `;

        conn.query(createLearningTrackQuery, (err, result) => {
            if (err) {
                throw err;
            }

            // Function to allow for awaiting each SQL insertion.
            function queryPromise(query) {
                return new Promise((resolve, reject) => {
                    conn.query(query, (err, result) => {
                        if (err) {
                            return reject(err);
                        }

                        return resolve(result);
                    });
                });
            }

            // Insert rows for the learning track skills
            conn.connect(async (err) => {
                await Promise.all(
                    skills.map((_, i) => {
                        return queryPromise(
                            `INSERT INTO learning_track_skills (learning_track_id, skill_id)
                            VALUES (${result.insertId}, ${skills[i]})`
                        );
                    })
                );
                res.end();
            });
        });
    } catch (error) {
        console.error(error);
        res.status = 500;
        res.end;
    }
});

/*
 * List per user
 */
router.get('/:userId/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT * 
        FROM learning_tracks
        WHERE user_id = ${conn.escape(req.params.userId)}`;
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

/*
 * Get one learning track
 */
router.post('/:learningTrackId', (req, res, next) => {
    if (req.session.userName) {
        let userId = req.body.userId;
        let cohortId = req.body.cohortId;

        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT skill_id as id, name, parent, url, level 
        FROM learning_track_skills
        JOIN skills
        ON learning_track_skills.skill_id = skills.id
        WHERE learning_track_id = ${conn.escape(req.params.learningTrackId)}`;
        conn.query(sqlQuery, async (err, recommendedSkills) => {
            try {
                if (err) {
                    throw err;
                }

                /*
                 * Code to convert the group of recommended skills into a learning track in D3
                 *ie a nested array
                 */

                // Will return the branches that will lead to every recommended skill
                let learningTrackBranches = await createLearningTrack(
                    userId,
                    cohortId,
                    recommendedSkills
                );
                async function createLearningTrack(
                    userId,
                    cohortId,
                    recommendedSkills
                ) {
                    // Necessary to await the database query
                    return new Promise((resolve, reject) => {
                        try {
                            let sqlQuery = `
                            SELECT skills.id, name, parent, is_accessible, url, level
                            FROM skills
                            LEFT OUTER JOIN user_skills
                            ON skills.id = user_skills.skill_id
                            WHERE user_skills.user_id = ${conn.escape(userId)}
                            AND is_filtered = 'available'
                            AND is_deleted = 0
                            AND skills.id NOT IN
                            (SELECT skill_id
                            FROM cohort_skill_filters
                            WHERE cohort_id = ${conn.escape(cohortId)})

                            UNION
                            SELECT skills.id, name, parent, "", url, level
                            FROM skills
                            WHERE skills.id NOT IN

                            (SELECT skills.id
                            FROM skills
                            LEFT OUTER JOIN user_skills
                            ON skills.id = user_skills.skill_id
                            WHERE user_skills.user_id = ${conn.escape(userId)})
                            AND is_filtered = 'available'
                            AND is_deleted = 0
                            AND skills.id NOT IN
                            (SELECT skill_id
                            FROM cohort_skill_filters
                            WHERE cohort_id = ${conn.escape(cohortId)})
                            `;

                            conn.query(sqlQuery, async (err, result) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    // All the userSkills
                                    let userSkills = result;

                                    // Array for just this learning track
                                    let learningTrack = [];
                                    for (
                                        let i = 0;
                                        i < recommendedSkills.length;
                                        i++
                                    ) {
                                        let branch = [];
                                        learningTrack.push(branch);
                                        // Add the last skill in the learningTrack
                                        branch.push(recommendedSkills[i]);
                                        await getAncestors(
                                            branch,
                                            userSkills,
                                            recommendedSkills[i]
                                        );
                                    }

                                    // Recursive function
                                    async function getAncestors(
                                        branch,
                                        userSkills,
                                        learningTrackSkill
                                    ) {
                                        let parentSkill;
                                        // Get its parent skill, add it to learning track
                                        for (
                                            let i = 0;
                                            i < userSkills.length;
                                            i++
                                        ) {
                                            if (
                                                learningTrackSkill.parent ==
                                                userSkills[i].id
                                            ) {
                                                parentSkill = userSkills[i];
                                                if (
                                                    parentSkill.is_mastered != 1
                                                ) {
                                                    // add to beginning of array.
                                                    branch.unshift(parentSkill);
                                                    // Check if the parent we add is also in the list of recommended skills,
                                                    // and if so, delete it
                                                    const index =
                                                        recommendedSkills.findIndex(
                                                            (skill) =>
                                                                skill.id ===
                                                                parentSkill.id
                                                        );
                                                    if (index > -1) {
                                                        // We know that at least 1 object that matches has been found at the index i
                                                        recommendedSkills.splice(
                                                            index,
                                                            1
                                                        );
                                                    }
                                                    break;
                                                } else {
                                                    resolve(learningTrack);
                                                }
                                            }
                                        }

                                        if (
                                            typeof parentSkill !== 'undefined'
                                        ) {
                                            /*
                                             * Run the above function again recursively.
                                             */
                                            if (parentSkill != null) {
                                                await getAncestors(
                                                    branch,
                                                    userSkills,
                                                    parentSkill
                                                );
                                            }
                                        }
                                    }

                                    resolve(learningTrack);
                                }
                            });
                        } catch (error) {
                            console.error(error);
                            res.status = 500;
                            res.json(error);
                        }
                    });
                }

                // Combine branches into single array.
                let flatLearningTrackArray = [];
                for (let i = 0; i < learningTrackBranches.length; i++) {
                    for (let j = 0; j < learningTrackBranches[i].length; j++) {
                        if (
                            flatLearningTrackArray.some(
                                (skill) =>
                                    skill.id === learningTrackBranches[i][j].id
                            ) == false
                        ) {
                            flatLearningTrackArray.push(
                                learningTrackBranches[i][j]
                            );
                        }
                    }
                }

                // We need the objects to be nested for D3.
                // Assign children to parent skills.
                for (var i = 0; i < flatLearningTrackArray.length; i++) {
                    flatLearningTrackArray[i].children = [];
                }

                // Assign the correct child skills to the correct parent skills.
                // Return the root skills (first skills in the branches)
                const nestedLearningTrackBranches =
                    flatLearningTrackArray.reduce((acc, curr) => {
                        let parent = curr.parent
                            ? flatLearningTrackArray.filter(
                                  (skill) => skill.id === curr.parent
                              )
                            : [];
                        if (parent.length) {
                            parent[0].children.push(curr);
                        } else {
                            acc.push(curr);
                        }
                        return acc;
                    }, []);

                res.json(nestedLearningTrackBranches);
            } catch (err) {
                next(err);
            }
        });
    }
});

// Export the router for app to use.
module.exports = router;
