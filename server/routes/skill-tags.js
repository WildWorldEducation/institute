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
        let sqlQuery = 'SELECT * FROM skill_tags';
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
 * Add items
 *
 * @return response()
 */
router.post('/add/:skillId', (req, res, next) => {
    if (req.session.userName) {
        for (let i = 0; i < req.body.filters.length; i++) {
            let sqlQuery1 =
                `
        INSERT INTO skill_tree.skill_tags (skill_id, tag_id)
        VALUES(` +
                req.params.skillId +
                `, ` +
                req.body.filters[i] +
                `);`;

            let query1 = conn.query(sqlQuery1, (err, results) => {
                try {
                    if (err) {
                        throw err;
                    }

                    // Check if the relevant filter has been applied on the app settings.
                    let sqlQuery2 =
                        `
            SELECT is_active
            FROM skill_tree.tags
            WHERE id = ` +
                        req.body.filters[i] +
                        `;`;

                    let query2 = conn.query(sqlQuery2, (err, results) => {
                        try {
                            if (err) {
                                throw err;
                            }

                            if (results[0].is_active == 'active') {
                                // Update the field in the skill table.
                                // Note I am aware this is slightly redundant, but have added the
                                // 'is_filtered' field to the skills table to improve processing speed.
                                let sqlQuery3 =
                                    `
            UPDATE skill_tree.skills 
            SET is_filtered = 'filtered'
            WHERE id = ` +
                                    req.params.skillId +
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

                                res.end();
                            } else {
                                res.end();
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
    } else {
        res.redirect('/login');
    }
});

/**
 * Delete Item
 *
 * @return response()
 */
// router.delete('/remove/:id1/:id2', (req, res, next) => {
//     if (req.session.userName) {
//         let sqlQuery =
//             `
//         DELETE FROM skill_tree.skill_tags
//         WHERE skill_id =` +
//             req.params.id1 +
//             ` AND tag_id =` +
//             req.params.id2 +
//             `;`;

//         let query = conn.query(sqlQuery, (err, results) => {
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

/**
 * Remove All Filters from a Specific Skill.
 *
 * @return response()
 */
router.delete('/remove/:skillId', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery =
            `
        DELETE FROM skill_tree.skill_tags 
        WHERE skill_id =` +
            req.params.skillId +
            `;`;

        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                let sqlQuery2 =
                    `
    UPDATE skill_tree.skills 
    SET is_filtered = 'available'
    WHERE id = ` +
                    req.params.skillId +
                    `;`;

                let query2 = conn.query(sqlQuery2, (err, results) => {
                    try {
                        if (err) {
                            throw err;
                        }
                    } catch (err) {
                        next(err);
                    }
                });

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
