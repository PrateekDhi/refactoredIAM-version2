const config = require('../../config');
const mysql = require('mysql2');

const pool = mysql.createPool({
    connectionLimit : config.app_db.connectionLimit || 100,
    host     : config.app_db.host || "localhost",
    user     : config.app_db.user || "root",
    password : config.app_db.password || "",
    database : config.app_db.database || "iam-v3",
    waitForConnections : config.waitForConnections || true,
    queueLimit : config.app_db.queueLimit || 1000
});

module.exports = pool.promise();