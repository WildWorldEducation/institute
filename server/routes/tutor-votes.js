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
 * @param {string} tutorPostId - ID of the tutor post being voted on
 * @param {number} reputationChange - Amount to change reputation by
 * @param {function} callback - Callback function
 */
const updateUserReputation = (tutorPostId, reputationChange, callback) => {
    // Get the user_id of the tutor post owner
    const getOwnerQuery = `
        SELECT user_id FROM tutor_posts 
        WHERE id = ${conn.escape(tutorPostId)};
    `;

    conn.query(getOwnerQuery, (err, results) => {
        if (err) {
            return callback(err);
        }

        // If tutor post owner found, update their reputation
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
            // Tutor post not found, just proceed
            callback(null);
        }
    });
};

/**
 * Get current vote value to determine reputation change on cancel
 * @param {string} userId - ID of the user who voted
 * @param {string} tutorPostId - ID of the tutor post being voted on
 * @param {function} callback - Callback function with reputationChange
 */
const getExistingVoteValue = (userId, tutorPostId, callback) => {
    const query = `
        SELECT vote FROM tutor_votes
        WHERE user_id = ${conn.escape(userId)}
        AND tutor_post_id = ${conn.escape(tutorPostId)};
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

/**
 * Sum of votes per skill.
 *
 * @return response()
 */
router.get('/:id', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `SELECT *
            FROM tutor_votes
            WHERE tutor_post_id = ${conn.escape(req.params.id)};`;

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
 * Vote up
 *
 * @return response()
 */
router.put('/:userId/:tutorPostId/edit/up', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = `
        INSERT INTO tutor_votes (user_id, tutor_post_id, vote) 
        VALUES(${conn.escape(req.params.userId)}, ${conn.escape(
            req.params.tutorPostId
        )}, 1) 
        ON DUPLICATE KEY UPDATE vote=1;
        `;

        // First update the vote
        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                // Then update reputation by +1 for upvote
                updateUserReputation(req.params.tutorPostId, 1, (repErr) => {
                    if (repErr) {
                        next(repErr);
                    } else {
                        res.end();
                    }
                });
            } catch (err) {
                next(err);
            }
        });
    }
});

// Vote down.
router.put('/:userId/:tutorPostId/edit/down', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = `
        INSERT INTO tutor_votes (user_id, tutor_post_id, vote) 
        VALUES(${conn.escape(req.params.userId)},
        ${conn.escape(req.params.tutorPostId)}, -1) 
        ON DUPLICATE KEY UPDATE vote=-1;
        `;

        // First update the vote
        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                // Then update reputation by -1 for downvote
                updateUserReputation(req.params.tutorPostId, -1, (repErr) => {
                    if (repErr) {
                        next(repErr);
                    } else {
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
router.put('/:userId/:tutorPostId/edit/cancel', (req, res, next) => {
    if (req.session.userName) {
        // First get the existing vote to determine reputation change
        getExistingVoteValue(
            req.params.userId,
            req.params.tutorPostId,
            (getErr, reputationChange) => {
                if (getErr) {
                    return next(getErr);
                }

                let sqlQuery = `
            INSERT INTO tutor_votes (user_id, tutor_post_id, vote) 
            VALUES(${conn.escape(req.params.userId)},
            ${conn.escape(req.params.tutorPostId)}, 0) 
            ON DUPLICATE KEY UPDATE vote=0;
            `;

                // Update the vote
                conn.query(sqlQuery, (err, results) => {
                    try {
                        if (err) {
                            throw err;
                        }

                        // Then update reputation based on the previous vote value
                        updateUserReputation(
                            req.params.tutorPostId,
                            reputationChange,
                            (repErr) => {
                                if (repErr) {
                                    next(repErr);
                                } else {
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
