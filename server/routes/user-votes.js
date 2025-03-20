/*------------------------------------------
--------------------------------------------
Database Connection
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
Helper Functions for Reputation Management
--------------------------------------------
--------------------------------------------*/

/**
 * Update user reputation based on vote action
 * @param {string} resourceId - ID of the resource being voted on
 * @param {number} reputationChange - Amount to change reputation by
 * @param {function} callback - Callback function
 */
const updateUserReputation = (resourceId, reputationChange, callback) => {
    // Get the user_id of the resource owner
    const getOwnerQuery = `
        SELECT user_id FROM resources 
        WHERE id = ${conn.escape(resourceId)};
    `;

    conn.query(getOwnerQuery, (err, results) => {
        if (err) {
            return callback(err);
        }

        // If resource owner found, update their reputation
        if (results.length > 0) {
            const ownerId = results[0].user_id;

            const updateReputationQuery = `
                UPDATE users 
                SET reputation_score = reputation_score + ${conn.escape(
                    reputationChange
                )}
                WHERE id = ${conn.escape(ownerId)};
            `;

            conn.query(updateReputationQuery, callback);
        } else {
            // Resource not found, just proceed
            callback(null);
        }
    });
};

// Function to record reputation actions
const recordReputationAction = (resourceId, voteType) => {
    // Get the resource owner's ID
    const getOwnerQuery = `
        SELECT user_id FROM resources 
        WHERE id = ${conn.escape(resourceId)};
    `;

    conn.query(getOwnerQuery, (err, results) => {
        if (err) {
            console.error('Error getting resource owner:', err);
            return;
        }

        if (results && results.length > 0) {
            const ownerId = results[0].user_id;

            // Skip if owner not found or if no valid owner ID
            if (!ownerId) {
                console.error(
                    'No valid owner ID found for resource:',
                    resourceId
                );
                return;
            }

            // Use 'receive-reputation' for both, but include a comment field
            const actionData = {
                action: 'receive-reputation',
                content_id: resourceId,
                user_id: ownerId,
                content_type: 'resource', // Make sure this is 'resource'
                comment: voteType === 1 ? 'upvote' : 'downvote'
            };

            const actionQuery = 'INSERT INTO user_actions SET ?';
            conn.query(actionQuery, actionData, (err) => {
                if (err) {
                    console.error('Error recording reputation action:', err);
                } else {
                    console.log(
                        'Successfully recorded reputation action for resource',
                        resourceId
                    );
                }
            });
        } else {
            console.error('No resource found with ID:', resourceId);
        }
    });
};

// Function to delete reputation actions when votes are canceled
const deleteReputationAction = (resourceId) => {
    // Get the resource owner's ID
    const getOwnerQuery = `
    SELECT user_id FROM resources
    WHERE id = ${conn.escape(resourceId)}
    `;

    conn.query(getOwnerQuery, (err, results) => {
        if (err) {
            console.error('Error getting owner: ', err);
            return;
        }

        if (results && results.length > 0) {
            const ownerId = results[0].user_id;

            // Delete reputation actions for this resource
            const deleteQuery = `
            DELETE FROM user_actions 
            WHERE (action = 'receive-reputation' OR action = 'lose-reputation')
            AND content_id = ${conn.escape(resourceId)}
            AND user_id = ${conn.escape(ownerId)}
            AND content_type = 'resource';
            `;

            conn.query(deleteQuery, (err) => {
                if (err)
                    console.error('Error deleting reputation action: ', err);
            });
        }
    });
};

/**
 * Get current vote value to determine reputation change on cancel
 * @param {string} userId - ID of the user who voted
 * @param {string} resourceId - ID of the resource being voted on
 * @param {function} callback - Callback function with reputationChange
 */
const getExistingVoteValue = (userId, resourceId, callback) => {
    const query = `
        SELECT vote FROM user_votes
        WHERE user_id = ${conn.escape(userId)}
        AND resource_id = ${conn.escape(resourceId)};
    `;

    conn.query(query, (err, results) => {
        if (err) {
            return callback(err, 0);
        }

        if (results.length > 0) {
            // Return the opposite of current vote value, as that's how much to adjust reputation
            callback(null, results[0].vote * -1); // Reverse the impact
        } else {
            // No existing vote, no change needed
            callback(null, 0);
        }
    });
};

/*------------------------------------------
--------------------------------------------
Routes
--------------------------------------------
--------------------------------------------*/

// Sum of votes per source.
router.get('/:id', (req, res, next) => {
    // Not checking if user is logged in, as this is available for guest access.
    res.setHeader('Content-Type', 'application/json');
    let sqlQuery = `
    SELECT * FROM user_votes
    WHERE resource_id = ${conn.escape(req.params.id)};`;

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
 * Upvote source.
 *
 * @return response()
 */
router.put('/:userId/:resourceId/edit/up', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = `
        INSERT INTO user_votes (user_id, resource_id, vote) 
        VALUES(${conn.escape(req.params.userId)},
        ${conn.escape(req.params.resourceId)}, 1) 
        ON DUPLICATE KEY UPDATE vote=1;
        `;

        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                // Update reputation
                updateUserReputation(req.params.resourceId, 1, (repErr) => {
                    if (repErr) {
                        console.error('Error updating reputation:', repErr);
                        next(repErr);
                    } else {
                        // Record the reputation action
                        console.log(
                            'Recording reputation action for upvote on resource:',
                            req.params.resourceId
                        );
                        recordReputationAction(req.params.resourceId, 1);
                        res.end();
                    }
                });
            } catch (err) {
                next(err);
            }
        });
    }
});

// Vote source down.
router.put('/:userId/:resourceId/edit/down', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = `
        INSERT INTO user_votes (user_id, resource_id, vote) 
        VALUES(${conn.escape(req.params.userId)}, ${conn.escape(
            req.params.resourceId
        )}, -1) 
        ON DUPLICATE KEY UPDATE vote=-1;
        `;

        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                // Update reputation
                updateUserReputation(req.params.resourceId, -1, (repErr) => {
                    if (repErr) {
                        next(repErr);
                    } else {
                        // Record the reputation action
                        recordReputationAction(req.params.resourceId, -1);
                        res.end();
                    }
                });
            } catch (err) {
                next(err);
            }
        });
    }
});

// To cancel vote.
router.put('/:userId/:resourceId/edit/cancel', (req, res, next) => {
    if (req.session.userName) {
        getExistingVoteValue(
            req.params.userId,
            req.params.resourceId,
            (getErr, reputationChange) => {
                if (getErr) {
                    return next(getErr);
                }

                let sqlQuery = `
                INSERT INTO user_votes (user_id, resource_id, vote) 
                VALUES(${conn.escape(req.params.userId)}, ${conn.escape(
                    req.params.resourceId
                )}, 0) 
                ON DUPLICATE KEY UPDATE vote=0;
                `;

                conn.query(sqlQuery, (err, results) => {
                    try {
                        if (err) {
                            throw err;
                        }

                        // Update reputation
                        updateUserReputation(
                            req.params.resourceId,
                            reputationChange,
                            (repErr) => {
                                if (repErr) {
                                    next(repErr);
                                } else {
                                    // Delete the reputation action
                                    deleteReputationAction(
                                        req.params.resourceId
                                    );
                                    res.end();
                                }
                            }
                        );
                    } catch (err) {
                        next(err);
                    }
                });
            }
        );
    }
});

router.get('*', (req, res) => {
    res.redirect('/');
});

module.exports = router;
