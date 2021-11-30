const bcrypt = require('bcrypt');

const definedErrors = require('../errors');

exports.generateHash = (data, saltRounds) => {
    return bcrypt.hash(data, saltRounds);
}