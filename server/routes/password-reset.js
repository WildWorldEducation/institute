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
var crypto = require('crypto');
// For sending password reset email.
const nodemailer = require('nodemailer');
// The account is Gmail, so need to authenticate (OAuth)
const { google } = require('googleapis');
// DB
const conn = require('../config/db');

// For password encryption.
const bcrypt = require('bcrypt');
const saltRounds = 10;

/*------------------------------------------
--------------------------------------------
Routes
--------------------------------------------
--------------------------------------------*/
const oAuth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

// async function sendMail(params) {
//     try {
//         const accessToken = await oAuth2Client.getAccessToken();

//         const transport = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 type: 'OAuth2',
//                 user: 'jonathan@collinsinstitute.org',
//                 clientId: process.env.GMAIL_CLIENT_ID,
//                 clientSecret: process.env.GMAIL_CLIENT_SECRET,
//                 refreshToken: process.env.GMAIL_REFRESH_TOKEN,
//                 accessToken: accessToken
//             }
//         });

//         const mailOptions = {
//             from: 'Support@CollinsInstitute.org',
//             to: process.env.GMAIL_ADDRESS,
//             subject: 'Password Reset',
//             text: `Click the following link to reset your password: https://parrhesia.io/reset-password/${token}. It will expire in one hour.`
//         };
//     } catch (error) {
//         return error;
//     }
// }

/*
 * When user clicks "forgot password" link.
 */
router.post('/forgot-password', (req, res, next) => {
    console.log('password reset');
    const { email } = req.body;

    let usersSqlQuery = `SELECT * 
    FROM users 
    WHERE email = ${conn.escape(email)}
    AND is_deleted = 0;`;

    conn.query(usersSqlQuery, (err, results) => {
        try {
            if (err) {
                throw err;
            } else {
                let user = results[0];
                // Check if the email exists in your user database
                if (results.length > 0) {
                    // Generate a reset token
                    const token = crypto.randomBytes(20).toString('hex');
                    // Store the token with the user's email in a database or in-memory store
                    let dateTime = new Date();
                    dateTime = dateTime
                        .toISOString()
                        .slice(0, 19)
                        .replace('T', ' ');

                    let updateTokenSqlQuery = `UPDATE users
                    SET reset_password_token = ${conn.escape(token)},
                    reset_password_token_datetime = ${conn.escape(dateTime)}
                    WHERE id = ${conn.escape(user.id)};`;

                    conn.query(updateTokenSqlQuery, async (err) => {
                        try {
                            if (err) {
                                throw err;
                            }

                            // Send the reset token to the user's email
                            // const transporter = nodemailer.createTransport({
                            //     service: process.env.EMAIL_SERVICE,
                            //     host: process.env.EMAIL_HOST,
                            //     port: 465,
                            //     secure: true,
                            //     auth: {
                            //         user: process.env.APP_EMAIL_ADDRESS,
                            //         pass: process.env.APP_EMAIL_PASSWORD
                            //     }
                            // });
                            // const mailOptions = {
                            //     from: process.env.APP_EMAIL_ADDRESS,
                            //     to: email,
                            //     subject: 'Password Reset',
                            //     text: `Click the following link to reset your password: https://parrhesia.io/reset-password/${token}. It will expire in one hour.`
                            // };

                            const accessToken =
                                await oAuth2Client.getAccessToken();

                            const transport = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    type: 'OAuth2',
                                    user: 'jonathan@collinsinstitute.org',
                                    clientId: process.env.GMAIL_CLIENT_ID,
                                    clientSecret:
                                        process.env.GMAIL_CLIENT_SECRET,
                                    refreshToken:
                                        process.env.GMAIL_REFRESH_TOKEN,
                                    accessToken: accessToken
                                }
                            });

                            const mailOptions = {
                                from: 'Support@CollinsInstitute.org',
                                to: email,
                                subject: 'Password Reset',
                                text: `Click the following link to reset your password: https://parrhesia.io/reset-password/${token}. It will expire in one hour.`
                            };

                            transport.sendMail(mailOptions, (error, info) => {
                                if (error) {
                                    console.log(error);
                                    res.status(500).send('Error sending email');
                                } else {
                                    //console.log(`Email sent: ${info.response}`);
                                    res.status(200).json({
                                        status: 'success'
                                    });
                                }
                            });
                        } catch (err) {
                            next(err);
                        }
                    });
                } else {
                    res.status(404).send('Email not found');
                }
            }
        } catch (err) {
            next(err);
        }
    });
});

/*
 * When user clicks "reset password" link in email.
 * A form to create a new password.
 */
router.get('/reset-password/:token', (req, res, next) => {
    const { token } = req.params;
    // Check if the token exists and is still valid
    let usersSqlQuery = `SELECT * 
    FROM users 
    WHERE reset_password_token = ${conn.escape(token)}
    AND is_deleted = 0;`;

    conn.query(usersSqlQuery, (err, results) => {
        try {
            if (err) {
                throw err;
            }
            if (results.length > 0) {
                // Get the datetime the token was created.
                let dateTime = results[0].reset_password_token_datetime;
                let oneHour = 60 * 60 * 1000;
                // Check if it is less than one hour old.
                if (new Date() - dateTime < oneHour) {
                    res.status(200).json({ status: 'valid' });
                } else {
                    res.status(404).json({ status: 'expired' });
                }
            } else {
                res.status(404).json({ status: 'invalid' });
            }
        } catch (err) {
            next(err);
        }
    });
});

/*
 * When user submits the new password form.
 */
router.post('/reset-password', (req, res, next) => {
    const { token, password } = req.body;

    // Check if the token exists and is still valid
    let usersSqlQuery = `SELECT * 
    FROM users 
    WHERE reset_password_token = ${conn.escape(token)}
    AND is_deleted = 0;`;
    conn.query(usersSqlQuery, (err, results) => {
        try {
            if (err) {
                throw err;
            }

            if (results.length > 0) {
                let escapedPassword = conn.escape(password);
                // Hash the password.
                bcrypt.hash(
                    escapedPassword,
                    saltRounds,
                    function (err, hashedPassword) {
                        if (err) {
                            console.log(err);
                        }

                        // Find the user with the given token and update their password
                        let updatePasswordSqlQuery = `UPDATE users
                        SET password = ${conn.escape(hashedPassword)}
                        WHERE reset_password_token = ${conn.escape(token)};`;

                        conn.query(updatePasswordSqlQuery, (err) => {
                            try {
                                if (err) {
                                    throw err;
                                }

                                // Remove the reset token after the password is updated
                                let removeTokenSqlQuery = `UPDATE users
                                SET reset_password_token = '', 
                                reset_password_token_datetime = NULL
                                WHERE reset_password_token = ${conn.escape(
                                    token
                                )};`;

                                conn.query(removeTokenSqlQuery, (err) => {
                                    try {
                                        if (err) {
                                            throw err;
                                        }

                                        res.status(200).json({
                                            status: 'Password updated successfully'
                                        });
                                    } catch (err) {
                                        next(err);
                                    }
                                });
                            } catch (err) {
                                next(err);
                            }
                        });
                    }
                );
            } else {
                res.status(404).json({ status: 'Invalid or expired token' });
            }
        } catch (err) {
            next(err);
        }
    });
});

// Export the router for app to use.
module.exports = router;
