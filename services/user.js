const cn = require('../utils/common');
const definedErrors = require('../errors');
const User = require('../models/User');

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to get a user's complete details given his email
 * @param {string} email - User's email
 * @returns {Promise} - Promise object represents either javascript object {present: false} if entity is not present or 
 * javascript object {present: true, data: <Data that was requested from this function>} if entity is present
 * @throws Database server error, Internal server error
 * @todo none
 * 
**/
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

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to get a user's complete details given his username
 * @param {string} username - User's username
 * @returns {Promise} - Promise object represents either javascript object {present: false} if entity is not present or 
 * javascript object {present: true, data: <Data that was requested from this function>} if entity is present
 * @throws Database server error, Internal server error
 * @todo none
 * 
**/
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

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to get a user's email given his username
 * @param {string} username - User's username
 * @returns {Promise} - Promise object represents either javascript object {present: false} if entity is not present or 
 * javascript object {present: true, data: <Data that was requested from this function>} if entity is present
 * @throws Database server error, Internal server error
 * @todo none
 * 
**/
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

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to insert a new temporary user
 * @param {string} firstName - First name given by user
 * @param {string} middleName - Middle name given by user
 * @param {string} lastName - Last name given by user
 * @param {string} email - Email given by user
 * @param {string} username - Username given by user
 * @param {string} password - Password given by user
 * @param {string} countryCode - Country code for user's phone number
 * @param {string} phoneNumber - Phone number given by user
 * @param {string} dateOfBirth - String representing Date of birth given by user
 * @param {string} gender - Gender given by user
 * @param {number} phoneNumberVerficationStatus - Phone number verification denotes whether the given phone number is verified or not.
 * 1 denotes verified, while 0 denotes unverified. By default at the time of creation it is always set to 0
 * @param {string} usingDefaultUsername - Using default username denotes whether the username being used right now is default system generated username
 * or user chosen username. 1 denotes user is using system generated username while 0 denotes using chosen username. By default value is always 1 at the time
 * of creation
 * @returns {Promise} - Promise object represents a string which is the inserted id of the user
 * @throws Database server error, Internal server error
 * @todo none
 * 
**/
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

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to check a user's existence by username
 * @param {string} username - User's username
 * @returns {Promise} - true if user exists, false otherwise
 * @throws Database server error, Internal server error
 * @todo none
 * 
**/
exports.checkUserExistenceByUsername = (username) => {
    return new Promise((resolve, reject) => {
        User.findCountForUsername(username)
        .then(([rows,fields]) => {
          const count = rows[0].count;
          if(count == 1) return resolve(true);
          else if(count == 0) return resolve(false);
          return reject ("Duplicate entries found for user's username -", username)
        })
        .catch(error => {
          if(error instanceof ApplicationError) return reject(error);
          let caughtError;
          if(error.sqlMessage){
            caughtError = new definedErrors.DatabaseServerError();
            caughtError.setAdditionalDetails(`Query that failed - ${error.sql}, Error number - ${error.errno}, Error code - ${error.code}`);
            return reject(caughtError);
          }
          caughtError = new definedErrors.InternalServerError();
          caughtError.setAdditionalDetails(error);
          return reject(caughtError);
        });
    })
}

//Local functions

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to generate a new user id
 * @param - none
 * @returns {Promise} - Pending promise that will be give the id
 * @throws none
 * @todo none
 * 
**/
const generateUserId = () => cn.asyncGenerateRandomId(8);