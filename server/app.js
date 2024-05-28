var express = require('express');

var app = express();

// Middleware
const mysql = require('mysql');
const bodyParser = require('body-parser');

const path = require('path');
const fs = require('fs').promises;
const publicPath = path.join(path.resolve(), 'public');
const distPath = path.join(path.resolve(), 'dist');

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
var history = require('connect-history-api-fallback');

const oneDay = 1000 * 60 * 60 * 24;
app.use(
    sessions({
        secret: 'thisismysecrctekeyfhrgfgrfrty84fwir767',
        saveUninitialized: true,
        cookie: { maxAge: oneDay },
        resave: false
    })
);

// Route files.
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

app.locals.title = 'Skill Tree';

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

if (process.env.NODE_ENV === 'production') {
    app.use('/', express.static(distPath));
} else {
    app.use('/', express.static(publicPath));
}

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

// Routes -----------------------------

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
    let sqlQuery =
        "SELECT * FROM skill_tree.users WHERE email = '" +
        googleUserDetails.email +
        "';";
    let query = conn.query(sqlQuery, (err, results) => {
        try {
            if (err) {
                throw err;
            }
            // Check if user exists.
            if (typeof results[0] !== 'undefined') {
                // Log user in.
                req.session.isLoggedIn = true;
                req.session.userId = results[0].id;
                req.session.userName = results[0].username;
                req.session.role = results[0].role;
                res.redirect('/');
            } else {
                googleLoginResult = 'no account';
                res.redirect('/');
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

// Login and out. -----------------------------------
// DELETE - redundant with below ("session-details")
// To show whether the user is logged in or not in the nav bar,
// and to pass there data to the Profile and Settings view.
app.get('/login-status', (req, res) => {
    res.send(req.session.isLoggedIn);
});

// Log in with username and password.
app.post('/login-attempt', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    // Escape single quotes for SQL to accept.
    if (req.body.username != null)
        req.body.username = req.body.username.replace(/'/g, "\\'");
    if (req.body.password != null)
        req.body.password = req.body.password.replace(/'/g, "\\'");

    // Execute SQL query that'll select the account from the database based on the specified username and password.
    let sqlQuery1 =
        "SELECT * FROM skill_tree.users WHERE skill_tree.users.username = '" +
        req.body.username +
        "' AND skill_tree.users.password = '" +
        req.body.password +
        "';";
    let query1 = conn.query(sqlQuery1, (err, results) => {
        try {
            if (err) {
                throw err;
            }
            // Create session object.
            else if (results.length > 0) {
                req.session.userId = results[0].id;
                req.session.userName = req.body.username;
                req.session.firstName = results[0].first_name;
                req.session.lastName = results[0].last_name;
                req.session.skillTreeTheme = results[0].skilltree_theme;
                req.session.role = results[0].role;
                res.json({ account: 'authorized', role: req.session.role });
            } else {
                // If both the username and password are not correct, check if the account exists.
                let sqlQuery2 =
                    "SELECT * FROM skill_tree.users WHERE skill_tree.users.username = '" +
                    req.body.username +
                    "';";
                let query2 = conn.query(sqlQuery2, (err, results) => {
                    try {
                        if (err) {
                            throw err;
                        }
                        // Tell user their password is incorrect.
                        else if (results.length > 0) {
                            res.json({ account: 'wrong-password' });
                        }
                        // If neither the username or password are correct, let user know.
                        else {
                            res.json({ account: 'no-account' });
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

app.post('/logout', (req, res) => {
    // Destroy the user session.
    req.session.destroy();
    res.end();
});

// User session -----------------------
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

// App settings --------------------------------------
// To get the app settings.
app.get('/settings', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `
        SELECT *
        FROM skill_tree.settings;`;
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

// Edit app settings.
app.put('/settings/edit', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery =
            `
        UPDATE settings 
        SET skill_degradation_days = ` +
            req.body.skill_degradation_days +
            `, quiz_max_questions = ` +
            req.body.quiz_max_questions;

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
