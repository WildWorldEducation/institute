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
        let sqlQuery = `SELECT * FROM news`;
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
        if (req.body.news1 != null)
            req.body.news1 = req.body.news1.replace(/'/g, "\\'");
        if (req.body.news2 != null)
            req.body.news2 = req.body.news2.replace(/'/g, "\\'");
        if (req.body.news3 != null)
            req.body.news3 = req.body.news3.replace(/'/g, "\\'");
        if (req.body.news4 != null)
            req.body.news4 = req.body.news4.replace(/'/g, "\\'");

        // Add data.
        let sqlQuery =
            `UPDATE news 
        SET news_1='` +
            req.body.news1 +
            `', news_2 = '` +
            req.body.news2 +
            `', news_3 = '` +
            req.body.news3 +
            `', news_4 = '` +
            req.body.news4 +
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
