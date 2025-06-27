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
                    // if the node is not a super skill, make it unlocked
                    if (skills[i].type != 'super')
                        firstLevelSkills.push(skills[i]);
                    else {
                        // if the node is a super skill, make its subskills unlocked
                        for (let j = 0; j < skills.length; j++) {
                            if (
                                skills[j].parent == skills[i].id &&
                                skills[j].type == 'sub'
                            ) {
                                firstLevelSkills.push(skills[j]);
                            }
                        }
                    }
                }
            }

            for (let i = 0; i < firstLevelSkills.length; i++) {
                makeAccessible(userId, firstLevelSkills[i]);
            }
            // function makeMastered(userId, skill) {
            //     let sqlQuery = `
            //         INSERT INTO user_skills (user_id, skill_id, is_mastered, is_accessible)
            //         VALUES(${conn.escape(userId)},
            //         ${conn.escape(skill.id)},
            //         0,
            //         1)
            //         ON DUPLICATE KEY UPDATE is_mastered = 0,
            //         is_accessible = 1;`;

            //     //
            //     conn.query(sqlQuery, (err, results) => {
            //         try {
            //             if (err) {
            //                 throw err;
            //             }
            //         } catch (err) {
            //             console.log('error:' + err);
            //         }
            //     });
            // }

            function makeAccessible(userId, skill) {
                // Make this skill accessible.
                let sqlQuery3 = `
                    INSERT INTO user_skills (user_id, skill_id, is_accessible)
                    VALUES(${conn.escape(userId)},
                    ${conn.escape(skill.id)},
                    1)
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
