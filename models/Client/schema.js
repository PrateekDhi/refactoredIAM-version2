const Joi = require('joi');

module.exports = Joi.object({
    id: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    clientType: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .valid('firstParty', 'thirdParty')
        .required(),
    clientName: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    clientSecret: Joi.string()
        .alphanum()
        .min(3)
        .max(100)
        .required(),
    redirectUri: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    grantType: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    accessTokenLifetime: Joi.number()
        .required(),
    refreshTokenLifetime: Joi.number()
        .required(),
    creationTime: Joi.number()
        .required(),
    updationTime: Joi.number()
        .required()
})