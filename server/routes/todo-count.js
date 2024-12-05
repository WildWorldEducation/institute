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
// Middle Ware
const isAuthenticated = require('../middlewares/authMiddleware');
const todoPermission = require('../middlewares/users/todoPermissionMiddleware');
const { isMasterEditor } = require('../utilities/checkUserAccount');
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
router.get('/total', isAuthenticated, todoPermission, (req, res, next) => {

    res.setHeader('Content-Type', 'application/json');
    // Counting each table separately and return as one single oject
    let sqlQuery = `SELECT
                        (SELECT COUNT(*) FROM skills_awaiting_approval) as skill_edit_count, 
                        (SELECT COUNT(*) FROM mc_questions_awaiting_approval) as mc_question_edit_count,
                        (SELECT COUNT(*) FROM essay_questions_awaiting_approval) as essay_question_edit_count,
                        (SELECT COUNT(*) FROM image_questions_awaiting_approval) as image_question_edit_count,
                        (SELECT COUNT(*) FROM student_mc_questions) as student_question_count,
                        (SELECT COUNT(*) FROM content_flags) as content_flag_count`;
    // Get new skill awaiting approval count for admin and a special editor account
    if (req.session.role === 'admin' || isMasterEditor(req.session.userName)) {
        sqlQuery = `${sqlQuery},
                    (SELECT COUNT(*) FROM new_skills_awaiting_approval) as new_skill_add_count`;
    }

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

});

// Export the router for app to use.
module.exports = router;