const Joi = require('joi');

module.exports = Joi.object({
    _id: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    firstName: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    lastName: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
    password: Joi.string()
        .required(),
    countryCode: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    phoneNumber: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    client_id: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    creationTime: Joi.number()
        .required(),
    updationTime: Joi.number()
        .required(),
})