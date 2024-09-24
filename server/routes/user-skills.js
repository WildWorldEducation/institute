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

/* Nested list of user-skills*/
// For the skills list (also know as the "Collapsible Tree").
router.get('/:userId', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
    SELECT skills.id, name AS skill_name, parent, is_accessible, is_mastered, type, level, skills.order as skillorder, display_name, is_copy_of_skill_id, url
    FROM skills
    LEFT OUTER JOIN user_skills
    ON skills.id = user_skills.skill_id
    WHERE user_skills.user_id = ${conn.escape(req.params.userId)} 
    AND is_filtered = 'available' 
    AND is_deleted = 0

    UNION
    SELECT skills.id, name, parent, "", "", type, level, skills.order as skillorder, display_name, is_copy_of_skill_id, url
    FROM skills
    WHERE skills.id NOT IN 

    (SELECT skills.id
    FROM skills
    LEFT OUTER JOIN user_skills
    ON skills.id = user_skills.skill_id
    WHERE user_skills.user_id = ${conn.escape(req.params.userId)}) 
    AND is_filtered = 'available' 
    AND is_deleted = 0
    ORDER BY skillorder, id;`;

        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                // Give each object a 'children' element.
                for (var i = 0; i < results.length; i++) {
                    results[i].children = [];
                }

                // Deal with skills that have multiple parents.
                // These skills have secret copies in the table.
                for (var i = 0; i < results.length; i++) {
                    if (results[i].display_name != null) {
                        results[i].skill_name = results[i].display_name;

                        for (var j = 0; j < results.length; j++) {
                            if (
                                results[i].is_copy_of_skill_id == results[j].id
                            ) {
                                results[i].is_accessible =
                                    results[j].is_accessible;
                                results[i].is_mastered = results[j].is_mastered;
                            }
                        }
                    }
                }

                // Assign children to parent skills.
                for (var i = 0; i < results.length; i++) {
                    // Regular parent.
                    if (results[i].parent != null && results[i].parent != 0) {
                        var parentId = results[i].parent;

                        // Go through all rows again, add children
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

/* Nested list of user-skills, with the subskills separate from the other child skills */
// Used for the radial skill tree component.
router.get('/separate-subskills/:userId', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
    SELECT skills.id, name AS skill_name, parent, is_accessible, is_mastered, type, level, skills.order as skillorder, display_name
    FROM skills
    LEFT OUTER JOIN user_skills
    ON skills.id = user_skills.skill_id
    WHERE user_skills.user_id = ${conn.escape(req.params.userId)} 
    AND is_filtered = 'available'

    UNION
    SELECT skills.id, name, parent, "", "", type, level, skills.order as skillorder, display_name
    FROM skills
    WHERE skills.id NOT IN 

    (SELECT skills.id
    FROM skills
    LEFT OUTER JOIN user_skills
    ON skills.id = user_skills.skill_id
    WHERE user_skills.user_id = ${conn.escape(req.params.userId)}) 
    AND is_filtered = 'available'
    ORDER BY skillorder, id;`;

        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                for (var i = 0; i < results.length; i++) {
                    results[i].children = [];
                    results[i].subskills = [];
                }

                // Add children for first parent.
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

                // Add the first level to the array.
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
router.get('/unnested-list/:userId', (req, res, next) => {
    // Check if logged in.
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
    SELECT skills.id, name, is_accessible, is_mastered, type
    FROM skills
    LEFT OUTER JOIN user_skills
    ON skills.id = user_skills.skill_id
    WHERE user_skills.user_id = ${conn.escape(req.params.userId)}

    UNION
    SELECT skills.id, name, "", "", type
    FROM skills
    WHERE skills.id NOT IN 

    (SELECT skills.id
    FROM skills
    LEFT OUTER JOIN user_skills
    ON skills.id = user_skills.skill_id
    WHERE user_skills.user_id = ${conn.escape(req.params.userId)})
    ORDER BY id;`;

        conn.query(sqlQuery, (err, results) => {
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

/* Filtered Unnested list - used on ShowSkill Vue component.*/
router.get('/filtered-unnested-list/:userId', (req, res, next) => {
    // Check if logged in.
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
    SELECT skills.id, name, is_accessible, is_mastered, type, parent
    FROM skills
    LEFT OUTER JOIN user_skills
    ON skills.id = user_skills.skill_id
    WHERE user_skills.user_id = ${conn.escape(req.params.userId)} 
    AND is_filtered = 'available'

    UNION
    SELECT skills.id, name, "", "", type, parent
    FROM skills
    WHERE skills.id NOT IN 

    (SELECT skills.id
    FROM skills
    LEFT OUTER JOIN user_skills
    ON skills.id = user_skills.skill_id
    WHERE user_skills.user_id = ${conn.escape(req.params.userId)}) 
    AND is_filtered = 'available'
    ORDER BY id;`;

        conn.query(sqlQuery, (err, results) => {
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
 * Make skill accessible.
 *
 * @return response()
 */
router.get('/accessible/:userId/:skillId', (req, res, next) => {
    if (req.session.userName) {
        // Make this skill accessible.
        let sqlQuery = `
        INSERT INTO user_skills (user_id, skill_id, is_accessible) 
        VALUES(${conn.escape(req.params.userId)},
        ${conn.escape(req.params.skillId)}, 1) 
        ON DUPLICATE KEY UPDATE is_accessible=1;
        `;
        conn.query(sqlQuery, (err, results) => {
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
 * Make skill locked.
 *
 * @return response()
 */
router.get('/inaccessible/:userId/:skillId', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = `
        INSERT INTO user_skills (user_id, skill_id, is_accessible) 
        VALUES(${conn.escape(req.params.userId)}, ${conn.escape(
            req.params.skillId
        )}, 0) 
        ON DUPLICATE KEY UPDATE is_accessible=0;
        `;

        conn.query(sqlQuery, (err, results) => {
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
 * Make skill unmastered.
 *
 * @return response()
 */
router.get('/unmastered/:userId/:skillId', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = `
        INSERT INTO user_skills (user_id, skill_id, is_mastered) 
        VALUES(${conn.escape(req.params.userId)}, ${conn.escape(
            req.params.skillId
        )}, 0) 
        ON DUPLICATE KEY UPDATE is_mastered=0;`;

        conn.query(sqlQuery, (err, results) => {
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
        conn.query(sqlQuery1, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                let skills = results;

                // Check if the skill that was mastered has any copies in the tree,
                // that also need to be made mastered now.
                let allSkillsToBeMadeMastered = [];
                allSkillsToBeMadeMastered.push(skill);
                for (let i = 0; i < skills.length; i++) {
                    if (skills[i].is_copy_of_skill_id == skill.id) {
                        allSkillsToBeMadeMastered.push(skills[i]);
                    }
                }

                // Get user skills.
                let sqlQuery2 = `
                SELECT skills.id, name, is_accessible, is_mastered, type
                FROM skills
                LEFT OUTER JOIN user_skills
                ON skills.id = user_skills.skill_id
                WHERE user_skills.user_id = ${conn.escape(req.params.userId)}
            
                UNION
                SELECT skills.id, name, "", "", type
                FROM skills
                WHERE skills.id NOT IN 
            
                (SELECT skills.id
                FROM skills
                LEFT OUTER JOIN user_skills
                ON skills.id = user_skills.skill_id
                WHERE user_skills.user_id = ${conn.escape(req.params.userId)})
                ORDER BY id;`;

                conn.query(sqlQuery2, (err, results) => {
                    try {
                        if (err) {
                            throw err;
                        }
                        let unnestedList = results;

                        for (
                            let i = 0;
                            i < allSkillsToBeMadeMastered.length;
                            i++
                        ) {
                            // Recursive function.
                            makeMastered(
                                req.params.userId,
                                allSkillsToBeMadeMastered[i]
                            );
                        }

                        function makeMastered(userId, skill) {
                            let value;
                            if (skill.type == 'domain') {
                                value = 0;
                            } else {
                                value = 1;
                            }

                            let sqlQuery = `
                            INSERT INTO user_skills (user_id, skill_id, is_mastered, is_accessible) 
                            VALUES(${conn.escape(req.params.userId)},
                            ${conn.escape(skill.id)},
                            ${conn.escape(value)},
                            1) 
                            ON DUPLICATE KEY UPDATE is_mastered= ${conn.escape(
                                value
                            )}, is_accessible=1;
                            `;

                            conn.query(sqlQuery, (err, results) => {
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
                            let sqlQuery3 = `
    INSERT INTO user_skills (user_id, skill_id, is_accessible) 
    VALUES(${conn.escape(userId)}, ${conn.escape(skillId)}, 1) 
    ON DUPLICATE KEY UPDATE is_accessible=1;
    `;
                            conn.query(sqlQuery3, (err, results) => {
                                try {
                                    if (err) {
                                        throw err;
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

    let sqlQuery = `
SELECT skills.id, name, is_accessible, is_mastered, type, parent
FROM skills
LEFT OUTER JOIN user_skills
ON skills.id = user_skills.skill_id
WHERE user_skills.user_id = ${conn.escape(userId)}

UNION
SELECT skills.id, name, "", "", type, parent
FROM skills
WHERE skills.id NOT IN 

(SELECT skills.id
FROM skills
LEFT OUTER JOIN user_skills
ON skills.id = user_skills.skill_id
WHERE user_skills.user_id = ${conn.escape(userId)})
ORDER BY id;`;

    conn.query(sqlQuery, (err, results) => {
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
    let sqlQuery = `
INSERT INTO user_skills (user_id, skill_id, is_mastered, is_accessible) 
VALUES(${conn.escape(userId)}, ${conn.escape(domain.id)}, 1, 1) 
ON DUPLICATE KEY UPDATE is_mastered= 1, is_accessible=1;
`;

    conn.query(sqlQuery, (err, results) => {
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
