const bcrypt = require('bcrypt');

const definedErrors = require('../errors');

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to generate hash given data to be hashed and salt rounds to be used.
 * Brcypt's hash method is being used right now to do this
 * @param {string} data - data to be hashed
 * @param {number} saltRounds - salt rounds to be used to hash generation
 * @returns {Promise} - Bcrypt's hash function default promise
 * @throws none
 * @todo none
 * 
**/
exports.generateHash = (data, saltRounds) => {
    return bcrypt.hash(data, saltRounds);
}