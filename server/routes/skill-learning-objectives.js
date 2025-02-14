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

/*------------------------------------------
--------------------------------------------
Routes
--------------------------------------------
--------------------------------------------*/

// Import OpenAI package.
const { OpenAI } = require('openai');
// To access the .env file.
require('dotenv').config();
// Include API key.
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * List Items
 */
router.get('/:skillId/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT * 
        FROM skill_learning_objectives
        WHERE skill_id = ${conn.escape(req.params.skillId)}`;

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

// Generate Learning Objectives
let skills;
let skillsLength;
function getSkills() {
    let sqlQuery = `SELECT id, level, name, mastery_requirements FROM skills
    WHERE is_deleted = 0
    AND type <> 'domain'
    AND id BETWEEN 40 AND 50`;

    conn.query(sqlQuery, (err, results) => {
        try {
            if (err) {
                throw err;
            }

            skills = results;
            skillsLength = results.length;

            // For going through all skills.
            let outerIndex = 0;

            // We go through all skills sequencially, one at a time.
            generateLearningObjectives(outerIndex, skillsLength);
        } catch (err) {
            console.log(err);
        }
    });
}

async function generateLearningObjectives(outerIndex, skillsLength) {
    let skillId = skills[outerIndex].id;
    let skillName = skills[outerIndex].name;
    // Remove HTML formatting from mastery requirements.
    let skillMasteryRequirements;
    if (skills[outerIndex].mastery_requirements) {
        skillMasteryRequirements = skills[
            outerIndex
        ].mastery_requirements.replace(/<[^>]*>?/gm, '');
    }

    // Create prompt for ChatGPT.
    let prompt = `        
    Generate learning objectives for the skill ${skillName}, as further defined by ${skillMasteryRequirements}.
    Present them in an array (nested where necessary) called "learningObjectives". Do not make it an array of objects.
    `;

    // Attempting to prevent the app from crashing if anything goes wrong with the API call.
    // ie, error handling.
    try {
        console.log('Get learning objectives for: ' + skillName);

        let content = `You are a curriculum designer creating learning objectives for school or college assessments.`;
        const completion = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: content },
                {
                    role: 'user',
                    content: prompt + ` Please respond with JSON.`
                }
            ],
            model: 'gpt-4o',
            response_format: { type: 'json_object' }
        });
        let responseJSON = completion.choices[0].message.content;
        // Escape newline characters in response.
        if (responseJSON) {
            responseJSON = responseJSON.replace(/\\n/g, '\\n');
        }
        // Convert string to object.       ;
        let learningObjectivesObject = JSON.parse(responseJSON);
        let unformattedLearningObjectives =
            learningObjectivesObject.learningObjectives;
        let learningObjectives = [];

        // Recursive function
        async function createObjectives(index, array, parent) {
            for (let i = 0; i < array.length; i++) {
                index++;
                if (Array.isArray(array[i])) {
                    await createObjectives(
                        index,
                        array[i],
                        skillId + '-' + (index - 1) + '-' + (i - 1)
                    );
                    continue;
                }
                learningObjectives.push({
                    id: skillId + '-' + index + '-' + i,
                    skillId: skillId,
                    parent: parent,
                    objective: array[i]
                });
            }
        }

        let index = 0;
        let parent = skillId;
        await createObjectives(index, unformattedLearningObjectives, parent);

        console.log(learningObjectives);

        // Format for SQL
        for (let i = 0; i < learningObjectives.length; i++) {
            learningObjectives[i].objective = learningObjectives[
                i
            ].objective.replace(/"/g, "'");
        }

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

        conn.connect(async (err) => {
            await Promise.all(
                learningObjectives.map((_, i) => {
                    return queryPromise(
                        `INSERT INTO skill_learning_objectives (id, skill_id, parent, objective)
                         VALUES ("${learningObjectives[i].id}", ${learningObjectives[i].skillId}, "${learningObjectives[i].parent}", "${learningObjectives[i].objective}" )`
                    );
                })
            );
            outerIndex++;
            if (outerIndex < skillsLength)
                await generateLearningObjectives(outerIndex, skillsLength);
            else console.log('batch completed');
        });
    } catch (err) {
        console.log('Error with ChatGPT API call: ' + err);
        return;
    }
}

// getSkills();

// Export the router for app to use.
module.exports = router;
