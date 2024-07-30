/*------------------------------------------
--------------------------------------------
Middleware
--------------------------------------------
--------------------------------------------*/
const express = require('express');
// Router.
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
 *
 * Get All Items of a Particular Skill
 *
 */
// Used for choosing parent skill when adding a new skill.
router.get('/:skillId/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery =
            `SELECT * 
            FROM skill_history 
            WHERE id = ` +
            req.params.skillId +
            ` ORDER BY edited_date DESC`;
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
 *
 * Get A Single Skill Revision
 *
 */
router.get('/:skillId/:versionNumber', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery =
            `SELECT * 
            FROM skill_history 
            WHERE id = ` +
            req.params.skillId +
            ` AND version_number = ` +
            req.params.versionNumber +
            ';';
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
 *
 * Revert current skill to this version.
 *
 */
router.put('/:skillId/revert-to/:versionNumber', (req, res, next) => {
    if (req.session.userName) {
        let skillRevision = {};
        let currentSkill = {};
        // Get the skill revision.
        let getSkillRevisionSqlQuery =
            `SELECT * 
        FROM skill_history 
        WHERE id = ` +
            req.params.skillId +
            ` AND version_number = ` +
            req.params.versionNumber +
            ';';
        conn.query(getSkillRevisionSqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                skillRevision = results[0];
                // Get the current skill.
                let getCurrentSkillSqlQuery =
                    `SELECT * 
                    FROM skills 
                    WHERE id = ` +
                    req.params.skillId +
                    ';';

                conn.query(getCurrentSkillSqlQuery, (err, results) => {
                    try {
                        if (err) {
                            throw err;
                        }
                        currentSkill = results[0];

                        let type = currentSkill.type;
                        let parent = currentSkill.parent;
                        let versionNumber = currentSkill.version_number + 1;
                        console.log(currentSkill);

                        // Insert the current skill into the skill history.
                        let addNewRevisionSqlQuery = `
                            INSERT INTO skill_history
                            (id, version_number, user_id, name, description, icon_image, banner_image,
                            mastery_requirements, level, skill_history.order)
                            VALUES
                            (${skillRevision.id},
                            ${versionNumber},
                            ${req.session.userId},
                            '${skillRevision.name}',                    
                            '${skillRevision.description}',
                            '${currentSkill.icon_image}',
                            '${currentSkill.banner_image}',
                            '${skillRevision.mastery_requirements}',                    
                            '${skillRevision.level}',                    
                            ${skillRevision.order});`;

                        conn.query(addNewRevisionSqlQuery, (err) => {
                            try {
                                if (err) {
                                    throw err;
                                }

                                // Update record in skill table.
                                let updateRecordSQLQuery =
                                    `UPDATE skills SET name = '` +
                                    skillRevision.name +
                                    `', parent = '` +
                                    parent +
                                    `', description = '` +
                                    skillRevision.description +
                                    `', icon_image = '` +
                                    currentSkill.icon_image +
                                    `', banner_image = '` +
                                    currentSkill.banner_image +
                                    `', mastery_requirements = '` +
                                    skillRevision.mastery_requirements +
                                    `', type = '` +
                                    type +
                                    `', level = '` +
                                    skillRevision.level +
                                    `', skills.order = ` +
                                    skillRevision.order +
                                    `, version_number = ${versionNumber}
                                    , edited_date = current_timestamp
                                    WHERE id = ` +
                                    req.params.skillId +
                                    `;`;

                                conn.query(updateRecordSQLQuery, (err) => {
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
            } catch (err) {
                next(err);
            }
        });
    }
});

// Export the router for app to use.
module.exports = router;
