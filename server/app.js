/*------------------------------------------
--------------------------------------------
Middleware
--------------------------------------------
--------------------------------------------*/
require('dotenv').config();
var express = require('express');
var app = express();
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs').promises;
const publicPath = path.join(path.resolve(), 'public');
const distPath = path.join(path.resolve(), 'dist');
const isAdmin = require('./middlewares/adminMiddleware');
const isAuthenticated = require('./middlewares/authMiddleware');
// Database Connection
const conn = require('./config/db');
const xmlbuilder = require('xmlbuilder');

// Allow things to work.
var cors = require('cors');
app.use(cors());
// Login with Google.
var jwt = require('jsonwebtoken');
// Limit effects max image size that can be uploaded.
app.use(bodyParser.json({ limit: '100mb' }));
app.use(
    bodyParser.urlencoded({
        limit: '100mb',
        extended: true,
        parameterLimit: 50000
    })
);
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
const sessions = require('express-session');
// parsing the incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// For Vue Router.
//var history = require('connect-history-api-fallback');
const oneDay = 1000 * 60 * 60 * 24;
app.use(
    sessions({
        secret: 'thisismysecrctekeyfhrgfgrfrty84fwir767',
        saveUninitialized: true,
        cookie: { maxAge: oneDay },
        resave: false
    })
);

// For primary key for users table, for Google signup.
const { v7: uuidv7 } = require('uuid');

/*------------------------------------------
--------------------------------------------
Routes
--------------------------------------------
--------------------------------------------*/
const userRouter = require('./routes/users');
app.use('/users', userRouter);
const skillRouter = require('./routes/skills');
app.use('/skills', skillRouter);
const userSkillRouter = require('./routes/user-skills');
app.use('/user-skills', userSkillRouter);
const resourcesRouter = require('./routes/resources');
app.use('/resources', resourcesRouter);
const userVotesRouter = require('./routes/user-votes');
app.use('/user-votes', userVotesRouter);
const tutorVotesRouter = require('./routes/tutor-votes');
app.use('/tutor-votes', tutorVotesRouter);
const tagRouter = require('./routes/tags');
app.use('/tags', tagRouter);
const skillTagRouter = require('./routes/skill-tags');
app.use('/skill-tags', skillTagRouter);
const questionRouter = require('./routes/questions');
app.use('/questions', questionRouter);
const notificationRouter = require('./routes/notifications');
app.use('/notifications', notificationRouter);
const newsRouter = require('./routes/news');
app.use('/news', newsRouter);
const assessmentsRouter = require('./routes/assessments');
app.use('/assessments', assessmentsRouter);
const unmarkedAnswersRouter = require('./routes/unmarked-answers');
app.use('/unmarked-answers', unmarkedAnswersRouter);
const instructorStudentsRouter = require('./routes/instructor-students');
app.use('/instructor-students', instructorStudentsRouter);
const skillTreeRouter = require('./routes/skilltree');
app.use('/skilltree', skillTreeRouter);
const contentFlagsRouter = require('./routes/content-flags');
app.use('/content-flags', contentFlagsRouter);
const userActions = require('./routes/user-actions');
app.use('/user-actions', userActions);
const tutorPosts = require('./routes/tutor-posts');
app.use('/tutor-posts', tutorPosts);
const skillHistory = require('./routes/skill-history');
app.use('/skill-history', skillHistory);
const todoCount = require('./routes/todo-count');
app.use('/todo-count', todoCount);
const cohorts = require('./routes/cohorts');
app.use('/cohorts', cohorts);
const passwordReset = require('./routes/password-reset');
app.use('/password-reset', passwordReset);
const newSkillsAwaitingApproval = require('./routes/new-skills-awaiting-approval');
app.use('/new-skills-awaiting-approval', newSkillsAwaitingApproval);

app.locals.title = 'Skill Tree';

if (process.env.NODE_ENV === 'production') {
    app.use('/', express.static(distPath));
} else {
    app.use('/', express.static(publicPath));
}

/*
 * Login
 */

// Log in with Google.
var googleUserDetails;
app.post('/google-login-attempt', (req, res) => {
    googleUserDetails = jwt.decode(req.body.credential);
    res.redirect('/google-login-attempt');
});

var googleLoginResult;
app.get('/google-login-attempt', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    // Get user id based on Google email, if it exists.
    let sqlQuery = `SELECT * FROM users 
        WHERE email = ${conn.escape(googleUserDetails.email)}
        AND is_deleted = 0;`;
    conn.query(sqlQuery, (err, results) => {
        try {
            if (err) {
                throw err;
            }
            // Check if user exists.
            if (typeof results[0] !== 'undefined') {

                // Mark the user as authenticating with Google.
                let googleAuthQuery = `UPDATE users SET is_google_auth = 1 WHERE email = ${conn.escape(googleUserDetails.email)}`
                conn.query(googleAuthQuery);

                // Log user in.
                req.session.isLoggedIn = true;
                req.session.userId = results[0].id;
                req.session.userName = results[0].username;
                req.session.role = results[0].role;
                if (req.session.role == 'student')
                    res.redirect('/vertical-tree');
                else res.redirect('/');
            } else {
                // Create account.
                res.redirect('/google-student-signup-attempt');
            }
        } catch (err) {
            next(err);
        }
    });
});

app.get('/google-login-result', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json({ account: googleLoginResult });

    // Reset the variable.
    googleLoginResult = '';
});

// Sign up with Google.
app.post('/google-student-signup-attempt', (req, res) => {
    googleUserDetails = jwt.decode(req.body.credential);
    googleUserDetails.role = req.query.accountType;
    res.redirect('/google-student-signup-attempt');
});

const { unlockInitialSkills } = require('./utilities/unlock-initial-skills');
app.get('/google-student-signup-attempt', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    // Check if user already exists.
    let sqlQuery1 = `SELECT * 
        FROM users 
        WHERE email = ${conn.escape(googleUserDetails.email)};`;
    conn.query(sqlQuery1, (err, results) => {
        try {
            if (err) {
                throw err;
            }
            // Check if user exists.
            if (typeof results[0] !== 'undefined') {
                if (results[0].is_deleted) {
                    let restoreSqlQuery =
                        'UPDATE users SET is_deleted = 0 WHERE email = ?';
                    conn.query(
                        restoreSqlQuery,
                        [googleUserDetails.email],
                        (error, res) => {
                            if (error) {
                                throw error;
                            }
                        }
                    );
                }

                // Mark the user as authenticating with Google.
                let googleAuthQuery = `UPDATE users SET is_google_auth = 1 WHERE email = ?`
                conn.query(googleAuthQuery, [googleUserDetails.email]);

                // Log user in.
                req.session.isLoggedIn = true;
                req.session.userId = results[0].id;
                req.session.userName = results[0].username;
                req.session.role = results[0].role;
                googleLoginResult = 'new account';
                res.redirect('/vertical-tree');
            }
            // If not.
            else {
                // Providing default avatar.
                // Providing it here, as MEDIUMTEXT type in DB not accepting default values.
                let defaultAvatar = `data:image/png;base64,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`;

                // Create account.
                // Set the primary key.
                let newStudentId = uuidv7();
                let data = {
                    first_name: googleUserDetails.given_name,
                    last_name: googleUserDetails.family_name,
                    username: googleUserDetails.email,
                    email: googleUserDetails.email,
                    role: googleUserDetails.role,
                    avatar: defaultAvatar,
                    id: newStudentId,
                    is_google_auth: 1
                };

                let sqlQuery2 = 'INSERT INTO users SET ?';
                conn.query(sqlQuery2, data, (err, results) => {
                    try {
                        if (err) {
                            throw err;
                        } else {
                            // Create session to log the user in.
                            req.session.userId = newStudentId;
                            req.session.userName = data.username;
                            req.session.firstName = data.first_name;
                            req.session.lastName = data.last_name;
                            req.session.role = data.role;

                            // Unlock skills here
                            unlockInitialSkills(newStudentId);
                            googleLoginResult = 'new account';
                            res.redirect('/vertical-tree');
                        }
                    } catch (err) {
                        next(err);
                    }
                });
            }
        } catch (err) {
            next(err);
        }
    });
});

app.post('/google-editor-signup-attempt', (req, res) => {
    googleUserDetails = jwt.decode(req.body.credential);
    res.redirect('/google-editor-signup-attempt');
});

app.get('/google-editor-signup-attempt', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    // Check if user already exists.
    let sqlQuery1 = `SELECT * 
    FROM users 
    WHERE email = ${conn.escape(googleUserDetails.email)};`;
    conn.query(sqlQuery1, (err, results) => {
        try {
            if (err) {
                throw err;
            }
            // Check if user exists.
            if (typeof results[0] !== 'undefined') {
                if (results[0].is_deleted) {
                    let restoreSqlQuery =
                        'UPDATE users SET is_deleted = 0 WHERE email = ?';
                    conn.query(
                        restoreSqlQuery,
                        [googleUserDetails.email],
                        (error, res) => {
                            if (error) {
                                throw error;
                            }
                        }
                    );
                }

                // Mark the user as authenticating with Google.
                let googleAuthQuery = `UPDATE users SET is_google_auth = 1 WHERE email = ?`
                conn.query(googleAuthQuery, [googleUserDetails.email]);

                // Log user in.
                req.session.isLoggedIn = true;
                req.session.userId = results[0].id;
                req.session.userName = results[0].username;
                req.session.role = results[0].role;
                res.redirect('/');
            }
            // If not.
            else {
                // Providing default avatar.
                // Providing it here, as MEDIUMTEXT type in DB not accepting default values.
                let defaultAvatar = `data:image/png;base64,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`;

                // Create account.
                // Set the primary key.
                let newEditorId = uuidv7();
                let data = {
                    first_name: googleUserDetails.given_name,
                    last_name: googleUserDetails.family_name,
                    username: googleUserDetails.email,
                    email: googleUserDetails.email,
                    role: 'editor',
                    avatar: defaultAvatar,
                    id: newEditorId,
                    is_google_auth: 1
                };

                let sqlQuery2 = 'INSERT INTO users SET ?';
                conn.query(sqlQuery2, data, (err, results) => {
                    try {
                        if (err) {
                            throw err;
                        } else {
                            // Create session to log the user in.
                            req.session.userId = newEditorId;
                            req.session.userName = data.username;
                            req.session.firstName = data.first_name;
                            req.session.lastName = data.last_name;
                            req.session.role = data.role;

                            // Unlock skills here
                            unlockInitialSkills(newEditorId);

                            res.redirect('/');
                        }
                    } catch (err) {
                        next(err);
                    }
                });
            }
        } catch (err) {
            next(err);
        }
    });
});

// Login and out. -----------------------------------
// DELETE - redundant with below ("session-details")
// To show whether the user is logged in or not in the nav bar,
// and to pass there data to the Profile and Settings view.
app.get('/login-status', (req, res) => {
    res.send(req.session.isLoggedIn);
});

// Log in with username and password.
// For password decryption.
const bcrypt = require('bcrypt');
app.post('/login-attempt', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    // Look for user.
    const loginQuery = `SELECT id, first_name, last_name, role, password 
                       FROM users 
                       WHERE users.username = ${conn.escape(req.body.username)} 
                       AND users.is_deleted = 0;`;

    conn.query(loginQuery, (err, results) => {
        try {
            if (err) {
                console.log(err);
                throw err;
            }

            // If username is found in DB.
            if (results.length > 0) {
                // Check password.
                bcrypt.compare(
                    req.body.password,
                    results[0].password,
                    (err, response) => {
                        if (err) {
                        }

                        // If password matches.
                        if (response) {
                            // Populate user session data.
                            req.session.userId = results[0].id;
                            req.session.userName = req.body.username;
                            req.session.firstName = results[0].first_name;
                            req.session.lastName = results[0].last_name;
                            req.session.role = results[0].role;

                            // Send response to front end.
                            return res.json({
                                account: 'authorized',
                                role: req.session.role
                            });
                        }

                        // If password doesnt match.
                        return res.json({ account: 'wrong-password' });
                    }
                );
            } else {
                return res.json({ account: 'no-account' });
            }
        } catch (err) {
            next(err);
        }
    });
});

app.post('/logout', (req, res) => {
    // Destroy the user session.
    req.session.destroy();
    res.end();
});

/*
 * User session
 */
// Send the session variable.
app.get('/get-session-details', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if (req.session.userName) {
        req.session.isLoggedIn = true;
    } else {
        req.session.isLoggedIn = false;
    }

    res.json(req.session);
});

/*
 * App settings
 */
// To get the app settings.
app.get('/settings', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `
        SELECT *
        FROM settings;`;
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

// Edit app settings.
app.put('/settings/edit', isAuthenticated, isAdmin, (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = `UPDATE settings SET ? WHERE id = 1`;
        const data = req.body;
        conn.query(sqlQuery, data, (err, results) => {
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

app.get('/sitemap.xml', (req, res) => {
    const rootUrl = 'https://parrhesia.io';
    const today = new Date().toISOString();
    const routes = [
        {
            path: '',
            priority: 1.0
        },
        {
            path: '/vertical-tree',
            priority: 0.8
        },
        {
            path: '/radial-tree',
            priority: 0.8
        },
        {
            path: '/login',
            priority: 0.9
        },
        {
            path: '/student-signup',
            priority: 0.9
        },
        {
            path: '/editor-signup',
            priority: 0.9
        },
        {
            path: '/skills',
            priority: 0.8
        }
    ];

    const sqlQuery =
        'SELECT * FROM skills WHERE skills.is_deleted = 0 AND ( type = "regular" OR type = "super" )';
    conn.query(sqlQuery, (err, results) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }

        results.forEach((element) => {
            routes.push({
                path: `/skills/${element.name.replace(/ /g, '_')}`,
                priority: 1.0
            });
        });

        // Create the XML structure
        let sitemap = xmlbuilder
            .create('urlset', { encoding: 'UTF-8' })
            .att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');

        // Add URLs to the sitemap
        routes.forEach((route) => {
            sitemap
                .ele('url')
                .ele('loc', `${rootUrl}${route.path}`)
                .up() // Ensured no extra slash added
                .ele('lastmod', today)
                .up()
                .ele('changefreq', 'weekly')
                .up()
                .ele('priority', route.priority)
                .up(); // Use route.priority as a number
        });

        // Send the XML sitemap as the response
        res.header('Content-Type', 'application/xml');
        res.send(sitemap.end({ pretty: true }));
    });
});

const environment = process.env.NODE_ENV;

// For production deployment.
// For the index.html.ejs file
// For creating an absolute URL
// to allow for nested routes to be loaded in new tabs
// and refreshed in the browser.
// Live server.
process.env.BASE_URL = 'https://parrhesia.io';
// Dev server.
// process.env.BASE_URL = "http://localhost:3000";

app.get('/*', async (_req, res) => {
    const data = {
        environment,
        manifest: await parseManifest()
    };

    res.render('index.html.ejs', data);
});

const parseManifest = async () => {
    if (environment !== 'production') return {};

    const manifestPath = path.join(path.resolve(), 'dist', 'manifest.json');
    const manifestFile = await fs.readFile(manifestPath);

    return JSON.parse(manifestFile);
};

/**
 * API Response
 *
 * @return response()
 */
function apiResponse(results) {
    return JSON.stringify({ status: 200, error: null, response: results });
}

/*------------------------------------------
--------------------------------------------
Server listening
--------------------------------------------
--------------------------------------------*/
app.listen(3000, () => {
    console.log('Server started on port 3000...');
});
