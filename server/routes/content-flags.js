const express = require('express');

// Router.
const router = express.Router();

// Middleware.
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

// Load all essay type questions.
/**
 * Using divide and conquer tactic we will query each part of content flag list based on flag type
 * TODO: for better readable code and avoid this call back hell change the mysql library to promise base and use async await instead
 */
router.get('/list', async (req, res, next) => {
    if (req.session.userName) {
        let resData = [];
        res.setHeader('Content-Type', 'application/json');
        // Get data for mc_question type Flag (extremely long raw sql query)
        let sqlMCQuery =
            "SELECT cf.*, ut.id as userId, ut.username, ut.avatar, ut.role as userRole,  json_object('question', mc.question, 'name', mc.name, 'incorrectAnswer1', mc.incorrect_answer_1, 'incorrectAnswer2', mc.incorrect_answer_2, 'incorrectAnswer3', mc.incorrect_answer_3, 'incorrectAnswer4', mc.incorrect_answer_4, 'correctAnswer', mc.correct_answer, 'explanation', mc.explanation, 'skillName', sk.name, 'skillId', sk.id) as contentData FROM ( content_flags AS cf JOIN mc_questions AS mc ON cf.content_id = mc.id JOIN skills AS sk ON sk.id = mc.skill_id ) JOIN users as ut ON cf.user_id = ut.id WHERE cf.content_type = 'mc_question' GROUP BY cf.id ";
        conn.query(sqlMCQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                resData = resData.concat(results);
                // Get data for essay_question type flag
                let sqlEssayQuery =
                    "SELECT cf.*, ut.id as userId, ut.username, ut.avatar, ut.role as userRole, json_object('question', es.question, 'name', es.name, 'skillName', sk.name, 'skillId', sk.id) as contentData FROM (content_flags AS cf JOIN essay_questions AS es ON cf.content_id = es.id JOIN skills AS sk ON sk.id = es.skill_id) JOIN users as ut ON ut.id = cf.user_id WHERE cf.content_type = 'essay_question' GROUP BY cf.id ";
                conn.query(sqlEssayQuery, (err, results) => {
                    if (err) {
                        throw err;
                    }
                    resData = resData.concat(results);
                    // Get data for skill type flag
                    let sqlSkillQuery =
                        "SELECT cf.*, ut.id as userId, ut.username, ut.avatar, ut.role as userRole, json_object('name', sk.name, 'description', sk.description, 'masteryRequirements', sk.mastery_requirements, 'level', sk.level) as contentData FROM (content_flags AS cf JOIN skills AS sk ON cf.content_id = sk.id) JOIN users as ut ON ut.id = cf.user_id WHERE cf.content_type = 'skill' GROUP BY cf.id ";
                    conn.query(sqlSkillQuery, (err, results) => {
                        if (err) {
                            throw err;
                        }
                        resData = resData.concat(results);
                        // Get Data for resource type flag
                        let sqlResourceQuery =
                            "SELECT cf.*, ut.id as userId, ut.username, ut.avatar, ut.role as userRole, json_object('content', re.content ,'skill' , sk.name, 'skillId', sk.id, 'user', u.username) as contentData FROM (content_flags AS cf JOIN resources AS re ON cf.content_id = re.id JOIN skills AS sk ON sk.id = re.skill_id JOIN users AS u ON u.id = re.user_id) JOIN users as ut ON cf.user_id = ut.id WHERE cf.content_type = 'resource' GROUP BY cf.id ";
                        conn.query(sqlResourceQuery, (err, results) => {
                            if (err) {
                                throw err;
                            }
                            resData = resData.concat(results);
                            res.json(resData);
                        });
                    });
                });
            } catch (err) {
                next(err);
            }
        });
    }
});

router.post('/add', (req, res, next) => {
    if (req.session.userName) {
        // No need to escape single quotes for SQL to accept,
        // as using '?'.
        // Add data.
        let data = {
            content_type: req.body.content_type,
            content_id: req.body.content_id,
            user_id: req.body.user_id
        };
        let sqlQuery = 'INSERT IGNORE INTO content_flags SET ?';
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
 * Delete Item
 *
 * @return response()
 */
router.delete('/:id', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = 'DELETE FROM content_flags WHERE id=' + req.params.id;
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

// Export the router for app to use.
module.exports = router;
