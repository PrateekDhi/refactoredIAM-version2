const nJwt = require('njwt');

const cn = require('../utils/common');
const error = require('../errors');

exports.create = (claims, key, algorithm) => nJwt.create(claims, key, algorithm);