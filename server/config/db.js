require('dotenv').config();

/*------------------------------------------
--------------------------------------------
Database Connection
--------------------------------------------
--------------------------------------------*/
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

/*------------------------------------------
--------------------------------------------
Shows Mysql Connect
--------------------------------------------
--------------------------------------------*/
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MariaDB:', err.stack);
        return;
    }
    console.log('MariaDB connected...');
});
module.exports = connection;
