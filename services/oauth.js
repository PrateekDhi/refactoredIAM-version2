const cn = require('../utils/common');
const definedErrors = require('../errors');

const AccessToken = require('../models/AccessToken');
const RefreshToken = require('../models/RefreshToken');
const AuthorizationCode = require('../models/AuthorizationCode');

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to insert new access token to database.
 * @param {string} token - Access token
 * @param {string} userId - Id of the user for whom the token is generated
 * @param {string} clientId - Id of the client application who is handling the user
 * @param {string} accessTokenExpiresAt - Expiration time in general date time format as per oauth2-server npm package model
 * @param {string} scope - Scope assigned for this token
 * @returns {String} - A string representing the token entry id of the inserted token
 * @throws Database server error, Internal server error
 * @todo none
 * 
**/
exports.insertNewAccessToken = (token,userId,clientId,accessTokenExpiresAt,scope) => {    
    return new Promise((resolve, reject) => {
        const tokenId = generateTokenEntryId();
        const accessToken = new AccessToken(tokenId, token, userId, clientId, accessTokenExpiresAt, scope);
  
        accessToken.save()
        .then(([rows,fields]) => {
            // console.log(rows.affectedRows, fields);
            if(rows.affectedRows != 1) throw new Error("No rows affected while inserting access token");
            else return resolve(tokenId);
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
 * @description The function is used to insert new refresh token to database.
 * @param {string} token - Access token
 * @param {string} userId - Id of the user for whom the token is generated
 * @param {string} clientId - Id of the client application who is handling the user
 * @param {string} accessTokenExpiresAt - Expiration time in general date time format as per oauth2-server npm package model
 * @param {string} scope - Scope assigned for this token
 * @returns {String} - A string representing the token entry id of the inserted token
 * @throws Database server error, Internal server error
 * @todo none
 * 
**/
exports.insertNewRefreshToken = (token,userId,clientId,accessTokenExpiresAt,accessTokenId) => {    
    return new Promise((resolve, reject) => {
        const tokenId = generateTokenEntryId();
        const refreshToken = new RefreshToken(tokenId, token, userId, clientId, accessTokenExpiresAt, accessTokenId);
  
        refreshToken.save()
        .then(([rows,fields]) => {
            // console.log(rows.affectedRows, fields);
            if(rows.affectedRows != 1) throw new Error("No rows affected while inserting refresh token");
            else return resolve(tokenId);
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
 * @description The function is used to generate an entry id for database entry of tokens.
 * @param - none
 * @returns {String} - A string representing a usable token entry id for token
 * @throws none
 * @todo none
 * 
**/
const generateTokenEntryId = () => cn.generateRandomString(8);