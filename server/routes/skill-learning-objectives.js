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
 * List Items
 */
// Available in guest mode.
router.get('/:skillId/list', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    let sqlQuery = `SELECT * 
        FROM skill_learning_objectives
        WHERE skill_id = ${conn.escape(req.params.skillId)}`;

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
});

/**
 * Add New Learning Objective
 */
router.post('/:skillId/add', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');

    const { objective } = req.body;

    if (!objective || objective.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Learning objective text is required'
        });
    }

    if (objective.trim().length < 10) {
        return res.status(400).json({
            success: false,
            message: 'Learning objective must be at least 10 characters long'
        });
    }

    let insertQuery = `INSERT INTO skill_learning_objectives (skill_id, objective) 
                       VALUES (${conn.escape(
                           req.params.skillId
                       )}, ${conn.escape(objective.trim())})`;

    conn.query(insertQuery, (err, results) => {
        try {
            if (err) {
                throw err;
            }

            res.json({
                success: true,
                message: 'Learning objective added successfully',
                id: results.insertId
            });
        } catch (err) {
            next(err);
        }
    });
});

/**
 * Delete Learning Objective
 */
router.delete('/:skillId/:objectiveId', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');

    // First check if the learning objective exists and belongs to the specified skill
    let checkQuery = `SELECT id FROM skill_learning_objectives 
                     WHERE id = ${conn.escape(req.params.objectiveId)} 
                     AND skill_id = ${conn.escape(req.params.skillId)}`;

    conn.query(checkQuery, (err, checkResults) => {
        try {
            if (err) {
                throw err;
            }

            if (checkResults.length === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        'Learning objective not found or does not belong to this skill'
                });
            }

            // If exists, proceed with deletion
            let deleteQuery = `DELETE FROM skill_learning_objectives 
                             WHERE id = ${conn.escape(req.params.objectiveId)} 
                             AND skill_id = ${conn.escape(req.params.skillId)}`;

            conn.query(deleteQuery, (deleteErr, deleteResults) => {
                try {
                    if (deleteErr) {
                        throw deleteErr;
                    }

                    res.json({
                        success: true,
                        message: 'Learning objective deleted successfully'
                    });
                } catch (deleteErr) {
                    next(deleteErr);
                }
            });
        } catch (err) {
            next(err);
        }
    });
});

/**
 * Get Single Learning Objective for Editing
 */
router.get('/:skillId/:objectiveId', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');

    let sqlQuery = `SELECT * 
                    FROM skill_learning_objectives 
                    WHERE id = ${conn.escape(req.params.objectiveId)} 
                    AND skill_id = ${conn.escape(req.params.skillId)}`;

    conn.query(sqlQuery, (err, results) => {
        try {
            if (err) {
                throw err;
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        'Learning objective not found or does not belong to this skill'
                });
            }

            res.json(results[0]);
        } catch (err) {
            next(err);
        }
    });
});

/**
 * Update Learning Objective
 */
router.put('/:skillId/:objectiveId', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');

    const { objective } = req.body;

    if (!objective || objective.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Learning objective text is required'
        });
    }

    // First check if the learning objective exists and belongs to the specified skill
    let checkQuery = `SELECT id FROM skill_learning_objectives 
                      WHERE id = ${conn.escape(req.params.objectiveId)} 
                      AND skill_id = ${conn.escape(req.params.skillId)}`;

    conn.query(checkQuery, (err, checkResults) => {
        try {
            if (err) {
                throw err;
            }

            if (checkResults.length === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        'Learning objective not found or does not belong to this skill'
                });
            }

            // If exists, proceed with update
            let updateQuery = `UPDATE skill_learning_objectives 
                              SET objective = ${conn.escape(objective.trim())}
                              WHERE id = ${conn.escape(req.params.objectiveId)} 
                              AND skill_id = ${conn.escape(
                                  req.params.skillId
                              )}`;

            conn.query(updateQuery, (updateErr, updateResults) => {
                try {
                    if (updateErr) {
                        throw updateErr;
                    }

                    res.json({
                        success: true,
                        message: 'Learning objective updated successfully'
                    });
                } catch (updateErr) {
                    next(updateErr);
                }
            });
        } catch (err) {
            next(err);
        }
    });
});

// Export the router for app to use.
module.exports = router;
