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

let skills;
let skillsLength;
function getSkills() {
    let sqlQuery = `SELECT id, level, name, mastery_requirements FROM skills
    WHERE is_deleted = 0
    AND type <> 'domain'
    AND id BETWEEN 50 AND 100`;

    conn.query(sqlQuery, (err, results) => {
        try {
            if (err) {
                throw err;
            }

            skills = results;
            skillsLength = results.length;

            // For going through all skills.
            let index = 0;

            // We go through all skills sequencially, one at a time.
            generateLearningObjectives(index, skillsLength);
        } catch (err) {
            console.log(err);
        }
    });
}

async function generateLearningObjectives(index, skillsLength) {
    let skillId = skills[index].id;
    let skillName = skills[index].name;
    // Remove HTML formatting from mastery requirements.
    let skillMasteryRequirements;
    if (skills[index].mastery_requirements) {
        skillMasteryRequirements = skills[index].mastery_requirements.replace(
            /<[^>]*>?/gm,
            ''
        );
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
        let learningObjectives = learningObjectivesObject.learningObjectives;
        console.log(learningObjectives);
        for (let i = 0; i < learningObjectives.length; i++) {
            learningObjectives[i] = learningObjectives[i].replace(/"/g, "'");
        }

        console.log(learningObjectives);

        index++;

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
                        `INSERT INTO skill_learning_objectives (skill_id, parent, objective)
                         VALUES (${skillId}, 0, "${learningObjectives[i]}" )`
                    );
                })
            );
            if (index < skillsLength)
                await generateLearningObjectives(index, skillsLength);
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
