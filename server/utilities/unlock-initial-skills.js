// Database Connection
const conn = require('../config/db');

function unlockInitialSkills(userId) {
    // Get a list of all skills.
    let sqlQuery1 = 'SELECT * FROM skills;';
    conn.query(sqlQuery1, (err, results) => {
        try {
            if (err) {
                throw err;
            }
            let skills = results;
            let firstLevelSkills = [];
            for (let i = 0; i < skills.length; i++) {
                if (skills[i].parent == 0) {
                    firstLevelSkills.push(skills[i]);
                }
            }
            // console.log(firstLevelSkills);
            for (let i = 0; i < firstLevelSkills.length; i++) {
                // Recursive function.
                makeMastered(userId, firstLevelSkills[i]);
            }
            function makeMastered(userId, skill) {
                let value;
                if (skill.type == 'domain') {
                    value = 0;
                } else {
                    value = 1;
                }

                let sqlQuery =
                    `
                                INSERT INTO user_skills (user_id, skill_id, is_mastered, is_accessible) 
                                VALUES('${userId}', ` +
                    skill.id +
                    `, ` +
                    value +
                    `, 1) 
                                ON DUPLICATE KEY UPDATE is_mastered=` +
                    value +
                    `, is_accessible=1;
                                `;
                //
                conn.query(sqlQuery, (err, results) => {
                    try {
                        if (err) {
                            throw err;
                        }
                        // Check if is a sub skill.
                        if (skill.type != 'sub') {
                            // Get all the child skills.
                            const childSkills = [];
                            for (let i = 0; i < skills.length; i++) {
                                if (skills[i].parent == skill.id) {
                                    childSkills.push(skills[i]);
                                }
                            }

                            let subSkills = [];
                            // Make them accessible/unlocked if regular type skills.
                            for (let i = 0; i < childSkills.length; i++) {
                                if (childSkills[i].type == 'regular') {
                                    makeAccessible(userId, childSkills[i].id);
                                } else if (childSkills[i].type == 'domain') {
                                    makeMastered(userId, childSkills[i]);
                                }
                                // If super type skills, make their subskills accessible.
                                else if (childSkills[i].type == 'super') {
                                    for (let j = 0; j < skills.length; j++) {
                                        if (
                                            skills[j].parent ==
                                                childSkills[i].id &&
                                            skills[j].type == 'sub'
                                        ) {
                                            subSkills.push(skills[j].id);
                                        }
                                    }
                                }
                            }
                            for (let i = 0; i < subSkills.length; i++) {
                                makeAccessible(userId, subSkills[i]);
                            }
                        }
                        // If this skill is a sub skill.
                        else {
                            // Get its sibling skills.
                            let siblingSkills = [];
                            for (let i = 0; i < skills.length; i++) {
                                if (
                                    skills[i].parent == skill.parent &&
                                    skills[i].id != skill.id
                                ) {
                                    if (skills[i].type == 'sub') {
                                        siblingSkills.push(skills[i]);
                                    }
                                }
                            }
                        }
                    } catch (err) {
                        console.log('error:' + err);
                    }
                });
            }

            function makeAccessible(userId, skillId) {
                // Make this skill accessible.
                let sqlQuery3 =
                    `
        INSERT INTO user_skills (user_id, skill_id, is_accessible) 
        VALUES('${userId}', ` +
                    skillId +
                    `, 1) 
        ON DUPLICATE KEY UPDATE is_accessible=1;
        `;
                conn.query(sqlQuery3, (err, results) => {
                    try {
                        if (err) {
                            throw err;
                        }
                    } catch (err) {
                        console.log('error:' + err);
                    }
                });
            }
        } catch (err) {
            console.log('error:' + err);
        }
    });
}

module.exports = { unlockInitialSkills };
