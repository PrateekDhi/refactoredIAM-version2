/**
 *
 * file - mysql.js - The file that is used handle mysql database connection
 *
 * @author     Prateek Shukla
 * @version    0.1.0
 * @created    10/11/2021
 * @copyright  Dhi Technologies
 * @license    For creating a mysql connection pool
 *
 * @description - All logging related functionalities are handled in this file
 * @returns {Promise} - Promise object represents pool of connection according to specifications provided
 * @throws Database server error
 * @todo none
 *
 * 10/11/2021 - PS - Created
 * 
**/

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