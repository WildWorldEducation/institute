/**
 * Shared express-session middleware (RFAB_INSTITUTE_BRIDGE.md section 9).
 *
 * One instance is used by BOTH the Express app and Socket.IO
 * (io.engine.use(sessionMiddleware)) so socket connections are authenticated
 * by the same cookie session as HTTP requests.
 *
 * - Secret comes from env SESSION_SECRET (the app refuses to boot in
 *   production without it).
 * - Sessions are persisted in MariaDB via express-mysql-session (reuses the
 *   app's existing connection pool; the `sessions` table is auto-created),
 *   replacing the leaky in-memory store.
 */
require('dotenv').config();
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const conn = require('./db');

const oneDay = 1000 * 60 * 60 * 24;

let secret = process.env.SESSION_SECRET;
if (!secret) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error(
            'SESSION_SECRET is required in production. Set it in the environment.'
        );
    }
    console.warn(
        '[session] SESSION_SECRET is not set - using an insecure development fallback.'
    );
    secret = 'dev-only-insecure-session-secret';
}

// Reuse the existing mysql pool; express-mysql-session creates the `sessions`
// table on first run.
const store = new MySQLStore({ createDatabaseTable: true }, conn);

const sessionMiddleware = session({
    secret,
    store,
    resave: false,
    // Do not persist empty guest sessions (also avoids a store write per
    // anonymous/bot request).
    saveUninitialized: false,
    cookie: {
        maxAge: oneDay,
        httpOnly: true,
        sameSite: 'lax',
        // 'auto': secure cookie when the request is HTTPS (works locally over
        // HTTP and in production behind the proxy - requires trust proxy).
        secure: 'auto'
    }
});

module.exports = { sessionMiddleware };
