const cn = require('../utils/common');
const definedErrors = require('../errors');
const TemporaryUser = require('../models/TemporaryUser');
// const { Console } = require('winston/lib/winston/transports');

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to get a temporary user's complete details given id
 * @param {string} id - Temporary user's db id
 * @returns {Promise} - Promise object represents either javascript object {present: false} if entity is not present or 
 * javascript object {present: true, data: <Data that was requested from this function>} if entity is present
 * @throws Database server error, Internal server error
 * @todo none
 * 
**/
exports.findTemporaryUserById = (id) => {
  return new Promise((resolve, reject) => {
    TemporaryUser.findById(id)
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
        return reject("Duplicate entries found for given temporary user id - ", id);
    })
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
        // if(error.sqlMessage){
        //   console.error('Query that failed - ', error.sql, 'Error number - ',error.errno, 'Error code - ',error.code);
        //   error.message = "Database server error";
        // }
        // return reject(error);
    });
  })
}

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to generate a new temporary user id
 * @param - none
 * @returns {Promise} - Pending promise that will be give the id
 * @throws none
 * @todo none
 * 
**/
const generateTemporaryUserId = () => cn.asyncGenerateRandomId(6);

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to insert a new temporary user
 * @param {string} firstName - First name given by user
 * @param {string} lastName - Last name given by user
 * @param {string} email - Email given by user
 * @param {string} password - Password given by user
 * @param {string} countryCode - Country code for user's phone number
 * @param {string} phoneNumber - Phone number given by user
 * @param {string} client_id - Client id of the client application which initiated this process
 * @param {string} service - The service associated with this process(IAM, Developer, Device management)
 * @returns {Promise} - Promise object represents a string which is the inserted id of the temporary user
 * @throws Database server error, Internal server error
 * @todo none
 * 
**/
exports.insertNewTemporaryUser = (firstName, lastName, email, password, countryCode, phoneNumber, client_id, service) => {
    return new Promise((resolve, reject) => {
      let temporaryUserId;

      generateTemporaryUserId()
      .then(id => {
          temporaryUserId = id;
          const temporaryUser = new TemporaryUser(temporaryUserId, firstName, lastName, email, password, countryCode, phoneNumber, client_id, Date.now(), Date.now());
          return temporaryUser.save();
      })
      .then(([rows,fields]) => {
          if(rows.affectedRows != 1) throw new Error("No rows affected while inserting temporary user");
          else return resolve(temporaryUserId);
      })
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
        // if(error.sqlMessage){
        //   console.error('Query that failed - ', error.sql, 'Error number - ',error.errno, 'Error code - ',error.code);
        //   error.message = "Database server error";
        // }
        // return reject(error);
      });
    })
}

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to check a temporary user's existence
 * @param {string} id - Temporary user's id
 * @returns {Promise} - true if temporary user exists, false otherwise
 * @throws Database server error, Internal server error
 * @todo none
 * 
**/
exports.checkTemporaryUserExistence = (id) => {
  return new Promise((resolve, reject) => {
    TemporaryUser.findCountrForId(id)
    .then(([rows,fields]) => {
      const count = rows[0].count;
      if(count == 1) return resolve(true);
      else if(count == 0) return resolve(false);
      return reject ("Duplicate entries found for temporary user id -", id)
    })
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
      // if(error.sqlMessage){
      //   console.error('Query that failed - ', error.sql, 'Error number - ',error.errno, 'Error code - ',error.code);
      //   error.message = "Database server error";
      // }
      // return reject(error);
    });
  })
}

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to delete temporary user id from database
 * @param {string} id - Temporary user's id
 * @returns {Promise} - Promise object represents boolean true if deleted successfully
 * @throws Database server error, Internal server error
 * @todo none
 * 
**/
exports.deleteTemporaryUserById = (id) => {
  return new Promise((resolve, reject) => {
    TemporaryUser.deleteById(id)
    .then(([rows,fields]) => {
      return resolve(true);
    })
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
      // if(error.sqlMessage){
      //   console.error('Query that failed - ', error.sql, 'Error number - ',error.errno, 'Error code - ',error.code);
      //   error.message = "Database server error";
      // }
      // return reject(error);
    });
  })
}