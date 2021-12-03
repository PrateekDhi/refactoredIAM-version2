const nJwt = require('njwt');

const cn = require('../utils/common');
const definedErrors = require('../errors');

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to create a new JWT.
 * @param {string} claims - OTP entry's id
 * @param {string} key - OTP that was sent
 * @param {string} algorithm - OTP that was sent
 * @returns {String} - A string representing generated JWT
 * @throws Database server error, Internal server error
 * @todo testing
 * 
**/
exports.create = (claims, key, algorithm) => nJwt.create(claims, key, algorithm);
