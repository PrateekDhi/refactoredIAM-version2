const cn = require('../utils/common');
const Client = require('../models/Client');
const definedErrors = require('../errors');
const ApplicationError = definedErrors.ApplicationError;

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to get a client's secret
 * @param {string} id - Client's id
 * @returns {Promise} - Promise object represents either javascript object {present: false} if entity is not present or 
 * javascript object {present: true, data: <Data that was requested from this function>} if entity is present
 * @throws Database server error, Internal server error
 * @todo none
 * 
**/
exports.getClientSecret = (id) => {
    return new Promise((resolve, reject) => {
        Client.findSecretById(id)
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
            throw new Error("Duplicate entries found for given client id - ", id);
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
        });
    })
}

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to get a client's complete details
 * @param {string} id - Client's id
 * @returns {Promise} - Promise object represents either javascript object {present: false} if entity is not present or 
 * javascript object {present: true, data: <Data that was requested from this function>} if entity is present
 * @throws Database server error, Internal server error
 * @todo none
 * 
**/
exports.getClient = (id) => {
    return new Promise((resolve, reject) => {
        Client.findById(id)
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
            throw new Error("Duplicate entries found for given client id - ", id);
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
        });
    })
}

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to get grant types allowed for the client
 * @param {string} id - Client's id
 * @returns {Promise} - Promise object represents either javascript object {present: false} if entity is not present or 
 * javascript object {present: true, data: <Data that was requested from this function>} if entity is present
 * @throws Database server error, Internal server error
 * @todo none
 * 
**/
exports.getClientGrantType = (id) => {
    return new Promise((resolve, reject) => {
        Client.findGrantTypeById(id)
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
            throw new Error("Duplicate entries found for given client id - ", id);
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
        });
    })
}

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to check a client's existence
 * @param {string} id - Client's id
 * @returns {Promise} - true if client exists, false otherwise
 * @throws Database server error, Internal server error
 * @todo none
 * 
**/
exports.checkClientExistenceById = (id) => {
    return new Promise((resolve, reject) => {
        Client.findCountrForId(id)
        .then(([rows,fields]) => {
          const count = rows[0].count;
          if(count == 1) return resolve(true);
          else if(count == 0) return resolve(false);
          return reject ("Duplicate entries found for client id -", id)
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
