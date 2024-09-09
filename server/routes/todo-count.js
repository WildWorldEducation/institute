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
/**
 * List Items
 *
 * @return response()
 */
router.get('/total', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        // Counting each table separately and return as one single oject
        let sqlQuery = `SELECT
                        (SELECT COUNT(*) FROM skills_awaiting_approval) as skill_edit_count, 
                        (SELECT COUNT(*) FROM mc_questions_awaiting_approval) as mc_question_edit_count,
                        (SELECT COUNT(*) FROM essay_questions_awaiting_approval) as essay_question_edit_count,
                        (SELECT COUNT(*) FROM image_questions_awaiting_approval) as image_question_edit_count,
                        (SELECT COUNT(*) FROM student_mc_questions) as student_question_count,
                        (SELECT COUNT(*) FROM content_flags) as content_flag_count
                        `;
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

// Export the router for app to use.
module.exports = router;