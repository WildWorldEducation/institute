/*------------------------------------------
--------------------------------------------
Middleware.
--------------------------------------------
--------------------------------------------*/
const express = require('express');
// Router.
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());
// DB
const conn = require('../config/db');
// for querying DB
const util = require('util');
const query = util.promisify(conn.query).bind(conn);

/*------------------------------------------
--------------------------------------------
Routes
--------------------------------------------
--------------------------------------------*/

/* Get all tenants */
router.get('/list', (req, res, next) => {
    // Check if logged in.
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');

        let sqlQuery = `
            SELECT *
            FROM tenants;`;

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

/* Add tenant */
router.post('/add', (req, res, next) => {
    if (req.session.userName) {
        let data = {};
        data = { name: req.body.name };

        // Check if name exists already.
        let checkQuery = `
            SELECT *
            FROM tenants
            WHERE name = ${conn.escape(req.body.name)};`;

        conn.query(checkQuery, async (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                // Check if name exists (and not deleted)
                const nameExists = results.some(
                    (tenant) =>
                        tenant.name === req.body.name && tenant.is_deleted !== 1
                );

                if (nameExists) {
                    return res.json({
                        tenant: 'name already taken'
                    });
                }

                let sqlQuery = 'INSERT INTO tenants SET ?';
                conn.query(sqlQuery, data, (err, results) => {
                    try {
                        if (err) {
                            throw err;
                        } else {
                            res.json({
                                tenant: 'created'
                            });
                        }
                    } catch (err) {
                        next(err);
                    }
                });
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

router.get('/instructors/:tenantId', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `
            SELECT DISTINCT *
            FROM users
            WHERE users.tenant_id = ${conn.escape(req.params.tenantId)}
            AND (role = 'instructor' OR role = 'partner')
            AND is_deleted = 0;`;

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
 * Show tenant details
 */
router.get('/show/:tenantId', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `
            SELECT can_students_access_billing
            FROM tenants
            WHERE id = ${conn.escape(req.params.tenantId)};`;

        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                console.log(results[0].can_students_access_billing);
                res.json(results[0].can_students_access_billing);
            } catch (err) {
                next(err);
            }
        });
    }
});

/**
 * Edit tenant details
 */
router.put(
    '/:tenantId/edit',
    isAuthenticated,
    checkRoleHierarchy('editor'),
    async (req, res, next) => {
        if (req.session.userName) {
            let sqlQuery = `
                    ;`;

            conn.query(sqlQuery, async (err) => {
                try {
                    if (err) {
                        throw err;
                    }
                } catch (err) {
                    console.error(err);
                    next(err);
                }
            });
        } else {
            res.redirect('/login');
        }
    }
);

// Export the router for app to use.
module.exports = router;
