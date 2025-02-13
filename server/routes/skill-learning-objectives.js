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
    AND id BETWEEN 0 AND 50`;

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
    Present them in an array (nested or not) called "learningObjectives". Do not make it an array of objects.
    `;

    // Attempting to prevent the app from crashing if anything goes wrong with the API call.
    // ie, error handling.
    try {
        console.log('Get learning objecties for: ' + skillName);

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
        console.log(learningObjectivesObject);
        let learningObjectives = learningObjectivesObject.learning_objectives;
        if (learningObjectives) {
            learningObjectives = learningObjectives.replace(/"/g, "'");
        }

        index++;

        if (index < skillsLength)
            generateLearningObjectives(index, skillsLength);
    } catch (err) {
        console.log('Error with ChatGPT API call: ' + err);
        return;
    }
}

getSkills();

// Export the router for app to use.
module.exports = router;
