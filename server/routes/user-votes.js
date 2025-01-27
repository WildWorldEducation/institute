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
                let getUserIdQuery = `
                    SELECT user_id
                    FROM resources
                    WHERE id = ${conn.escape(req.params.resourceId)};
                `;
                conn.query(getUserIdQuery, (err1, results1) => {
                    if (err1) {
                        throw err1;
                    }
                
                    // Check if a user_id was found
                    if (results1.length === 0) {
                        return res.status(404).send("Resource not found.");
                    }
                
                    // Extract the user_id
                    const targetUserId = results1[0].user_id;
                
                    // Query 2: Update the reputation_score for the found user_id
                    let updateReputationQuery = `
                        UPDATE users
                        SET reputation_score = (
                            SELECT COALESCE(SUM(v.vote), 0) DIV 5
                            FROM resources r
                            JOIN user_votes v ON r.id = v.resource_id
                            WHERE r.user_id = ${conn.escape(targetUserId)}
                        )
                        WHERE id = ${conn.escape(targetUserId)};
                    `;
                
                    conn.query(updateReputationQuery, (err2, results2) => {
                        if (err2) {
                            throw err2;
                        }
                        // Successfully updated the reputation
                        res.end();
                    });
                });
                if (err) {
                    throw err;
                }
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
                let getUserIdQuery = `
                    SELECT user_id
                    FROM resources
                    WHERE id = ${conn.escape(req.params.resourceId)};
                `;
                conn.query(getUserIdQuery, (err1, results1) => {
                    if (err1) {
                        throw err1;
                    }
                
                    // Check if a user_id was found
                    if (results1.length === 0) {
                        return res.status(404).send("Resource not found.");
                    }
                
                    // Extract the user_id
                    const targetUserId = results1[0].user_id;
                
                    // Query 2: Update the reputation_score for the found user_id
                    let updateReputationQuery = `
                        UPDATE users
                        SET reputation_score = (
                            SELECT COALESCE(SUM(v.vote), 0) DIV 5
                            FROM resources r
                            JOIN user_votes v ON r.id = v.resource_id
                            WHERE r.user_id = ${conn.escape(targetUserId)}
                        )
                        WHERE id = ${conn.escape(targetUserId)};
                    `;
                
                    conn.query(updateReputationQuery, (err2, results2) => {
                        if (err2) {
                            throw err2;
                        }
                        // Successfully updated the reputation
                        res.end();
                    });
                });
                if (err) {
                    throw err;
                }
            } catch (err) {
                next(err);
            }
        });
    }
});

// To cancel vote.
router.put('/:userId/:resourceId/edit/cancel', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = `
        INSERT INTO user_votes (user_id, resource_id, vote) 
        VALUES(${conn.escape(req.params.userId)}, ${conn.escape(
            req.params.resourceId
        )}, 0) 
        ON DUPLICATE KEY UPDATE vote=0;
        `;

        conn.query(sqlQuery, (err, results) => {
            try {
                let getUserIdQuery = `
                    SELECT user_id
                    FROM resources
                    WHERE id = ${conn.escape(req.params.resourceId)};
                `;
                conn.query(getUserIdQuery, (err1, results1) => {
                    if (err1) {
                        throw err1;
                    }
                
                    // Check if a user_id was found
                    if (results1.length === 0) {
                        return res.status(404).send("Resource not found.");
                    }
                
                    // Extract the user_id
                    const targetUserId = results1[0].user_id;
                
                    // Query 2: Update the reputation_score for the found user_id
                    let updateReputationQuery = `
                        UPDATE users
                        SET reputation_score = (
                            SELECT COALESCE(SUM(v.vote), 0) DIV 5
                            FROM resources r
                            JOIN user_votes v ON r.id = v.resource_id
                            WHERE r.user_id = ${conn.escape(targetUserId)}
                        )
                        WHERE id = ${conn.escape(targetUserId)};
                    `;
                
                    conn.query(updateReputationQuery, (err2, results2) => {
                        if (err2) {
                            throw err2;
                        }
                        // Successfully updated the reputation
                        res.end();
                    });
                });
                if (err) {
                    throw err;
                }
            } catch (err) {
                next(err);
            }
        });
    }
});

router.get('*', (req, res) => {
    res.redirect('/');
});

module.exports = router;
