const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bodyParser = require('body-parser');

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
 * Delete Item
 *
 * @return response()
 */
// Delete multiple choice question.
router.delete('/mc/:id', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = 'DELETE FROM mc_questions WHERE id=' + req.params.id;
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
    } else {
        res.redirect('/login');
    }
});

// Delete essay question.
router.delete('/essay/:id', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = 'DELETE FROM essay_questions WHERE id=' + req.params.id;
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
    } else {
        res.redirect('/login');
    }
});

/**
 * Show Item
 *
 * @return response()
 */
// Show MC question.
router.get('/mc/show/:id', (req, res) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = 'SELECT * FROM mc_questions WHERE id=' + req.params.id;
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

// Show essay question.
router.get('/essay/show/:id', (req, res) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery =
            'SELECT * FROM essay_questions WHERE id=' + req.params.id;
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
 * Update Item
 *
 * @return response()
 */
// MC questions
router.put('/mc/:id/edit', (req, res, next) => {
    if (req.session.userName) {
        let name;
        let question;
        let correctAnswer;
        let incorrectAnswer1;
        let incorrectAnswer2;
        let incorrectAnswer3;
        let incorrectAnswer4;
        let explanation;
        // Escape single quotes for SQL to accept.
        if (req.body.name != null) name = req.body.name.replace(/'/g, "\\'");
        if (req.body.question != null)
            question = req.body.question.replace(/'/g, "\\'");
        if (req.body.correct_answer != null)
            correctAnswer = req.body.correct_answer.replace(/'/g, "\\'");
        if (req.body.incorrect_answer_1 != null)
            incorrectAnswer1 = req.body.incorrect_answer_1.replace(/'/g, "\\'");
        if (req.body.incorrect_answer_2 != null)
            incorrectAnswer2 = req.body.incorrect_answer_2.replace(/'/g, "\\'");
        if (req.body.incorrect_answer_3 != null)
            incorrectAnswer3 = req.body.incorrect_answer_3.replace(/'/g, "\\'");
        if (req.body.incorrect_answer_4 != null)
            incorrectAnswer4 = req.body.incorrect_answer_4.replace(/'/g, "\\'");
        if (req.body.explanation != null)
            explanation = req.body.explanation.replace(/'/g, "\\'");

        // Add data.
        let sqlQuery =
            `UPDATE mc_questions 
        SET name='` +
            name +
            `', question = '` +
            question +
            `', correct_answer = '` +
            correctAnswer +
            `', incorrect_answer_1 = '` +
            incorrectAnswer1 +
            `', incorrect_answer_2 = '` +
            incorrectAnswer2 +
            `', incorrect_answer_3 = '` +
            incorrectAnswer3 +
            `', incorrect_answer_4 = '` +
            incorrectAnswer4 +
            `', explanation = '` +
            explanation +
            `' WHERE id = ` +
            req.params.id;
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
    } else {
        res.redirect('/login');
    }
});

// Essay questions
router.put('/essay/:id/edit', (req, res, next) => {
    if (req.session.userName) {
        let name;
        let question;
        // Escape single quotes for SQL to accept.
        if (req.body.name != null) name = req.body.name.replace(/'/g, "\\'");
        if (req.body.question != null)
            question = req.body.question.replace(/'/g, "\\'");

        // Add data.
        let sqlQuery =
            `UPDATE essay_questions 
        SET name='` +
            name +
            `', question = '` +
            question +
            `' WHERE id = ` +
            req.params.id;
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
    } else {
        res.redirect('/login');
    }
});

// Dynamically create assessments.
// Load multiple choice type questions.
router.get('/:skillId/multiple-choice', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery =
            'SELECT * FROM mc_questions WHERE skill_id = ' + req.params.skillId;
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

// Load essay type questions.
router.get('/:skillId/essay', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery =
            'SELECT * FROM essay_questions WHERE skill_id = ' +
            req.params.skillId;
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

// TODO: find out where this is used, if at all. (We now use this to get flagged essay question)
// Load all essay type questions.
router.get('/essay/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = 'SELECT * FROM essay_questions;';
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

// Load all mc type questions.
router.get('/mc/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = 'SELECT * FROM mc_questions;';
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
 * Create New MC Question Manually (not from CSV.)
 *
 * @return response()
 */
router.post('/mc-questions/add', (req, res, next) => {
    if (req.session.userName) {
        // No need to escape single quotes for SQL to accept,
        // as using '?'.
        // Add data.
        let data = {};
        data = {
            name: req.body.name,
            question: req.body.question,
            correct_answer: req.body.correct_answer,
            incorrect_answer_1: req.body.incorrect_answer_1,
            incorrect_answer_2: req.body.incorrect_answer_2,
            incorrect_answer_3: req.body.incorrect_answer_3,
            incorrect_answer_4: req.body.incorrect_answer_4,
            explanation: req.body.explanation,
            skill_id: req.body.skill_id
        };

        let sqlQuery = 'INSERT INTO mc_questions SET ?';
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
 * Create New Essay Question Manually (not from CSV.)
 *
 * @return response()
 */
router.post('/essay-questions/add', (req, res, next) => {
    if (req.session.userName) {
        // No need to escape single quotes for SQL to accept,
        // as using '?'.
        // Add data.
        let data = {};
        data = {
            name: req.body.name,
            question: req.body.question,
            skill_id: req.body.skill_id
        };

        let sqlQuery = 'INSERT INTO essay_questions SET ?';
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
 * Bulk add MC questions from file.
 *
 * @return response()
 */
router.post('/mc-questions/bulk-add', (req, res, next) => {
    if (req.session.userName) {
        // For each question.
        // No need to escape single quotes for SQL to accept,
        // as using '?'.
        for (let i = 0; i < req.body.questionArray.length; i++) {
            // Add the questions.
            let data = {};
            // Trim whitespace off the CSVs (Generative AI adds whitespace to the questions).
            data = {
                name: req.body.questionArray[i].name.trim(),
                question: req.body.questionArray[i].question.trim(),
                correct_answer: req.body.questionArray[i].correct_answer.trim(),
                incorrect_answer_1:
                    req.body.questionArray[i].incorrect_answer_1.trim(),
                incorrect_answer_2:
                    req.body.questionArray[i].incorrect_answer_2.trim(),
                incorrect_answer_3:
                    req.body.questionArray[i].incorrect_answer_3.trim(),
                incorrect_answer_4:
                    req.body.questionArray[i].incorrect_answer_4.trim(),
                explanation: req.body.questionArray[i].explanation.trim(),
                skill_id: req.body.questionArray[i].skillId
            };
            let sqlQuery = `INSERT INTO mc_questions SET ?`;
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
        }
    } else {
        res.redirect('/login');
    }
});

/**
 * List Student MC Questions
 */
router.get('/student-mc-questions/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = 'SELECT * FROM student_mc_questions;';
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
 * Add Student MC Questions
 */
router.post('/student-mc-questions/add', (req, res, next) => {
    if (req.session.userName) {
        // No need to escape single quotes for SQL to accept,
        // as using '?'.
        // Add data.
        let data = {};
        data = {
            question: req.body.question,
            correct_answer: req.body.correct_answer,
            incorrect_answer_1: req.body.incorrect_answer_1,
            incorrect_answer_2: req.body.incorrect_answer_2,
            incorrect_answer_3: req.body.incorrect_answer_3,
            incorrect_answer_4: req.body.incorrect_answer_4,
            explanation: req.body.explanation,
            skill_id: req.body.skill_id,
            student_id: req.body.student_id
        };

        let sqlQuery = 'INSERT INTO student_mc_questions SET ?';
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
 * Delete Student MC Question
 */
router.delete('/student-mc-questions/:id', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery =
            'DELETE FROM student_mc_questions WHERE id=' + req.params.id;
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
    } else {
        res.redirect('/login');
    }
});

/**
 * Check Questions.
 */
let mcQuestions = [];
let skills = [];

router.get('/check-questions', (req, res, next) => {
    if (req.session.userName) {
        // The user posting the source.
        userId = req.session.userId;
        res.setHeader('Content-Type', 'application/json');
        // Get all MC questions.
        let sqlQuery1 = `SELECT * FROM mc_questions   
        WHERE is_checked = 0        
        ORDER BY id`;
        let query1 = conn.query(sqlQuery1, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                mcQuestions = results;
                // Get all skills.
                let sqlQuery2 = `SELECT * FROM skills`;
                let query2 = conn.query(sqlQuery2, (err, results) => {
                    try {
                        if (err) {
                            throw err;
                        }
                        skills = results;

                        for (let i = 0; i < skills.length; i++) {
                            for (let j = 0; j < mcQuestions.length; j++) {
                                if (skills[i].id == mcQuestions[j].skill_id) {
                                    // Get grade info.
                                    if (skills[i].level == 'grade_school') {
                                        mcQuestions[j].level = 'grade school';
                                    } else if (
                                        skills[i].level == 'middle_school'
                                    ) {
                                        mcQuestions[j].level = 'middle school';
                                    } else if (
                                        skills[i].level == 'high_school'
                                    ) {
                                        mcQuestions[j].level = 'high school';
                                    } else if (skills[i].level == 'college') {
                                        mcQuestions[j].level = 'college';
                                    } else if (skills[i].level == 'phd') {
                                        mcQuestions[j].level = 'phd';
                                    }
                                    continue;
                                }
                            }
                        }
                        //console.log(mcQuestions[0], req.session.userId);
                        let index = 0;
                        // Now we ask ChatGPT to check each one.
                        checkQuestion(index, userId);
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
// Import OpenAI package.
const { OpenAI } = require('openai');
// Include API key.
// To access the .env file.
require('dotenv').config();
const openai = new OpenAI({
    apiKey: process.env.CHAT_GPT_API_KEY
});

async function checkQuestion(index, userId) {
    // Create prompt for ChatGPT.
    let prompt =
        `Please check if the following quiz question: "` +
        mcQuestions[index].question +
        `" Please review if the following answer is the correct
        answer for this question: "` +
        mcQuestions[index].correct_answer +
        `". If it is, please return a variable called 'correct_answer_is_correct' as true, 
        otherwise return it as false. Please also check whether the 
        following four answers are all incorrect answers for this question: "` +
        mcQuestions[index].incorrect_answer_1 +
        `"; "` +
        mcQuestions[index].incorrect_answer_2 +
        `"; "` +
        mcQuestions[index].incorrect_answer_3 +
        '"; "' +
        mcQuestions[index].incorrect_answer_4 +
        `". Return the variable: 'all_incorrect_answers_are_incorrect' as true if so, otherwise, 
        return it as false.
        Please also check for any spelling errors. Please return a variable spelling_correct as true if it is,
        otherwise, return this as false.
        Lastly please check if the the question is appropriate for the following grade: ` +
        mcQuestions[index].level +
        `. Please return the variable 'grade_is_correct' as true if it is, otherwise as false.`;

    // Attempting to prevent the app from crashing if anything goes wrong with the API call.
    // ie, error handling.
    try {
        console.log('Checking question: ');
        const completion = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                {
                    role: 'user',
                    content: prompt + ` Please respond with a JSON object.`
                }
            ],
            model: 'gpt-3.5-turbo',
            response_format: { type: 'json_object' }
        });
        let responseJSON = completion.choices[0].message.content;
        // Escape newline characters in response.
        escapedResponseJSON = responseJSON.replace(/\\n/g, '\\n');
        // Convert string to object.
        var responseObj = JSON.parse(escapedResponseJSON);
        console.log(responseObj);

        // Check ChatGPT response.
        // If it spots a problem, flag the question.
        if (
            responseObj.correct_answer_is_correct == false ||
            responseObj.all_incorrect_answers_are_incorrect == false ||
            responseObj.spelling_correct == false ||
            responseObj.grade_is_correct == false
        ) {
            let data = {};
            data = {
                content_type: 'mc_question',
                content_id: mcQuestions[index].id,
                student_id: userId
            };

            let sqlQuery1 = 'INSERT INTO content_flags SET ?';
            let query1 = conn.query(sqlQuery1, data, (err) => {
                try {
                    if (err) {
                        throw err;
                    }
                    // Mark this question as checked.
                    let sqlQuery2 =
                        `
                    UPDATE mc_questions
                    SET is_checked = 1
                    WHERE id = ` +
                        mcQuestions[index].id +
                        `;`;

                    let query2 = conn.query(sqlQuery2, (err) => {
                        try {
                            if (err) {
                                throw err;
                            }
                            console.log(
                                'MC question ' +
                                mcQuestions[index].id +
                                ' complete'
                            );
                            // Check the next question.
                            index++;
                            if (index < mcQuestions.length)
                                checkQuestion(index, userId);
                        } catch (err) {
                            console.log('error: ' + err);
                        }
                    });
                } catch (err) {
                    console.log('error: ' + err);
                }
            });
        }
        // If ChatGPT does not spot a problem.
        else {
            // Mark this question as checked.
            let sqlQuery2 =
                `
        UPDATE mc_questions
        SET is_checked = 1
        WHERE id = ` +
                mcQuestions[index].id +
                `;`;

            let query2 = conn.query(sqlQuery2, (err) => {
                try {
                    if (err) {
                        throw err;
                    }
                    console.log(
                        'MC question ' + mcQuestions[index].id + ' complete'
                    );
                    // Check the next question.
                    index++;
                    if (index < mcQuestions.length)
                        checkQuestion(index, userId);
                } catch (err) {
                    console.log('error: ' + err);
                }
            });
        }
    } catch (err) {
        console.log('Error with ChatGPT API call: ' + err);
        return;
    }
}

module.exports = router;
