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
/**
 * Create or Update Item
 *
 * @return response()
 */
router.put('/:userId/:tutorPostId/edit/up', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery =
            `
        INSERT INTO tutor_votes (user_id, tutor_post_id, vote) 
        VALUES(` +
            req.params.userId +
            `, ` +
            req.params.tutorPostId +
            `, 1) 
        ON DUPLICATE KEY UPDATE vote=1;
        `;

        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.end();
            } catch (err) {
                next(err);
            }
        });
    }
});

router.put('/:userId/:tutorPostId/edit/down', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery =
            `
        INSERT INTO tutor_votes (user_id, tutor_post_id, vote) 
        VALUES(` +
            req.params.userId +
            `, ` +
            req.params.tutorPostId +
            `, -1) 
        ON DUPLICATE KEY UPDATE vote=-1;
        `;

        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.end();
            } catch (err) {
                next(err);
            }
        });
    }
});

// To cancel vote.
router.put('/:userId/:tutorPostId/edit/cancel', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery =
            `
        INSERT INTO user_votes (user_id, tutor_post_id, vote) 
        VALUES(` +
            req.params.userId +
            `, ` +
            req.params.tutorPostId +
            `, 0) 
        ON DUPLICATE KEY UPDATE vote=0;
        `;

        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.end();
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
