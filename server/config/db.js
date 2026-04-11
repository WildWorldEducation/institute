require('dotenv').config();

/*------------------------------------------
--------------------------------------------
Database Connection
--------------------------------------------
--------------------------------------------*/
const mysql = require('mysql');

// Use a pool instead of a single connection so that dropped/timed-out
// connections are automatically replaced. A single createConnection() call
// will silently die after MySQL's wait_timeout (default 8 h) and then
// every subsequent query will throw PROTOCOL_CONNECTION_LOST, crashing the
// process.
const connection = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    timezone: 'utc',
    connectionLimit: 10,
    waitForConnections: true,
});

/*------------------------------------------
--------------------------------------------
Shows Mysql Connect
--------------------------------------------
--------------------------------------------*/

connection.getConnection((err, conn) => {
    if (err) {
        console.error('Error connecting to MariaDB:', err.stack);
        return;
    }
    console.log('MariaDB connected...');
    conn.release();
});
module.exports = connection;
