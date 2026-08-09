/*
 * Shared session middleware.
 *
 * Defined once so both the Express app and the Socket.IO server use the exact
 * same session (that is how socket connections become authenticated — see
 * config/socketConfig.js).
 *
 * Security fixes vs. the old inline config in app.js:
 *  - secret now comes from SESSION_SECRET (no longer hard-coded in source).
 *  - cookie is httpOnly + sameSite=lax, and secure in production.
 *  - saveUninitialized=false so anonymous visitors don't each get a session row.
 */
const session = require('express-session');

const isProd = process.env.NODE_ENV === 'production';
const oneDay = 1000 * 60 * 60 * 24;

// Fail loudly in production if the secret was not provided, rather than
// silently falling back to a guessable default.
const secret = process.env.SESSION_SECRET;
if (!secret) {
    if (isProd) {
        throw new Error(
            'SESSION_SECRET is not set. Refusing to start with an insecure session secret.'
        );
    }
    console.warn(
        '[session] SESSION_SECRET not set — using an insecure development-only default.'
    );
}

const sessionMiddleware = session({
    secret: secret || 'dev-only-insecure-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: oneDay,
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd
    }
});

module.exports = { sessionMiddleware };
