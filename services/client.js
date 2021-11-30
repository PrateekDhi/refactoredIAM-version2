const cn = require('../utils/common');
const Client = require('../models/Client');
const error = require('../errors');

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
            return reject("Duplicate entries found for given client id - ", id);
        })
        .catch(error => {
            if(error.sqlMessage){
              console.error('Query that failed - ', error.sql, 'Error number - ',error.errno, 'Error code - ',error.code);
              error.message = "Database server error";
            }
            return reject(error);
        });
    })
}

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
            return reject("Duplicate entries found for given client id - ", id);
        })
        .catch(error => {
            if(error.sqlMessage){
              console.error('Query that failed - ', error.sql, 'Error number - ',error.errno, 'Error code - ',error.code);
              error.message = "Database server error";
            }
            return reject(error);
        });
    })
}

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
            return reject("Duplicate entries found for given client id - ", id);
        })
        .catch(error => {
            if(error.sqlMessage){
              console.error('Query that failed - ', error.sql, 'Error number - ',error.errno, 'Error code - ',error.code);
              error.message = "Database server error";
            }
            return reject(error);
        });
    })
}
