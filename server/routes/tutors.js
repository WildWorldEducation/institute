/*------------------------------------------
--------------------------------------------
Middleware
--------------------------------------------
--------------------------------------------*/
const express = require('express');
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
 * List Tutors by Skill
 */
router.get('/:skillId/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = 'SELECT * FROM tutors';
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
 * Create New Tutor
 *
 * @return response()
 */
router.post('/add/:skillId', (req, res, next) => {
    if (req.session.userName) {
        // No need to escape single quotes for SQL to accept,
        // as using '?'.
        // Add data.
        let data = {
            skill_id: req.params.skillId,
            user_id: req.session.userId,
            description: req.body.description
        };

        // Check that source is not in the list of blocked domains.
        let sqlQuery = `INSERT INTO tutors SET ?;`;
        conn.query(sqlQuery, data, (err) => {
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
 * Delete Tutor Source
 *
 * @return response()
 */
router.delete('/delete/:tutorSourceId', (req, res, next) => {
    if (req.session.userName) {
        // Check if the user has the right to delete the learning resource.
        var tutorUserId;
        let sqlQuery1 =
            'SELECT user_id FROM tutors WHERE id=' + req.params.tutorSourceId;
        let query1 = conn.query(sqlQuery1, (err, results) => {
            try {
                if (err) {
                    throw err;
                } else {
                    postUserId = results[0].user_id;
                    if (
                        postUserId == req.session.userId ||
                        req.session.role == 'admin'
                    ) {
                        // Delete the post.
                        let sqlQuery2 =
                            'DELETE FROM tutors WHERE id=' +
                            req.params.tutorSourceId;
                        let query2 = conn.query(sqlQuery2, (err, results) => {
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
                }
            } catch (err) {
                console.error(err);
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

/**
 * Show 1 Tutor Source
 *
 * @return response()
 */
router.get('/show/:tutorPostId', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery =
            'SELECT * FROM tutors WHERE id=' + req.params.tutorPostId;
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
 * Edit Tutor Post
 *
 * @return response()
 */
router.put('/edit/:id', (req, res, next) => {
    if (req.session.userName) {
        // Escape single quotes for SQL to accept.
        if (req.body.description != null)
            req.body.description = req.body.description.replace(/'/g, "\\'");

        //Extra backend security check that the user is allowed to edit the post.
        let postUserId;
        const sqlQuery1 =
            'SELECT user_id FROM tutors WHERE id=' + req.params.id;
        conn.query(sqlQuery1, (err, results) => {
            try {
                if (err) {
                    throw err;
                } else {
                    postUserId = results[0].user_id;
                    if (
                        postUserId == req.session.userId ||
                        req.session.role == 'admin' ||
                        req.session.role == 'editor'
                    ) {
                        // Edit the post.
                        let sqlQuery2 =
                            "UPDATE tutors SET description='" +
                            req.body.description +
                            "' WHERE id=" +
                            req.params.id;
                        conn.query(sqlQuery2, (err) => {
                            if (err) throw err;

                            res.end();
                        });
                    }
                }
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
