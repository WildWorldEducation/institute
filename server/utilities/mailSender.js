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



// async..await is not allowed in global scope, must use a wrapper
async function sendMail() {
    try {
        const accessToken =
            await oAuth2Client.getAccessToken();
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.COLLINS_GMAIL_ADDRESS,
                clientId: process.env.GMAIL_CLIENT_ID,
                clientSecret:
                    process.env.GMAIL_CLIENT_SECRET,
                refreshToken:
                    process.env.GMAIL_REFRESH_TOKEN,
                accessToken: accessToken
            }
        });

        const mailOptions = {
            from: '"Taan" <1220taan@gmail.com>', // sender address
            to: 'tannguyen1220@gmail.com', // list of receivers
            subject: "trai dau ne ✧˖°ʚ🍓ɞ♡", // Subject line
            text: "thay trai dau ", // plain text body
            html: "<b>./づ~ 🍓</b>", // html body
        }

        // send mail with defined transport object
        const info = await transport.sendMail(
            mailOptions
        );

        console.log("Message sent: %s", info.messageId);
        console.log('message info')
        console.log(info)
        // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
    } catch (error) {
        console.error(error)
    }

}

module.exports = { sendMail }