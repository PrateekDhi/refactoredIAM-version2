const cn = require('../utils/common');
const definedErrors = require('../errors');

const User = require('../models/User');

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to generate a new unique username for a user, 
 * the function recursively calls itself untill a unique username is found, then returns the unique username
 * @param - none
 * @returns {String} - A string representing the usable username
 * @throws Database server error, Internal server error
 * @todo testing
 * 
**/
exports.generateNewUsername = () => {
    const randomUsername = cn.generateRandomNumberString(12);
    return new Promise((resolve, reject) => {
        User.findByUsername(randomUsername)
        .then(([rows,fields]) => {
            if(rows.length == 1){
                return generateNewUsername();
                // generateUniqueDefaultUsername().then(function(uniqueUsername){   //Function recursively calls itself untill it gets a username which is unique
                //     resolve(uniqueUsername)
                // }).catch(function(err){
                //     throw new Error(err)
                // });
            }else if(rows.length == 0) return resolve(randomUsername);
            throw new Error("Duplicate entries found for given username - ", randomUsername);
        })
        .then(uniqueUsername => resolve(uniqueUsername))
        .catch(error => {
            if(error instanceof ApplicationError) return reject(error);
            let caughtError;
            if(error.sqlMessage){
                caughtError = new definedErrors.DatabaseServerError();
                caughtError.setAdditionalDetails(`Query that failed - ${error.sql}, Error number - ${error.errno}, Error code - ${error.code}`);
                return reject(caughtError);
                // console.error('Query that failed - ', error.sql, 'Error number - ',error.errno, 'Error code - ',error.code);
                // error.message = "Database server error";
            }
            caughtError = new definedErrors.InternalServerError();
            caughtError.setAdditionalDetails(error);
            return reject(caughtError);
        })
    })
}

exports.generateNewUserId = () => {
    
}