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
        // console.log('Get learning objectives for: ' + skillName);

        // let content = `You are a curriculum designer creating learning objectives for school or college assessments.`;
        // const completion = await openai.chat.completions.create({
        //     messages: [
        //         { role: 'system', content: content },
        //         {
        //             role: 'user',
        //             content: prompt + ` Please respond with JSON.`
        //         }
        //     ],
        //     model: 'gpt-4o',
        //     response_format: { type: 'json_object' }
        // });
        // let responseJSON = completion.choices[0].message.content;
        // // Escape newline characters in response.
        // if (responseJSON) {
        //     responseJSON = responseJSON.replace(/\\n/g, '\\n');
        // }
        // // Convert string to object.       ;
        // let learningObjectivesObject = JSON.parse(responseJSON);
        // let learningObjectives = learningObjectivesObject.learningObjectives;
        // console.log(learningObjectives);
        let newLearningObjectives = [];

        // for (let i = 0; i < learningObjectives.length; i++) {

        // }

        let testArray = [
            'Understand the concept of component agreement in sentences, recognizing how elements must harmonize in number, gender, and case.',
            [
                'Identify nouns, pronouns, verbs, and adjectives and determine their correct forms in agreement with each other.',
                'Recognize singular and plural subjects and ensure verb agreement in number and person across present, past, and future tenses.',
                [
                    "Decide on the need for singular or plural verbs with compound subjects, analyzing their connections via 'and' or 'or'."
                ],
                "Select pronouns that agree with their antecedents in number and gender, such as 'he', 'she', 'it', and 'they'.",
                'Ensure adjective agreement with the nouns they describe, understanding number and gender concordance, especially in languages with gendered adjectives.',
                'Apply possessive adjectives correctly, ensuring agreement with nouns in terms of number and sometimes gender.'
            ],
            'Focus on subject-verb agreement despite intervening phrases or clauses.',
            'Recognize exceptions to standard agreement rules, such as the use of collective nouns and indefinite pronouns that may alter verb agreement based on context.',
            'Develop skills to construct grammatically correct and coherent sentences, demonstrating mastery in the application of component agreement rules.'
        ];

        // Recursive function
        async function createObjectives(index, array, parent) {
            for (let i = 0; i < array.length; i++) {
                index++;
                if (Array.isArray(array[i])) {
                    await createObjectives(index, array[i], skillId + '-' + i);
                } else {
                    newLearningObjectives.push({
                        id: skillId + '-' + index,
                        skillId: skillId,
                        parent: parent,
                        objective: array[i]
                    });
                }
            }
        }

        let index = 0;
        let parent = 0;
        createObjectives(index, testArray, parent);
        console.log(newLearningObjectives);

        return;

        // for (let i = 0; i < learningObjectives.length; i++) {
        //     console.log(learningObjectives[i]);
        //     if (Array.isArray(learningObjectives[i])) {
        //         console.log('array found');
        //     }
        //     learningObjectives[i] = learningObjectives[i].replace(/"/g, "'");
        // }

        // console.log(learningObjectives);

        index++;

        // function queryPromise(query) {
        //     return new Promise((resolve, reject) => {
        //         conn.query(query, (err, result) => {
        //             if (err) {
        //                 return reject(err);
        //             }

        //             return resolve(result);
        //         });
        //     });
        // }

        // conn.connect(async (err) => {
        //     await Promise.all(
        //         learningObjectives.map((_, i) => {
        //             if (Array.isArray(learningObjectives[i])) {
        //                 console.log('is nested');
        //             }

        //             return queryPromise(
        //                 `INSERT INTO skill_learning_objectives (skill_id, parent, objective)
        //                  VALUES (${skillId}, 0, "${learningObjectives[i]}" )`
        //             );
        //         })
        //     );
        //     if (index < skillsLength)
        //         await generateLearningObjectives(index, skillsLength);
        //     else console.log('batch completed');
        // });
    } catch (err) {
        console.log('Error with ChatGPT API call: ' + err);
        return;
    }
}

getSkills();

// Export the router for app to use.
module.exports = router;
