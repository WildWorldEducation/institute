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
    // password: 'password',
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

/* Nested list */
// Individual user and user-skills.
// Used for skill tree component, editing the user skill mastery component, and the skills list component.
router.get('/:id', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
    SELECT skill_tree.skills.id, name AS skill_name, parent, mastered_color, unlocked_color, is_accessible, is_mastered, grade, description, first_ancestor, type
    FROM skill_tree.skills
    LEFT OUTER JOIN skill_tree.user_skills
    ON skill_tree.skills.id = skill_tree.user_skills.skill_id
    WHERE skill_tree.user_skills.user_id = ` + req.params.id + `

    UNION
    SELECT skill_tree.skills.id, name, parent, mastered_color, unlocked_color, "", "", "", description, first_ancestor, type
    FROM skill_tree.skills
    WHERE skill_tree.skills.id NOT IN 

    (SELECT skill_tree.skills.id
    FROM skill_tree.skills
    LEFT OUTER JOIN skill_tree.user_skills
    ON skill_tree.skills.id = skill_tree.user_skills.skill_id
    WHERE skill_tree.user_skills.user_id =` + req.params.id + `)
    ORDER BY id;`

        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                for (var i = 0; i < results.length; i++) {
                    results[i].children = [];
                    if (results[i].parent != null && results[i].parent != 0) {
                        var parentId = results[i].parent;

                        // go through all rows again, add children
                        for (let j = 0; j < results.length; j++) {
                            if (results[j].id == parentId) {
                                results[j].children.push(results[i]);
                            }
                        }
                    }

                    // Change the grade from null to 0, if it has not yet been set.
                    if (results[i].grade == null)
                        results[i].grade = 0;
                }

                let studentSkills = [];
                for (var i = 0; i < results.length; i++) {
                    if (results[i].parent == null || results[i].parent == 0) {
                        studentSkills.push(results[i]);
                    }
                }

                res.json((studentSkills));
            } catch (err) {
                next(err)
            }
        });
    }
})

/* Unnested list */
router.get('/unnested-list/:id', (req, res, next) => {

    // Check if logged in.
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
    SELECT skill_tree.skills.id, name, is_accessible, is_mastered
    FROM skill_tree.skills
    LEFT OUTER JOIN skill_tree.user_skills
    ON skill_tree.skills.id = skill_tree.user_skills.skill_id
    WHERE skill_tree.user_skills.user_id = ` + req.params.id + `

    UNION
    SELECT skill_tree.skills.id, name, "", ""
    FROM skill_tree.skills
    WHERE skill_tree.skills.id NOT IN 

    (SELECT skill_tree.skills.id
    FROM skill_tree.skills
    LEFT OUTER JOIN skill_tree.user_skills
    ON skill_tree.skills.id = skill_tree.user_skills.skill_id
    WHERE skill_tree.user_skills.user_id =` + req.params.id + `)
    ORDER BY id;`

        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                res.json(results);
            } catch (err) {
                next(err)
            }
        });
    }
})


/**
 * Edit item
 *
 * @return response()
 */
router.get('/accessible/:id1/:id2', (req, res, next) => {
    if (req.session.userName) {
        // Make this skill accessible.
        let sqlQuery = `
        INSERT INTO skill_tree.user_skills (user_id, skill_id, is_accessible) 
        VALUES(` + req.params.id1 + `, ` + req.params.id2 + `, 1) 
        ON DUPLICATE KEY UPDATE is_accessible=1;
        `
        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.redirect('back');
            } catch (err) {
                next(err)
            }
        });
    }
    else {
        res.redirect('/login');
    }
});


/**
 * Edit item
 *
 * @return response()
 */
router.get('/inaccessible/:id1/:id2', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = `
        INSERT INTO skill_tree.user_skills (user_id, skill_id, is_accessible) 
        VALUES(` + req.params.id1 + `, ` + req.params.id2 + `, 0) 
        ON DUPLICATE KEY UPDATE is_accessible=0;
        `

        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.redirect('back');
            } catch (err) {
                next(err)
            }
        });
    }
    else {
        res.redirect('/login');
    }
});

/**
 * Edit item
 *
 * @return response()
 */
router.get('/mastered/:id1/:id2', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = `
        INSERT INTO skill_tree.user_skills (user_id, skill_id, is_mastered, is_accessible) 
        VALUES(` + req.params.id1 + `, ` + req.params.id2 + `, 1, 1) 
        ON DUPLICATE KEY UPDATE is_mastered=1, is_accessible=1;
        `

        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.redirect('back');
            } catch (err) {
                next(err)
            }
        });
    }
    else {
        res.redirect('/login');
    }
});

/**
 * Edit item
 *
 * @return response()
 */
router.get('/unmastered/:id1/:id2', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = `
        INSERT INTO skill_tree.user_skills (user_id, skill_id, is_mastered) 
        VALUES(` + req.params.id1 + `, ` + req.params.id2 + `, 0) 
        ON DUPLICATE KEY UPDATE is_mastered=0;    `

        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.redirect('back');

            } catch (err) {
                next(err)
            }
        });
    }
    else {
        res.redirect('/login');
    }
});

/**
 * Edit item
 *
 * @return response()
 */
router.put('/grade/:id1/:id2/:grade', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery =
            `UPDATE skill_tree.user_skills
        SET grade = ` + req.params.grade + `
        WHERE user_id = ` + req.params.id1 + ` AND skill_id = ` + req.params.id2 + `;`;

        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.end();
            } catch (err) {
                next(err)
            }
        });
    }
});

router.get('*', (req, res) => {
    res.redirect('/');
});

module.exports = router 