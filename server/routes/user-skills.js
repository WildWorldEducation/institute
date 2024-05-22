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

/* Nested list */
// Individual user and user-skills.
// Used for skill tree component, editing the user skill mastery component, and the skills list component.
router.get('/:id', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery =
            `
    SELECT skill_tree.skills.id, name AS skill_name, parent, is_accessible, is_mastered, description, type, level, mastery_requirements
    FROM skill_tree.skills
    LEFT OUTER JOIN skill_tree.user_skills
    ON skill_tree.skills.id = skill_tree.user_skills.skill_id
    WHERE skill_tree.user_skills.user_id = ` +
            req.params.id +
            ` AND is_filtered = 'available'

    UNION
    SELECT skill_tree.skills.id, name, parent, "", "", description, type, level, mastery_requirements
    FROM skill_tree.skills
    WHERE skill_tree.skills.id NOT IN 

    (SELECT skill_tree.skills.id
    FROM skill_tree.skills
    LEFT OUTER JOIN skill_tree.user_skills
    ON skill_tree.skills.id = skill_tree.user_skills.skill_id
    WHERE skill_tree.user_skills.user_id =` +
            req.params.id +
            `) AND is_filtered = 'available'
    ORDER BY id;`;

        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                for (var i = 0; i < results.length; i++) {
                    results[i].children = [];
                }

                for (var i = 0; i < results.length; i++) {
                    if (results[i].parent != null && results[i].parent != 0) {
                        var parentId = results[i].parent;

                        // go through all rows again, add children
                        for (let j = 0; j < results.length; j++) {
                            if (results[j].id == parentId) {
                                // bug
                                results[j].children.push(results[i]);
                            }
                        }
                    }
                }

                let studentSkills = [];
                for (var i = 0; i < results.length; i++) {
                    if (results[i].parent == null || results[i].parent == 0) {
                        studentSkills.push(results[i]);
                    }
                }

                res.json(studentSkills);
            } catch (err) {
                next(err);
            }
        });
    }
});

/* Nested list */
// Individual user and user-skills.
// Used for skill tree component, editing the user skill mastery component, and the skills list component.
router.get('/separate-subskills/:id', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery =
            `
    SELECT skill_tree.skills.id, name AS skill_name, parent, is_accessible, is_mastered, description, type, level, mastery_requirements
    FROM skill_tree.skills
    LEFT OUTER JOIN skill_tree.user_skills
    ON skill_tree.skills.id = skill_tree.user_skills.skill_id
    WHERE skill_tree.user_skills.user_id = ` +
            req.params.id +
            ` AND is_filtered = 'available'

    UNION
    SELECT skill_tree.skills.id, name, parent, "", "", description, type, level, mastery_requirements
    FROM skill_tree.skills
    WHERE skill_tree.skills.id NOT IN 

    (SELECT skill_tree.skills.id
    FROM skill_tree.skills
    LEFT OUTER JOIN skill_tree.user_skills
    ON skill_tree.skills.id = skill_tree.user_skills.skill_id
    WHERE skill_tree.user_skills.user_id =` +
            req.params.id +
            `) AND is_filtered = 'available'
    ORDER BY id;`;

        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                for (var i = 0; i < results.length; i++) {
                    results[i].children = [];
                    results[i].subskills = [];
                }

                for (var i = 0; i < results.length; i++) {
                    if (results[i].parent != null && results[i].parent != 0) {
                        var parentId = results[i].parent;

                        // go through all rows again, add children
                        for (let j = 0; j < results.length; j++) {
                            if (results[j].id == parentId) {
                                if (results[i].type == 'sub') {
                                    results[j].subskills.push(results[i]);
                                } else {
                                    results[j].children.push(results[i]);
                                }
                            }
                        }
                    }
                }

                let studentSkills = [];
                for (var i = 0; i < results.length; i++) {
                    if (results[i].parent == null || results[i].parent == 0) {
                        studentSkills.push(results[i]);
                    }
                }

                res.json(studentSkills);
            } catch (err) {
                next(err);
            }
        });
    }
});

/* Nested list - without subskills */
// Individual user and user-skills.
// Used for skill tree component, editing the user skill mastery component, and the skills list component.
router.get('/no-sub-skills/:id', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery =
            `
    SELECT skill_tree.skills.id, name AS skill_name, parent, is_accessible, is_mastered, description, type, mastery_requirements
    FROM skill_tree.skills
    LEFT OUTER JOIN skill_tree.user_skills
    ON skill_tree.skills.id = skill_tree.user_skills.skill_id
    WHERE skill_tree.user_skills.user_id = ` +
            req.params.id +
            ` AND skill_tree.skills.type <> 'sub'          

    UNION
    SELECT skill_tree.skills.id, name, parent, "", "", description, type, mastery_requirements
    FROM skill_tree.skills
    WHERE skill_tree.skills.id NOT IN 

    (SELECT skill_tree.skills.id
    FROM skill_tree.skills
    LEFT OUTER JOIN skill_tree.user_skills
    ON skill_tree.skills.id = skill_tree.user_skills.skill_id
    WHERE skill_tree.user_skills.user_id =` +
            req.params.id +
            `)  AND skill_tree.skills.type <> 'sub'            
    ORDER BY id;`;

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
                }

                let studentSkills = [];
                for (var i = 0; i < results.length; i++) {
                    if (results[i].parent == null || results[i].parent == 0) {
                        studentSkills.push(results[i]);
                    }
                }

                res.json(studentSkills);
            } catch (err) {
                next(err);
            }
        });
    }
});

/* Unnested list */
router.get('/unnested-list/:id', (req, res, next) => {
    // Check if logged in.
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery =
            `
    SELECT skill_tree.skills.id, name, is_accessible, is_mastered, type
    FROM skill_tree.skills
    LEFT OUTER JOIN skill_tree.user_skills
    ON skill_tree.skills.id = skill_tree.user_skills.skill_id
    WHERE skill_tree.user_skills.user_id = ` +
            req.params.id +
            `

    UNION
    SELECT skill_tree.skills.id, name, "", "", type
    FROM skill_tree.skills
    WHERE skill_tree.skills.id NOT IN 

    (SELECT skill_tree.skills.id
    FROM skill_tree.skills
    LEFT OUTER JOIN skill_tree.user_skills
    ON skill_tree.skills.id = skill_tree.user_skills.skill_id
    WHERE skill_tree.user_skills.user_id =` +
            req.params.id +
            `)
    ORDER BY id;`;

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
 * Edit item
 *
 * @return response()
 */
router.get('/accessible/:id1/:id2', (req, res, next) => {
    if (req.session.userName) {
        // Make this skill accessible.
        let sqlQuery =
            `
        INSERT INTO skill_tree.user_skills (user_id, skill_id, is_accessible) 
        VALUES(` +
            req.params.id1 +
            `, ` +
            req.params.id2 +
            `, 1) 
        ON DUPLICATE KEY UPDATE is_accessible=1;
        `;
        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.redirect('back');
            } catch (err) {
                next(err);
            }
        });
    } else {
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
        let sqlQuery =
            `
        INSERT INTO skill_tree.user_skills (user_id, skill_id, is_accessible) 
        VALUES(` +
            req.params.id1 +
            `, ` +
            req.params.id2 +
            `, 0) 
        ON DUPLICATE KEY UPDATE is_accessible=0;
        `;

        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.redirect('back');
            } catch (err) {
                next(err);
            }
        });
    } else {
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
        let sqlQuery =
            `
        INSERT INTO skill_tree.user_skills (user_id, skill_id, is_mastered) 
        VALUES(` +
            req.params.id1 +
            `, ` +
            req.params.id2 +
            `, 0) 
        ON DUPLICATE KEY UPDATE is_mastered=0;    `;

        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.redirect('back');
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

// /**
//  * Edit item
//  *
//  * @return response()
//  */
// router.put('/grade/:id1/:id2/:grade', (req, res, next) => {
//     if (req.session.userName) {
//         let sqlQuery =
//             `UPDATE skill_tree.user_skills
//         SET grade = ` + req.params.grade + `
//         WHERE user_id = ` + req.params.id1 + ` AND skill_id = ` + req.params.id2 + `;`;

//         let query = conn.query(sqlQuery, (err, results) => {
//             try {
//                 if (err) {
//                     throw err;
//                 }
//                 res.end();
//             } catch (err) {
//                 next(err)
//             }
//         });
//     }
// });

/**
 * For making a skill mastered (not a domain), or a domain unlocked,
 * which includes the effects on all child skills.
 * If children are domains (pass-through skills), the function is applied to them recursively also.
 * If children are regular skills, they become unlocked.
 * If children are super skills (inner cluster nodes), their sub skills become unlocked.
 * If the skill this is applied to is a sub skill, and all its sibling skills are also mastered,
 * its parent (super skill) becomes mastered.
 *
 * @return response()
 */
router.post('/make-mastered/:userId', (req, res, next) => {
    if (req.session.userName) {
        // Store the skill data.
        let skill = req.body.skill;

        // Get a list of all skills.
        let sqlQuery1 = 'SELECT * FROM skills;';
        let query1 = conn.query(sqlQuery1, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                let skills = results;

                let sqlQuery2 =
                    `
                SELECT skill_tree.skills.id, name, is_accessible, is_mastered, type
                FROM skill_tree.skills
                LEFT OUTER JOIN skill_tree.user_skills
                ON skill_tree.skills.id = skill_tree.user_skills.skill_id
                WHERE skill_tree.user_skills.user_id = ` +
                    req.params.userId +
                    `
            
                UNION
                SELECT skill_tree.skills.id, name, "", "", type
                FROM skill_tree.skills
                WHERE skill_tree.skills.id NOT IN 
            
                (SELECT skill_tree.skills.id
                FROM skill_tree.skills
                LEFT OUTER JOIN skill_tree.user_skills
                ON skill_tree.skills.id = skill_tree.user_skills.skill_id
                WHERE skill_tree.user_skills.user_id =` +
                    req.params.userId +
                    `)
                ORDER BY id;`;

                let query2 = conn.query(sqlQuery2, (err, results) => {
                    try {
                        if (err) {
                            throw err;
                        }
                        let unnestedList = results;

                        // Recursive function.
                        makeMastered(req.params.userId, skill);

                        function makeMastered(userId, skill) {
                            let value;
                            if (skill.type == 'domain') {
                                value = 0;
                            } else {
                                value = 1;
                            }

                            let sqlQuery =
                                `
                            INSERT INTO skill_tree.user_skills (user_id, skill_id, is_mastered, is_accessible) 
                            VALUES(` +
                                req.params.userId +
                                `, ` +
                                skill.id +
                                `, ` +
                                value +
                                `, 1) 
                            ON DUPLICATE KEY UPDATE is_mastered=` +
                                value +
                                `, is_accessible=1;
                            `;
                            //
                            let query = conn.query(sqlQuery, (err, results) => {
                                try {
                                    if (err) {
                                        throw err;
                                    }
                                    // Check if is a sub skill.
                                    if (skill.type != 'sub') {
                                        // Get all the child skills.
                                        const childSkills = [];
                                        for (
                                            let i = 0;
                                            i < skills.length;
                                            i++
                                        ) {
                                            if (skills[i].parent == skill.id) {
                                                childSkills.push(skills[i]);
                                            }
                                        }

                                        let subSkills = [];
                                        // Make them accessible/unlocked if regular type skills.
                                        for (
                                            let i = 0;
                                            i < childSkills.length;
                                            i++
                                        ) {
                                            if (
                                                childSkills[i].type == 'regular'
                                            ) {
                                                makeAccessible(
                                                    userId,
                                                    childSkills[i].id
                                                );
                                            } else if (
                                                childSkills[i].type == 'domain'
                                            ) {
                                                makeMastered(
                                                    userId,
                                                    childSkills[i]
                                                );
                                            }
                                            // If super type skills, make their subskills accessible.
                                            else if (
                                                childSkills[i].type == 'super'
                                            ) {
                                                for (
                                                    let j = 0;
                                                    j < skills.length;
                                                    j++
                                                ) {
                                                    if (
                                                        skills[j].parent ==
                                                            childSkills[i].id &&
                                                        skills[j].type == 'sub'
                                                    ) {
                                                        subSkills.push(
                                                            skills[j].id
                                                        );
                                                    }
                                                }
                                            }
                                        }
                                        for (
                                            let i = 0;
                                            i < subSkills.length;
                                            i++
                                        ) {
                                            makeAccessible(
                                                userId,
                                                subSkills[i]
                                            );
                                        }
                                        // TODO: FIX BELOW. NOT WORKING
                                        // // Check if domain is now mastered.
                                        // FindFirstAncestorDomain(
                                        //     skill,
                                        //     req.params.userId
                                        // );
                                    }
                                    // If this skill is a sub skill.
                                    else {
                                        // Get its sibling skills.
                                        let siblingSkills = [];
                                        for (
                                            let i = 0;
                                            i < skills.length;
                                            i++
                                        ) {
                                            if (
                                                skills[i].parent ==
                                                    skill.parent &&
                                                skills[i].id != skill.id
                                            ) {
                                                if (skills[i].type == 'sub') {
                                                    siblingSkills.push(
                                                        skills[i]
                                                    );
                                                }
                                            }
                                        }

                                        //Check if all the siblings are mastered.
                                        let allMastered = true;
                                        for (
                                            let i = 0;
                                            i < unnestedList.length;
                                            i++
                                        ) {
                                            for (
                                                let j = 0;
                                                j < siblingSkills.length;
                                                j++
                                            ) {
                                                if (
                                                    siblingSkills[j].id ==
                                                    unnestedList[i].id
                                                ) {
                                                    if (
                                                        unnestedList[i]
                                                            .is_mastered != 1
                                                    ) {
                                                        allMastered = false;
                                                    }
                                                }
                                            }
                                        }

                                        // If the others are, and now this one is, so unlock the super skill.
                                        if (allMastered) {
                                            makeAccessible(
                                                userId,
                                                skill.parent
                                            );
                                        }
                                    }
                                } catch (err) {
                                    next(err);
                                }
                            });
                        }
                        function makeAccessible(userId, skillId) {
                            // Make this skill accessible.
                            let sqlQuery3 =
                                `
    INSERT INTO skill_tree.user_skills (user_id, skill_id, is_accessible) 
    VALUES(` +
                                userId +
                                `, ` +
                                skillId +
                                `, 1) 
    ON DUPLICATE KEY UPDATE is_accessible=1;
    `;
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

                res.end();
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

/*
 * For mastering domains.
 */

function FindFirstAncestorDomain(skill, userId) {
    // Exit if this is a first level node.
    if (skill.parent == 0) {
        return;
    }

    // Get an updated list of user skills.

    let sqlQuery =
        `
SELECT skill_tree.skills.id, name, is_accessible, is_mastered, type, parent
FROM skill_tree.skills
LEFT OUTER JOIN skill_tree.user_skills
ON skill_tree.skills.id = skill_tree.user_skills.skill_id
WHERE skill_tree.user_skills.user_id = ` +
        userId +
        `

UNION
SELECT skill_tree.skills.id, name, "", "", type, parent
FROM skill_tree.skills
WHERE skill_tree.skills.id NOT IN 

(SELECT skill_tree.skills.id
FROM skill_tree.skills
LEFT OUTER JOIN skill_tree.user_skills
ON skill_tree.skills.id = skill_tree.user_skills.skill_id
WHERE skill_tree.user_skills.user_id =` +
        userId +
        `)
ORDER BY id;`;

    let query = conn.query(sqlQuery, (err, results) => {
        try {
            if (err) {
                throw err;
            }

            let userSkills = results;
            // Go up hierarchy to find the first domain node we can.
            // Store that as "domain".
            //
            // Go through all skills.
            for (let i = 0; i < userSkills.length; i++) {
                // Find skill parent.
                if (skill.parent == userSkills[i].id) {
                    let parent = userSkills[i];
                    if (parent.type == 'domain') {
                        // Get all of the domain's children.
                        let domainChildren = [];
                        for (let j = 0; j < userSkills.length; j++) {
                            if (userSkills[j].parent == parent.id) {
                                domainChildren.push(userSkills[j]);
                            }
                        }
                        // Save it and move to next function.
                        CheckIfDomainIsMastered(parent, domainChildren, userId);
                    } else {
                        // Run again for parent.
                        FindFirstAncestorDomain(userSkills, parent);
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }
    });
}

// Recursively check the domain's children, excluding subskills, including domains.
// If they are all mastered, the domain gets mastered.
// If the domain gets mastered, function then needs to find the next domain up and
// go again with that one.
function CheckIfDomainIsMastered(domain, parentChildren, userId) {
    let domainIsNowMastered = true;
    var i = parentChildren.length;
    while (i--) {
        // Check if mastered.
        // If not, exit.
        if (parentChildren[i].is_mastered != 1) {
            domainIsNowMastered = false;
            return;
        }
        // If yes, check if its descendants are also mastered.
        else {
            if (typeof parentChildren[i] !== 'undefined') {
                /*
                 * Run the above function again recursively.
                 */
                if (
                    parentChildren[i].children &&
                    Array.isArray(parentChildren[i].children) &&
                    parentChildren[i].children.length > 0
                )
                    CheckIfDomainIsMastered(parentChildren[i].children);
            }
        }
    }
    MakeDomainMastered(domain, userId);
}

// Need to make the domain mastered,
// and then check its first ancestor domain, to see if it should
// be made mastered.
function MakeDomainMastered(domain, userId) {
    let sqlQuery =
        `
INSERT INTO skill_tree.user_skills (user_id, skill_id, is_mastered, is_accessible) 
VALUES(` +
        userId +
        `, ` +
        domain.id +
        `, 1, 1) 
ON DUPLICATE KEY UPDATE is_mastered= 1, is_accessible=1;
`;

    let query = conn.query(sqlQuery, (err, results) => {
        try {
            if (err) {
                throw err;
            }
            // Then need to check if this domain's parent is ready to become mastered.
            FindFirstAncestorDomain(domain, userId);
        } catch (err) {
            console.log(err);
        }
    });
}

router.get('*', (req, res) => {
    res.redirect('/');
});

module.exports = router;
