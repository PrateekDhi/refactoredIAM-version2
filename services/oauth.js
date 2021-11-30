const cn = require('../utils/common');
const error = require('../errors');

const AccessToken = require('../models/AccessToken');
const RefreshToken = require('../models/RefreshToken');
const AuthorizationCode = require('../models/AuthorizationCode');

exports.insertNewAccessToken = (token,userId,clientId,accessTokenExpiresAt,scope) => {    
    return new Promise((resolve, reject) => {
        const tokenId = generateTokenEntryId();
        const accessToken = new AccessToken(tokenId, token, userId, clientId, accessTokenExpiresAt, scope);
  
        accessToken.save()
        .then(([rows,fields]) => {
            // console.log(rows.affectedRows, fields);
            if(rows.affectedRows != 1) return reject("No rows affected while inserting access token");
            else return resolve(tokenId);
        })
        .catch(error => {
          console.log(error)
          if(error.sqlMessage){
            console.error('Query that failed - ', error.sql, 'Error number - ',error.errno, 'Error code - ',error.code);
            error.message = "Database server error";
          }
          return reject(error);
        });
    })
}

exports.insertNewRefreshToken = (token,userId,clientId,accessTokenExpiresAt,accessTokenId) => {    
    return new Promise((resolve, reject) => {
        const tokenId = generateTokenEntryId();
        const refreshToken = new RefreshToken(tokenId, token, userId, clientId, accessTokenExpiresAt, accessTokenId);
  
        refreshToken.save()
        .then(([rows,fields]) => {
            // console.log(rows.affectedRows, fields);
            if(rows.affectedRows != 1) return reject("No rows affected while inserting refresh token");
            else return resolve(tokenId);
        })
        .catch(error => {
          console.log(error)
          if(error.sqlMessage){
            console.error('Query that failed - ', error.sql, 'Error number - ',error.errno, 'Error code - ',error.code);
            error.message = "Database server error";
          }
          return reject(error);
        });
    })
}

const generateTokenEntryId = () => cn.generateRandomString(8);