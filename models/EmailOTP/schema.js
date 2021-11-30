const Joi = require('joi');

module.exports = Joi.object({
    _id: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    otp: Joi.string()
        .alphanum()
        .min(3)
        .max(6)
        .required(),
    userId: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    type: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    expiresAt: Joi.required(),
    service: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    attemptNumber: Joi.required(),

})