const cn = require('../utils/common');
const error = require('../errors');
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
            return reject("Duplicate entries found for given email - ", email);
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
            return reject("Duplicate entries found for given email - ", email);
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
            return reject("Duplicate entries found for given username - ", username);
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
            if(rows.affectedRows != 1) return reject("No rows affected while inserting user");
            else return resolve(userId);
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