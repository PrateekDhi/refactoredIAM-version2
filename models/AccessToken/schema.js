const Joi = require('joi');

module.exports = Joi.object({
    _id: Joi.string()
        .alphanum()
        .min(3)
        .max(100)
        .required(),
    access_token: Joi.string()
        .min(3)
        .max(500)
        .required(),
    user: Joi.string()
        .alphanum()
        .min(3)
        .max(30),
    clientId: Joi.string()
        .alphanum()
        .min(3)
        .max(100),
    expiresAt: Joi.required(),
    scope: Joi.string()
        .allow(null)
})