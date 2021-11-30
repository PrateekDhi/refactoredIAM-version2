const cn = require('../utils/common');
const error = require('../errors');

const User = require('../models/User');

exports.generateNewUsername = () => {
    const randomUsername = cn.generateRandomNumberString(12);
    return new Promise((resolve, reject) => {
        User.findByUsername(randomUsername)
        .then(([rows,fields]) => {
            if(rows.length == 1){
                return generateUniqueDefaultUsername();
                // generateUniqueDefaultUsername().then(function(uniqueUsername){   //Function recursively calls itself untill it gets a username which is unique
                //     resolve(uniqueUsername)
                // }).catch(function(err){
                //     throw new Error(err)
                // });
            }else if(rows.length == 0) return resolve(randomUsername);
            throw new Error("Duplicate entries found for given email - ", email);
        })
        .then(uniqueUsername => resolve(uniqueUsername))
        .catch(error => {
            if(error.sqlMessage){
                const caughtError = new definedErrors.DatabaseServerError();
                caughtError.setAdditionalDetails(`Query that failed - ${error.sql}, Error number - ${error.errno}, Error code - ${error.code}`);
                return reject(caughtError);
                // console.error('Query that failed - ', error.sql, 'Error number - ',error.errno, 'Error code - ',error.code);
                // error.message = "Database server error";
            }
            const caughtError = new definedErrors.InternalServerError();
            caughtError.setAdditionalDetails(error);
            return reject(caughtError);
        })
    })
}

exports.generateNewUserId = () => {
    
}