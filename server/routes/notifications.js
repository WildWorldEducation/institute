const express = require('express');

// Router.
const router = express.Router();

// Middleware.
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

/**
 * List Items
 *
 * @return response()
 */
router.get('/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT notification_1, notification_2 FROM notifications`;
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
 * Update Items
 *
 * @return response()
 */
router.put('/edit', (req, res, next) => {
    if (req.session.userName) {
        // Escape single quotes for SQL to accept.
        if (req.body.notification1 != null)
            req.body.notification1 = req.body.notification1.replace(
                /'/g,
                "\\'"
            );
        if (req.body.notification2 != null)
            req.body.notification2 = req.body.notification2.replace(
                /'/g,
                "\\'"
            );

        // Add data.
        let sqlQuery =
            `UPDATE notifications 
        SET notification_1='` +
            req.body.notification1 +
            `', notification_2 = '` +
            req.body.notification2 +
            `';`;
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
    } else {
        res.redirect('/login');
    }
});

// Export the router for app to use.
module.exports = router;
