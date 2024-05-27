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

/**
 * List Items
 *
 * @return response()
 */
router.get('/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = 'SELECT * FROM tags';
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
 * Create New Item
 *
 * @return response()
 */
router.post('/add', (req, res, next) => {
    if (req.session.userName) {
        // No need to escape single quotes for SQL to accept,
        // as using '?'.
        // Add data.
        let data = {};
        data = { name: req.body.name };
        let sqlQuery = 'INSERT INTO tags SET ?';
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
        let sqlQuery = 'DELETE FROM tags WHERE id=' + req.params.id;
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
 * Select Tags
 */
router.put('/select', (req, res, next) => {
    if (req.session.userName) {
        // Update which skill filters are active.
        for (let i = 0; i < req.body.tags.length; i++) {
            // This variable is used lower down when updating each relevant skill.
            let skillFilteredStatus;
            if (req.body.tags[i].is_active == 'active') {
                skillFilteredStatus = 'filtered';
            } else {
                skillFilteredStatus = 'available';
            }

            let sqlQuery1 =
                `UPDATE tags
                    SET is_active = '` +
                req.body.tags[i].is_active +
                `'
                    WHERE id = ` +
                req.body.tags[i].id +
                `;`;

            let query1 = conn.query(sqlQuery1, (err, results) => {
                try {
                    if (err) {
                        throw err;
                    }
                    // Next we change the 'is_filtered' field in the skills table
                    // for all the relevant skills

                    // 1 Find all the relevant skills.
                    let sqlQuery2 =
                        `SELECT skill_id
                                FROM skill_tags
                                WHERE tag_id = ` +
                        req.body.tags[i].id +
                        `;`;

                    let query2 = conn.query(sqlQuery2, (err, results) => {
                        try {
                            if (err) {
                                throw err;
                            }

                            // Update the relevant skills.
                            let relevantSkills = results;
                            for (let j = 0; j < relevantSkills.length; j++) {
                                let sqlQuery3 =
                                    `UPDATE skills
                                        SET is_filtered = '` +
                                    skillFilteredStatus +
                                    `'
                                        WHERE id = ` +
                                    relevantSkills[j].skill_id +
                                    `;`;

                                let query3 = conn.query(
                                    sqlQuery3,
                                    (err, results) => {
                                        try {
                                            if (err) {
                                                throw err;
                                            }
                                        } catch (err) {
                                            next(err);
                                        }
                                    }
                                );
                            }
                        } catch (err) {
                            next(err);
                        }
                    });
                } catch (err) {
                    next(err);
                }
            });
        }
        res.end();
    }
});

// Export the router for app to use.
module.exports = router;
