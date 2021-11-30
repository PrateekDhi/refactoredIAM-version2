const bcrypt = require('bcrypt');

const error = require('../errors');

exports.generateHash = (data, saltRounds) => {
    return bcrypt.hash(data, saltRounds);
}