const cn = require('../utils/common');
const error = require('../errors');
const TemporaryUser = require('../models/TemporaryUser');
// const { Console } = require('winston/lib/winston/transports');

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
        if(error.sqlMessage){
          console.error('Query that failed - ', error.sql, 'Error number - ',error.errno, 'Error code - ',error.code);
          error.message = "Database server error";
        }
        return reject(error);
    });
  })
}

const generateTemporaryUserId = () => cn.asyncGenerateRandomId(6).then((tempId) => tempId);

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
          if(rows.affectedRows != 1) return reject("No rows affected while inserting temporary user");
          else return resolve(temporaryUserId);
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
      if(error.sqlMessage){
        console.error('Query that failed - ', error.sql, 'Error number - ',error.errno, 'Error code - ',error.code);
        error.message = "Database server error";
      }
      return reject(error);
    });
  })
}

exports.deleteTemporaryUserById = (id) => {
  return new Promise((resolve, reject) => {
    TemporaryUser.deleteById(id)
    .then(([rows,fields]) => {
      return resolve(true);
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