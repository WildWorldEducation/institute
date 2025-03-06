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
// Available in guest mode.
router.get('/:skillId/list', (req, res, next) => {
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
});

// NOTE: MASTERY OF LEARNING OBJECTIVES MAY BE ABANDONED.
// THESE 2 ROUTES MAY BE DELETED SOON.
/**
 * List Items with mastery details
 */
// router.get('/:skillId/:userId/list', (req, res, next) => {
//     if (req.session.userName) {
//         let skillId = req.params.skillId;
//         let userId = req.params.userId;
//         res.setHeader('Content-Type', 'application/json');
//         let sqlQuery = `
//         SELECT skill_learning_objectives.id, objective, is_mastered
//         FROM skill_learning_objectives
//         LEFT OUTER JOIN user_learning_objectives
//         ON skill_learning_objectives.id = user_learning_objectives.learning_objective_id
//         WHERE skill_id = ${conn.escape(skillId)}
//         AND user_id = ${conn.escape(userId)}

//         UNION

//         SELECT skill_learning_objectives.id, objective, ''
//         FROM skill_learning_objectives
//         WHERE skill_id = ${conn.escape(skillId)}
//         AND skill_learning_objectives.id NOT IN
//         (
//             SELECT skill_learning_objectives.id
//             FROM skill_learning_objectives
//             LEFT OUTER JOIN user_learning_objectives
//             ON skill_learning_objectives.id = user_learning_objectives.learning_objective_id
//             WHERE skill_id = ${conn.escape(skillId)}
//             AND user_id = ${conn.escape(userId)}
//         );
//         `;

//         conn.query(sqlQuery, (err, results) => {
//             try {
//                 if (err) {
//                     throw err;
//                 }
//                 res.json(results);
//             } catch (err) {
//                 next(err);
//             }
//         });
//     }
// });

/**
 * For making learning objective mastered.
 */
// router.post('/:learningObjectiveId/make-mastered/:userId', (req, res, next) => {
//     if (req.session.userName) {
//         let sqlQuery = `
//         INSERT INTO user_learning_objectives (user_id, learning_objective_id, is_mastered)
//         VALUES(${conn.escape(req.params.userId)}, ${conn.escape(
//             req.params.learningObjectiveId
//         )}, 0)
//         ON DUPLICATE KEY UPDATE is_mastered=0;`;

//         conn.query(sqlQuery, (err) => {
//             try {
//                 if (err) {
//                     throw err;
//                 }
//                 res.end();
//             } catch (err) {
//                 next(err);
//             }
//         });
//     } else {
//         res.redirect('/login');
//     }
// });

// Export the router for app to use.
module.exports = router;
