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

/*
 * When user clicks "forgot password" link.
 */
router.post('/forgot-password', (req, res, next) => {
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

                            const accessToken =
                                await oAuth2Client.getAccessToken();

                            const transport = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    type: 'OAuth2',
                                    user: 'help@collinsinstitute.org',
                                    clientId: process.env.GMAIL_CLIENT_ID,
                                    clientSecret:
                                        process.env.GMAIL_CLIENT_SECRET,
                                    refreshToken:
                                        process.env.GMAIL_REFRESH_TOKEN,
                                    accessToken: accessToken
                                }
                            });

                            const mailOptions = {
                                from: 'Collins Institute Support <Support@CollinsInstitute.org>',
                                to: email,
                                subject: 'Password Reset',
                                text: `Visit the following link to reset your password: https://parrhesia.io/reset-password/${token}. It will expire in one hour.`,
                                //text: `Visit the following link to reset your password: http://localhost:3000/reset-password/${token}. It will expire in one hour.`,
                                html: `
       <!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title></title>
    <style type="text/css" rel="stylesheet" media="all">
        /* Base ------------------------------ */

        @import url("https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&display=swap");

        body {
            width: 100% !important;
            height: 100%;
            margin: 0;
            -webkit-text-size-adjust: none;
        }

        a {
            color: #a48be6;
        }

        a img {
            border: none;
        }

        td {
            word-break: break-word;
        }

        .preheader {
            display: none !important;
            visibility: hidden;
            mso-hide: all;
            font-size: 1px;
            line-height: 1px;
            max-height: 0;
            max-width: 0;
            opacity: 0;
            overflow: hidden;
        }

        /* Type ------------------------------ */

        body,
        td,
        th {
            font-family: "Nunito Sans", Helvetica, Arial, sans-serif;
        }

        h1 {
            margin-top: 0;
            color: #a48be6;
            font-size: 22px;
            font-weight: bold;
            text-align: left;
        }

        h2 {
            margin-top: 0;
            color: #333333;
            font-size: 16px;
            font-weight: bold;
            text-align: left;
        }

        h3 {
            margin-top: 0;
            color: #333333;
            font-size: 14px;
            font-weight: bold;
            text-align: left;
        }

        td,
        th {
            font-size: 16px;
        }

        p,
        ul,
        ol,
        blockquote {
            margin: .4em 0 1.1875em;
            font-size: 16px;
            line-height: 1.625;
        }

        p.sub {
            font-size: 13px;
        }

        /* Utilities ------------------------------ */

        .align-right {
            text-align: right;
        }

        .align-left {
            text-align: left;
        }

        .align-center {
            text-align: center;
        }

        .u-margin-bottom-none {
            margin-bottom: 0;
        }

        /* Buttons ------------------------------ */

        .button {
            display: inline-block;
            color: #FFF !important;
            text-decoration: none;
            border-radius: 3px;
            box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16);
            -webkit-text-size-adjust: none;
            box-sizing: border-box;
        }

        .button--green {
            background-color: #7f56d9;
            border-top: 10px solid #7f56d9;
            border-right: 18px solid #7f56d9;
            border-bottom: 10px solid #7f56d9;
            border-left: 18px solid #7f56d9;
            /* background-color: #36c1af;
            border-top: 10px solid #36c1af;
            border-right: 18px solid #36c1af;
            border-bottom: 10px solid #36c1af;
            border-left: 18px solid #36c1af; */
        }

        @media only screen and (max-width: 500px) {
            .button {
                width: 100% !important;
                text-align: center !important;
            }
        }

        /* Attribute list ------------------------------ */

        .attributes {
            margin: 0 0 21px;
        }

        .attributes_content {
            background-color: #F4F4F7;
            padding: 16px;
        }

        .attributes_item {
            padding: 0;
        }

        /* Related Items ------------------------------ */

        .related {
            width: 100%;
            margin: 0;
            padding: 25px 0 0 0;
            -premailer-width: 100%;
            -premailer-cellpadding: 0;
            -premailer-cellspacing: 0;
        }

        .related_item {
            padding: 10px 0;
            color: #CBCCCF;
            font-size: 15px;
            line-height: 18px;
        }

        .related_item-title {
            display: block;
            margin: .5em 0 0;
        }

        .related_item-thumb {
            display: block;
            padding-bottom: 10px;
        }

        .related_heading {
            border-top: 1px solid #CBCCCF;
            text-align: center;
            padding: 25px 0 10px;
        }

        body {
            background-color: #F2F4F6;
            color: #51545E;
        }

        p {
            color: #51545E;
        }

        .email-wrapper {
            width: 100%;
            margin: 0;
            padding: 0;
            -premailer-width: 100%;
            -premailer-cellpadding: 0;
            -premailer-cellspacing: 0;
            background-color: #F2F4F6;
        }

        .email-content {
            width: 100%;
            margin: 0;
            padding: 0;
            -premailer-width: 100%;
            -premailer-cellpadding: 0;
            -premailer-cellspacing: 0;
        }

        /* Masthead ----------------------- */

        .email-masthead {
            padding: 50px 0 0 0;
            text-align: center;
        }

        .email-masthead_logo {
            width: 94px;
        }

        .email-masthead_name {
            font-size: 16px;
            font-weight: bold;
            color: #A8AAAF;
            text-decoration: none;
            text-shadow: 0 1px 0 white;
        }

        /* Body ------------------------------ */

        .email-body {
            width: 100%;
            margin: 0;
            padding: 0;
            -premailer-width: 100%;
            -premailer-cellpadding: 0;
            -premailer-cellspacing: 0;
        }

        .email-body_inner {
            width: 570px;
            margin: 0 auto;
            padding: 0;
            -premailer-width: 570px;
            -premailer-cellpadding: 0;
            -premailer-cellspacing: 0;
            background-color: #FFFFFF;
        }


        .body-action {
            width: 100%;
            margin: 30px auto;
            padding: 0;
            -premailer-width: 100%;
            -premailer-cellpadding: 0;
            -premailer-cellspacing: 0;
            text-align: center;
        }

        .body-sub {
            margin-top: 25px;
            padding-top: 25px;
            border-top: 1px solid #EAEAEC;
        }

        .content-cell {
            padding: 45px;
        }

        /*Media Queries ------------------------------ */

        @media only screen and (max-width: 600px) {

            .email-body_inner,
            .email-footer {
                width: 100% !important;
            }
        }

        @media (prefers-color-scheme: dark) {

            body,
            .email-body,
            .email-body_inner,
            .email-content,
            .email-wrapper,
            .email-masthead,
            .email-footer {
                background-color: #333333 !important;
                color: #FFF !important;
            }

            p,
            ul,
            ol,
            blockquote,
            h2,
            h3,
            span,
            .purchase_item {
                color: #FFF !important;
            }

            .attributes_content,
            .discount {
                background-color: #222 !important;
            }

            .email-masthead_name {
                text-shadow: none !important;
            }
        }

        :root {
            color-scheme: light dark;
            supported-color-schemes: light dark;
        }
    </style>
    <!--[if mso]>
    <style type="text/css">
      .f-fallback  {
        font-family: Arial, sans-serif;
      }
    </style>
  <![endif]-->
</head>

<body>
    <span class="preheader">Use this link to reset your password. The link is only valid for 1 hour.</span>
    <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
            <td align="center">
                <table class="email-content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td class="email-masthead">
                            <a href="https://collinsinstitute.org/" class="f-fallback email-masthead_name">
                                <img width="100" src="https://parrhesia.io/images/logo-red.png">
                            </a>
                        </td>
                    </tr>
                    <!-- Email Body -->
                    <tr>
                        <td class="email-body" width="570" cellpadding="0" cellspacing="0">
                            <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0"
                                role="presentation">
                                <!-- Body content -->
                                <tr>
                                    <td class="content-cell">
                                        <div class="f-fallback">
                                            <h1>Hi ${results[0].username},</h1>
                                            <p>You recently requested to reset your password for your Collins Institute
                                                account. Use the button below to reset it. <strong>This password reset
                                                    is only valid for the next hour.</strong></p>
                                            <!-- Action -->
                                            <table class="body-action" align="center" width="100%" cellpadding="0"
                                                cellspacing="0" role="presentation">
                                                <tr>
                                                    <td align="center">
                                                        <table width="100%" border="0" cellspacing="0" cellpadding="0"
                                                            role="presentation">
                                                            <tr>
                                                                <td align="center">
                                                                    <a href="https://parrhesia.io/reset-password/${token}"
                                                                        class="button button--green"
                                                                        target="_blank">Reset
                                                                        your password</a>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                            <p>Thanks,
                                                <br>The Collins Institute
                                            </p>
                                            <!-- Sub copy -->
                                            <table class="body-sub" role="presentation">
                                                <tr>
                                                    <td>
                                                        <p class="f-fallback sub">If you’re having trouble with the
                                                            button above, copy and paste the URL below into your web
                                                            browser.</p>
                                                        <p class="f-fallback sub">
                                                            https://parrhesia.io/reset-password/${token}</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>
                                `
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
                    res.status(404).json({ status: 'not found' });
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
                    res.status(200).json({
                        status: 'valid',
                        username: results[0].username,
                        firstName: results[0].first_name,
                        lastName: results[0].last_name,
                        email: results[0].email
                    });
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
                // Hash the password.
                bcrypt.hash(
                    password,
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
