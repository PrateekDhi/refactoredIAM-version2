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
let pool;
let db;

const initiatePool = exports.initiateMySqlPool = () => {
    return new Promise((resolve, reject) => {
        pool = mysql.createPool({
            connectionLimit : config.app_db.connectionLimit || 100,
            host     : config.app_db.host || "localhost",
            user     : config.app_db.user || "root",
            password : config.app_db.password || "",
            database : config.app_db.database || "iam-v3",
            waitForConnections : config.app_db.waitForConnections || true,
            queueLimit : config.app_db.queueLimit || 1000
        });

        pool.getConnection((error, con) =>
        {
            // console.log(error);
            // console.log(con);
            if(error){
                return reject({"status":"failed", "error":`MySQL error. ${error}`});
            }
            try
            {
                if (con)
                {
                    con
                    .execute('SELECT 1', (err, results, fields) => {
                        con.release();
                        db = pool.promise();
                        if(err) return reject({"status":"failed", "error":`MySQL error. ${err}`});
                        return resolve({"status":"success", "message":"MySQL connected.", "con":"Connection done"});
                    })
                }
            }
            catch (err)
            {
                return reject({"status":"failed", "error":`MySQL error. ${err}`});
            }
            // return resolve({"status":"failed", "error":"Error connecting to MySQL."});
        });
    });
}

exports.executeQuery = (query, params) => {
    if(db){
        if(params) return db.execute(query,params);
        return db.execute(query)
    }
    // }else{
    //     initiatePool.then(response => {
    //         if(params) return db.execute(query,params);
    //         return db.execute(query)
    //     }).catch(err => Promise.reject(`Could not connect to Mysql database, error - ${err}`));
    // }
}



// const db = () => {
//     // console.log(pool)
//     if(pool){
//         return pool.promise();
//     }
//     throw 'No pool present'
// }

// exports.initiateMySqlPool = initiatePool;
// exports.db = db;

// module.exports = pool.promise();