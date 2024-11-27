const nodemailer = require("nodemailer");
// The account is Gmail, so need to authenticate (OAuth)
const { google } = require('googleapis');
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

function snakeToTileCase(string) {
    const result = string.replace(/^[-_]*(.)/, (_, c) => c.toUpperCase()) // Initial char (after -/_)
        .replace(/[-_]+(.)/g, (_, c) => ' ' + c.toUpperCase()) // First char after each -/_
    return result

}


function prepareHTMLstring(newSkillData) {
    // Raw test html to send to client account 
    const emailHTMLcontent = `<!DOCTYPE html
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
                margin-top: 20px;
                padding: 45px;
            }

            .content-div {
                display: flex;
                flex-direction: column;
            }

            .skill-detail-table {
                margin-bottom: 25px;
            }

            .skill-data-content {
                color: #334155;
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

    </head>

    <body>
        <span class="preheader">New skill need approve notification</span>
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
                                <table class="email-body_inner" align="center" width="570" cellpadding="0"
                                    cellspacing="0" role="presentation">
                                    <!-- Body content -->
                                    <tr>
                                        <td class="content-cell">
                                            <div class="f-fallback">
                                                <h1>Hi Collins</h1>
                                                <p>A user have add a new skill. <strong>Check yours todo page to see
                                                        details.</strong></p>
                                                <!-- Action -->
                                                <table class="skill-detail-table" width="100%" border="0"
                                                    cellspacing="0" cellpadding="0" role="presentation">
                                                    <tr>
                                                        <td>
                                                            Skill name:
                                                        </td>
                                                        <td class="skill-data-content">
                                                            ${newSkillData.name}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            Level:
                                                        </td>
                                                        <td class="skill-data-content">
                                                            ${snakeToTileCase(newSkillData.level)}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            Submit by user:
                                                        </td>
                                                        <td class="skill-data-content">
                                                            ${newSkillData.userName}
                                                        </td>
                                                    </tr>
                                                </table>
                                                <table class="body-action" align="center" width="100%" cellpadding="0"
                                                    cellspacing="0" role="presentation">
                                                    <tr>
                                                        <td align="center">
                                                            <table width="100%" border="0" cellspacing="0"
                                                                cellpadding="0" role="presentation">

                                                                <tr>
                                                                    <td align="center">
                                                                        <a href="https://parrhesia.io/todo?nav=newSkillsList"
                                                                            class="button button--green"
                                                                            target="_blank">Go To Todo Page</a>
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
                                                            <p class="f-fallback sub">Please noted that you will
                                                                redirect to login page if you are not logged in .</p>
                                                            <p class="f-fallback sub">
                                                                https://parrhesia.io/</p>
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

</html>`
    return emailHTMLcontent
}

// async..await is not allowed in global scope, must use a wrapper
async function sendNewSkillNotificationMail(newSkillData) {


    const accessToken =
        await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.NOTIFICATION_GMAIL_SENDER,
            clientId: process.env.GMAIL_CLIENT_ID,
            clientSecret:
                process.env.GMAIL_CLIENT_SECRET,
            refreshToken:
                process.env.GMAIL_REFRESH_TOKEN,
            accessToken: accessToken
        }
    });

    const mailOptions = {
        from: 'Collins Institute Support <Support@CollinsInstitute.org>', // sender address
        to: process.env.NOTIFICATION_GMAIL_RECEIVER, // list of receivers
        subject: 'New skill approval request', // Subject line
        text: "There are a new skill being add to the site and need yours approval", // plain text body
        html: prepareHTMLstring(newSkillData), // html body
    }

    // send mail with defined transport object
    await transport.sendMail(mailOptions)

}





module.exports = { sendNewSkillNotificationMail }