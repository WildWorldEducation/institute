const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bodyParser = require('body-parser');

// For images I think.
router.use(express.json({ limit: '25mb' }));
router.use(express.urlencoded({ limit: '25mb', extended: true }));
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
    password: 'password',
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
 * Create New Item
 *
 * @return response()
 */
router.post('/add/:skillId', (req, res, next) => {
    if (req.session.userName) {
        // Escape single quotes for SQL to accept.
        req.body.editordata = req.body.editordata.replace(/'/g, "''");

        // Add data.
        let data = {
            skill_id: req.params.skillId,
            user_id: req.body.userId,
            content: req.body.editordata
        };
        let sqlQuery = 'INSERT INTO resources SET ?';
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
router.delete('/delete/:resourceId', (req, res, next) => {
    if (req.session.userName) {
        var postUserId;
        let sqlQuery1 =
            'SELECT user_id FROM resources WHERE id=' + req.params.resourceId;
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

                        console.log('---');
                        console.log(sqlQuery2);
                        let query2 = conn.query(sqlQuery2, (err, results) => {
                            try {
                                if (err) {
                                    throw err;
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
 * Edit Item
 *
 * @return response()
 */
router.put('/edit/:id', (req, res, next) => {
    if (req.session.userName) {
        // Escape single quotes for SQL to accept.
        req.body.editordata = req.body.editordata.replace(/'/g, "''");

        //Extra backend security check that the user is allowed to edit the post.
        var postUserId;
        let sqlQuery1 =
            'SELECT user_id FROM resources WHERE id=' + req.params.id;
        let query1 = conn.query(sqlQuery1, (err, results) => {
            try {
                if (err) {
                    throw err;
                } else {
                    postUserId = results[0].user_id;
                    if (postUserId == req.session.userId) {
                        // Edit the post.
                        let sqlQuery2 =
                            "UPDATE resources SET content='" +
                            req.body.editordata +
                            "' WHERE id=" +
                            req.params.id;
                        let query2 = conn.query(sqlQuery2, (err, results) => {
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

/**
 * Show Item
 *
 * @return response()
 */
router.get('/show/:id', (req, res) => {
    // var session = req.session;
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = 'SELECT * FROM resources WHERE id=' + req.params.id;
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

router.get('*', (req, res) => {
    res.redirect('/');
});

module.exports = router;
