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
    middleName: Joi.string()
        .allow(null),
    lastName: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
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
    dateOfBirth: Joi.string()
        .allow(null),
    gender: Joi.string()
        .allow(null),
    phoneNumberVerificationStatus: Joi.number()
        .required(),
    usingDefaultUsername: Joi.number()
        .required(),
    creationTime: Joi.number()
        .required(),
    updationTime: Joi.number()
        .required()
})