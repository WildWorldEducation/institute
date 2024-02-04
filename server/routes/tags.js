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
    password: 'password',
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
        let sqlQuery = "SELECT * FROM tags";
        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.json(results);
            } catch (err) {
                next(err)
            }
        });
    }
});


/**
* Create New Item 
*
* @return response()
*/
router.post('/add', (req, res, next) => {
    if (req.session.userName) {
        let data = {};
        data = { name: req.body.name };
        let sqlQuery = "INSERT INTO tags SET ?";
        let query = conn.query(sqlQuery, data, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                else {
                    res.end();
                }
            } catch (err) {
                next(err)
            }
        });
    }
    else {
        res.redirect('/login');
    }
});


/**
 * Delete Item
 *
 * @return response()
 */
router.delete('/:id', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = "DELETE FROM tags WHERE id=" + req.params.id;
        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.end();
            } catch (err) {
                next(err)
            }
        });
    }
    else {
        res.redirect('/login');
    }
});

// Export the router for app to use.
module.exports = router 