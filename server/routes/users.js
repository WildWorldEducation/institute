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
 * Create New Item
 *
 * @return response()
 */
router.post('/add', (req, res, next) => {
    if (req.session.userName) {
        // Escape username, as it is used in the SELECT query.
        if (req.body.username != null)
            req.body.username = req.body.username.replace(/'/g, "\\'");

        // Providing default avatar.
        // Providing it here, as MEDIUMTEXT type in DB not accepting default values.
        if (typeof req.body.avatar == 'undefined' || !req.body.avatar) {
            req.body.avatar = `data:image/png;base64,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`;
        }
        let data = {
            first_name: req.body.firstname,
            last_name: req.body.lastname,
            username: req.body.username,
            email: req.body.email,
            avatar: req.body.avatar,
            role: req.body.role,
            password: req.body.password
        };

        // Check if username or email address already exist.
        let sqlQuery1 =
            "SELECT * FROM users WHERE username = '" + req.body.username + "';";
        let query1 = conn.query(sqlQuery1, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                if (results.length > 0) {
                    res.json({ account: 'username already taken' });
                } else {
                    let sqlQuery2 =
                        "SELECT * FROM users WHERE email = '" +
                        req.body.email +
                        "';";
                    let query2 = conn.query(sqlQuery2, data, (err, results) => {
                        try {
                            if (err) {
                                throw err;
                            } else {
                                if (results.length > 0) {
                                    res.json({
                                        account: 'email already taken'
                                    });
                                } else {
                                    // Remove the backslash from username.
                                    // Using '?', so dont need to escape it.
                                    data.username = data.username.replace(
                                        /\\/g,
                                        ''
                                    );
                                    // If not, add to database.
                                    let sqlQuery3 = 'INSERT INTO users SET ?';
                                    let query3 = conn.query(
                                        sqlQuery3,
                                        data,
                                        (err, results) => {
                                            try {
                                                if (err) {
                                                    throw err;
                                                } else {
                                                    // After creating the user, get their id number and send to the front end.
                                                    // Using teir email, which is unique.
                                                    let sqlQuery4 =
                                                        `
                                                SELECT id
                                                FROM skill_tree.users
                                                WHERE skill_tree.users.email = '` +
                                                        req.body.email +
                                                        `';`;
                                                    let query = conn.query(
                                                        sqlQuery4,
                                                        (err, results) => {
                                                            try {
                                                                if (err) {
                                                                    throw err;
                                                                }
                                                                res.json({
                                                                    account:
                                                                        'account created',
                                                                    id: results[0]
                                                                        .id
                                                                });
                                                            } catch (err) {
                                                                next(err);
                                                            }
                                                        }
                                                    );
                                                }
                                            } catch (err) {
                                                next(err);
                                            }
                                        }
                                    );
                                }
                            }
                        } catch (err) {
                            next(err);
                        }
                    });
                }
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

router.post('/add/instructor', (req, res, next) => {
    if (req.session.userName) {
        let data = {};
        data = {
            instructor_id: req.body.instructor_id,
            student_id: req.body.student_id
        };
        let sqlQuery = 'INSERT INTO instructor_students SET ?';
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

// All users.
router.get('/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = 'SELECT * FROM users';
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

// One specific user.
router.get('/show/:id', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery =
            `
        SELECT *
        FROM skill_tree.users
        WHERE skill_tree.users.id = ` +
            req.params.id +
            `;`;

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
    } else {
        res.redirect('/login');
    }
});

// Get the user id from the username (used in the skill tree routes).
router.get('/showId/:username', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery =
            "SELECT id FROM users WHERE username = '" +
            req.params.username +
            "'";
        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.json(results[0].id);
            } catch (err) {
                next(err);
            }
        });
    }
});

/**
 * Delete Item
 *
 * @return response()
 */
router.delete('/:id', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery1 = 'DELETE FROM users WHERE id=' + req.params.id;

        let query = conn.query(sqlQuery1, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                // After deleting the user, delete all their user-skills (mastery and availability)
                let sqlQuery2 =
                    'DELETE FROM user_skills WHERE user_id=' + req.params.id;
                let query = conn.query(sqlQuery2, (err, results) => {
                    try {
                        if (err) {
                            throw err;
                        }

                        // After deleting the user, delete all their instructor-student records.
                        let sqlQuery3 =
                            'DELETE FROM instructor_students WHERE student_id = ' +
                            req.params.id +
                            ' OR instructor_id = ' +
                            req.params.id +
                            ';';
                        let query = conn.query(sqlQuery3, (err, results) => {
                            try {
                                if (err) {
                                    throw err;
                                }
                                res.end();
                            } catch (err) {
                                next(err);
                            }
                        });
                    } catch (err) {
                        next(err);
                    }
                });
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

/**
 * Update User
 *
 * @return response()
 */

router.put('/:id/edit', (req, res, next) => {
    if (req.session.userName) {
        // Escape single quotes for SQL to accept.
        if (req.body.firstname != null)
            req.body.firstname = req.body.firstname.replace(/'/g, "\\'");
        if (req.body.lastname != null)
            req.body.lastname = req.body.lastname.replace(/'/g, "\\'");
        if (req.body.username != null)
            req.body.username = req.body.username.replace(/'/g, "\\'");
        if (req.body.email != null)
            req.body.email = req.body.email.replace(/'/g, "\\'");
        if (req.body.password != null)
            req.body.password = req.body.password.replace(/'/g, "\\'");

        // Check if avatar field is empty.
        let avatar = '';
        if (req.body.avatar != null) {
            avatar = req.body.avatar;
        }

        let sqlQuery =
            "UPDATE users SET first_name='" +
            req.body.firstname +
            "', last_name = '" +
            req.body.lastname +
            "', username = '" +
            req.body.username +
            "', email = '" +
            req.body.email +
            "', password = '" +
            req.body.password +
            "', avatar = '" +
            avatar +
            "', role = '" +
            req.body.role +
            "' WHERE id=" +
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

router.put('/:id/edit/instructor', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery =
            `
        INSERT INTO skill_tree.instructor_students (instructor_id, student_id) 
        VALUES(` +
            req.body.instructor_id +
            `, ` +
            req.params.id +
            `) 
        ON DUPLICATE KEY UPDATE instructor_id=` +
            req.body.instructor_id +
            `;`;

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

// Edit from profile page
router.put('/profile/:id/edit', (req, res, next) => {
    if (req.session.userName) {
        // Escape single quotes for SQL to accept.
        if (req.body.firstName != null)
            req.body.firstName = req.body.firstName.replace(/'/g, "\\'");
        if (req.body.lastName != null)
            req.body.lastName = req.body.lastName.replace(/'/g, "\\'");
        if (req.body.username != null)
            req.body.username = req.body.username.replace(/'/g, "\\'");
        if (req.body.email != null)
            req.body.email = req.body.email.replace(/'/g, "\\'");
        if (req.body.password != null)
            req.body.password = req.body.password.replace(/'/g, "\\'");

        // Add data.
        let sqlQuery =
            'UPDATE users SET username="' +
            req.body.username +
            '", avatar ="' +
            req.body.avatar +
            '" ,first_name ="' +
            req.body.firstName +
            '", last_name="' +
            req.body.lastName +
            '",email="' +
            req.body.email +
            '", password="' +
            req.body.password +
            '" WHERE id=' +
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

// // Edit user's skill tree theme
// router.put('/:id/skilltree-theme', (req, res, next) => {
//     if (req.session.userName) {
//         let sqlQuery =
//             "UPDATE users SET skilltree_theme='" +
//             req.body.theme +
//             "' WHERE id=" +
//             req.params.id;
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
//     }
// });

// To see the user profile, and edit the app settings (if user is an admin).
router.get('/:id/profile-settings', (req, res) => {
    if (req.session.userName) {
        res.render('profile-and-settings', { userId: req.params.id });
    } else {
        res.redirect('/login');
    }
});

// router.get('*', (req, res) => {
//     res.redirect('/');
// });

module.exports = router;
