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

// Export the router for app to use.
module.exports = router;
