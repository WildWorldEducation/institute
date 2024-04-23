const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bodyParser = require('body-parser');

router.use(bodyParser.json());

/*------------------------------------------
--------------------------------------------
Database Connection
--------------------------------------------
--------------------------------------------*/
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'C0ll1ns1n5t1tut32022',
    //password: 'password',
    database: 'skill_tree'
});

/*------------------------------------------
--------------------------------------------
Shows Mysql Connect
--------------------------------------------
--------------------------------------------*/
conn.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MariaDB connected...');
});

// Sum of votes per skill.
router.get('/:id', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery =
            `
    SELECT * FROM skill_tree.user_votes
    WHERE resource_id =` + req.params.id;

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
 * Create or Update Item
 *
 * @return response()
 */
router.put('/:userId/:resourceId/edit/up', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery =
            `
        INSERT INTO skill_tree.user_votes (user_id, resource_id, vote) 
        VALUES(` +
            req.params.userId +
            `, ` +
            req.params.resourceId +
            `, 1) 
        ON DUPLICATE KEY UPDATE vote=1;
        `;

        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.send('test');
            } catch (err) {
                next(err);
            }
        });
    }
});

router.put('/:userId/:resourceId/edit/down', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery =
            `
        INSERT INTO skill_tree.user_votes (user_id, resource_id, vote) 
        VALUES(` +
            req.params.userId +
            `, ` +
            req.params.resourceId +
            `, -1) 
        ON DUPLICATE KEY UPDATE vote=-1;
        `;

        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.send('test');
            } catch (err) {
                next(err);
            }
        });
    }
});

// To cancel vote.
router.put('/:userId/:resourceId/edit/cancel', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery =
            `
        INSERT INTO skill_tree.user_votes (user_id, resource_id, vote) 
        VALUES(` +
            req.params.userId +
            `, ` +
            req.params.resourceId +
            `, 0) 
        ON DUPLICATE KEY UPDATE vote=0;
        `;

        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.send('test');
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
