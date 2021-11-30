const cn = require('../utils/common');
const definedErrors = require('../errors');
const User = require('../models/User');

exports.findUserByEmailAddress = (email) => {
    return new Promise((resolve, reject) => {
        User.findByEmail(email)
        .then(([rows,fields]) => {
            let returnValue = {};
            if(rows.length == 1){
                returnValue.present = true;
                returnValue.data = rows[0]
                return resolve(returnValue);
            }else if(rows.length == 0){
                returnValue.present = false;
                return resolve(returnValue);
            }
            throw new Error("Duplicate entries found for given email - ", email)
            // caughtError = new definedErrors.InternalServerError();
            // caughtError.setAdditionalDetails("Duplicate entries found for given email - ", email);
            // return reject(caughtError);
            // caughtError = error.InternalServerError();
            // return reject("Duplicate entries found for given email - ", email);
        })
        .catch(error => {
            if(error instanceof ApplicationError) return reject(error);
            let caughtError;
            if(error.sqlMessage){
                caughtError = new definedErrors.DatabaseServerError();
                caughtError.setAdditionalDetails(`Query that failed - ${error.sql}, Error number - ${error.errno}, Error code - ${error.code}`);
                return reject(caughtError);
            //   console.error('Query that failed - ', error.sql, 'Error number - ',error.errno, 'Error code - ',error.code);
            //   error.message = "Database server error";
            }
            caughtError = new definedErrors.InternalServerError();
            caughtError.setAdditionalDetails(error);
            return reject(caughtError);
        });
    })
}

exports.findUserByUsername = (username) => {
    return new Promise((resolve, reject) => {
        User.findByUsername(username)
        .then(([rows,fields]) => {
            let returnValue = {};
            if(rows.length == 1){
                returnValue.present = true;
                returnValue.data = rows[0]
                return resolve(returnValue);
            }else if(rows.length == 0){
                returnValue.present = false;
                return resolve(returnValue);
            }
            throw new Error("Duplicate entries found for given username - "+username)
            // const caughtError = new definedErrors.InternalServerError();
            // caughtError.setAdditionalDetails("Duplicate entries found for given username - "+username);
            // return reject(caughtError);
            // return reject("Duplicate entries found for given email - ", email);
        })
        .catch(error => {
            if(error instanceof ApplicationError) return reject(error);
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
            // return reject(error);
        });
    })
}

exports.findUserEmailByUsername = (username) => {
    return new Promise((resolve, reject) => {
        User.findEmailByUsername(username)
        .then(([rows,fields]) => {
            let returnValue = {};
            if(rows.length == 1){
                returnValue.present = true;
                returnValue.data = rows[0];
                return resolve(returnValue);
            }else if(rows.length == 0){
                returnValue.present = false;
                return resolve(returnValue);
            }
            throw new Error("Duplicate entries found for given username - ", username)
            // return reject("Duplicate entries found for given username - ", username);
        })
        .catch(error => {
            if(error instanceof ApplicationError) return reject(error);
            if(error.sqlMessage){
                const caughtError = new definedErrors.DatabaseServerError();
                caughtError.setAdditionalDetails(`Query that failed - ${error.sql}, Error number - ${error.errno}, Error code - ${error.code}`);
                return reject(caughtError);
            //   console.error('Query that failed - ', error.sql, 'Error number - ',error.errno, 'Error code - ',error.code);
            //   error.message = "Database server error";
            }
            const caughtError = new definedErrors.InternalServerError();
            caughtError.setAdditionalDetails(error);
            return reject(caughtError);
            // return reject(error);
        });
    })
}

const generateUserId = () => cn.asyncGenerateRandomId(8).then((tempId) => tempId);

exports.insertNewUser = (firstName, middleName, lastName, email, username, password, countryCode, phoneNumber, dateOfBirth, gender, phoneNumberVerficationStatus, usingDefaultUsername) => {
    return new Promise((resolve, reject) => {
        let userId;
  
        generateUserId()
        .then(id => {
            userId = id;
            const user = new User(userId, firstName, middleName, lastName, email, username, password, countryCode, phoneNumber, dateOfBirth, gender, phoneNumberVerficationStatus, usingDefaultUsername, Date.now(), Date.now());
            return user.save();
        })
        .then(([rows,fields]) => {
            if(rows.affectedRows != 1) throw new Error("No rows affected while inserting user");
            else return resolve(userId);
        })
        .catch(error => {
            if(error instanceof ApplicationError) return reject(error);
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
        });
    })
}