/**
 *
 * file - oauth - index.js - The file that is used to all oauth related services
 *
 * @author     Prateek Shukla
 * @version    0.1.0
 * @created    15/11/2021
 * @copyright  Dhi Technologies
 * @license    For use by Dhi Technologies applications
 *
 * @description - All oauth related services which are used by oauth-server library are handled in this file
 * NOTE - Do not change the name of the functions since they are defined as per oauth-server library reqirements
 *
 * 15/11/2021 - PS - Created
 * 05/12/2021 - PS - Updated
 * 
**/

// const InvalidGrantError = require('oauth2-server/lib/errors/invalid-grant-error');
// const ServerError = require('oauth2-server/lib/errors/server-error');
// const UnauthorizedRequestError = require('oauth2-server/lib/errors/unauthorized-request-error')
// const InvalidClientError = require('oauth2-server/lib/errors/invalid-client-error');
// const InvalidTokenError = require('oauth2-server/lib/errors/invalid-token-error');

const cn = require('../../utils/common');
const config = require('../../config');
const definedErrors = require('../../errors');

//Services
const oauthService = require('../../services/oauth');
const clientService = require('../../services/client');
const jwtService = require('../../services/jwt');
const emailService = require('../../services/emailOtp');
const mobileService = require('../../services/otp')
const userService = require('../../services/user');
const temporaryUserService = require('../../services/temporaryUser');
const generateService = require('../../services/generate');
const internalService = require('../../services/internal');
const bcryptService = require('../../services/bcrypts');

//Models
const TokenClaim = require('../../models/TokenClaim');
const OauthResponseClient = require('../../models/OauthResponseClient');

//Validations
const validations = require('./validate');
// const { Console } = require('winston/lib/winston/transports');

const ApplicationError = definedErrors.ApplicationError;

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to generate a new access token to be used by oauth-server library
 * @param {object} client - Object containing client related data
 * @param {object} user - Object containing user related data
 * @param {object} scope - Object containing scope data
 * @param {requestCallback} callback - The callback that handles the response.
 * @returns {callback} - Callback function call with the generated token, handled by oauth-server library
 * @throws Invalid client credentials, Database server error, Internal server error
 * @todo none
 * 
**/
exports.generateAccessToken = exports.generateRefreshToken = (client, user, scope, callback) => {
    console.log('Generate access token/ Generate refresh token');
    if(client.id && user.id){
        clientService.getClientSecret(client.id)
        .then(result => {
            if(result.present){
                const tokenClaim = new TokenClaim(user.id,client.id,user.services,scope);
                let claims;
                let jwt;
                let token;
                try{
                    claims = tokenClaim.fetch();
                    jwt = jwtService.create(claims,result.data.clientSecret,config.jwt_cryptographic_algorithm);
                    jwt.setExpiration();
        
                    token = jwt.compact();
                    return callback(false,token);
                }catch(error){
                    throw new Error("Error in tokenClaim model - " + error);
                }
            }else throw new Error("Incorrect client id");
        })
        .catch((error) => {
            if(error instanceof ApplicationError) return callback(error);
            let caughtError;
            if(error.hasOwnProperty('sql')){
                caughtError = new definedErrors.DatabaseServerError();
                caughtError.setAdditionalDetails(`Query that failed - ${error.sql}, Error number - ${error.errno}, Error code - ${error.code}`);
                caughtError.setType('fatal');
                return callback(caughtError);
            } else if(error.message == 'Incorrect client id'){
                caughtError = new definedErrors.IncorrectClientId();
                caughtError.setAdditionalDetails(`Incorrect client id sent during generate refresh token, client - ${client}, user - ${user}`);
                return callback(caughtError);
            }
            caughtError = new definedErrors.InternalServerError();
            caughtError.setAdditionalDetails(error);
            return callback(caughtError);
        })
    }else{
        const caughtError = new definedErrors.InternalServerError();
        caughtError.setAdditionalDetails("No id present for client or user in generateRefreshToken");
        return callback(caughtError);
    }
}

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to get client given the clients id and secret
 * @param {string} clientId - Client's id
 * @param {string} clientSecret - Client's secret
 * @param {requestCallback} callback - The callback that handles the response.
 * @returns {callback} - Callback function call with the client's data object, handled by oauth-server library
 * @throws Invalid client credentials, Database server error, Internal server error
 * @todo none
 * 
**/
exports.getClient = (clientId, clientSecret, callback) => {
    console.log('Get Client')
    clientService.getClient(clientId)
    .then(result => {
        if(result.present){
            const redirectUrisArray = [];
            let returnClientModel;
            let returnClientData;
            redirectUrisArray.push(result.data.redirectUri);
            returnClientModel = new OauthResponseClient(result.data._id,result.data.grantType,result.data.accessTokenLifetime,result.data.refreshTokenLifetime,redirectUrisArray,result.data.clientName,result.data.clientType,result.data.clientServices);
            try{
                returnClientData = returnClientModel.fetch();
                return callback(false,returnClientData);
            }catch(error){
                throw new Error("Invalid OauthResponseClient model - " + error);
            }
        }else throw new Error('Incorrect client id')
    })
    .catch(error => {
        console.log(error)
        if(error instanceof ApplicationError) return callback(error);
        let caughtError;
        if(error.hasOwnProperty('sql')){
            caughtError = new definedErrors.DatabaseServerError();
            caughtError.setAdditionalDetails(`Query that failed - ${error.sql}, Error number - ${error.errno}, Error code - ${error.code}`);
            caughtError.setType('fatal');
            return callback(caughtError);
        } else if(error.message == 'Incorrect client id'){
            caughtError = new definedErrors.IncorrectClientId();
            caughtError.setAdditionalDetails(`Incorrect client id sent during getClient, client - ${clientId}`);
            return callback(caughtError);
        }
        caughtError = new definedErrors.InternalServerError();
        caughtError.setAdditionalDetails(error);
        return callback(caughtError);
    })
}

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to check whether the client is authorized to use a particular grant type
 * @param {string} clientId - Client's id
 * @param {string} grantType - Given grant type to check
 * @param {requestCallback} callback - The callback that handles the response.
 * @returns {callback} - Callback function call with BOOLEAN value, true if grant type is allowed for client, false otherwise, handled by oauth-server library
 * @throws Invalid client credentials, Database server error, Internal server error
 * @todo none
 * 
**/
exports.grantTypeAllowed = (clientId, grantType, callback) => {
    console.log('Grant type allowed')
    clientService.getClientGrantType(clientId)
    .then(result => {
        if(result.present){
            if(result.data.grantTypes.includes(grantType)) callback(false,true);
            else callback(false,false);
        }else throw new Error('Incorrect client id')
    })
    .catch(error => {
        if(error instanceof ApplicationError) return callback(error);
        let caughtError;
        if(error.hasOwnProperty('sql')){
            caughtError = new definedErrors.DatabaseServerError();
            caughtError.setAdditionalDetails(`Query that failed - ${error.sql}, Error number - ${error.errno}, Error code - ${error.code}`);
            caughtError.setType('fatal');
            return callback(caughtError);
        } else if(error.message == 'Incorrect client id'){
            caughtError = new definedErrors.IncorrectClientId();
            caughtError.setAdditionalDetails(`Incorrect client id sent during generate refresh token, client - ${client}, user - ${user}`);
            return callback(caughtError);
        }
        caughtError = new definedErrors.InternalServerError();
        caughtError.setAdditionalDetails(error);
        return callback(caughtError);
    })
}

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to get user given, user's credentials. These credentials can either be user's id with otp(email/phone) 
 * or user's id with password. Different cases handles these different scenarios
 * @param {string} username - User's id concatinated with method being used(format - <method-userId>). Methods supported are - 
 * 'email' denoting email otp, 'mobile' denoting mobile phone otp and 'password' denoting user's password
 * @param {string} password - User's email otp/ user's phone otp/ user's password
 * @param {requestCallback} callback - The callback that handles the response.
 * @returns {callback} - Callback function call with the user's data object, handled by oauth-server library
 * @throws Invalid User Id, Invalid Temporary User Id, Gone(OTP expired), Incorrect credentials, Internal server error, Database server error
 * @todo 1) Might need to create separate error for incorrect temporary user id
 *       2) Handle default case in inner switch case
 * 
**/
exports.getUser = (username, password, callback) => {
    console.log('Get user')
    let method;
    let validationResult;
    if (username.indexOf('-') > -1)
    {
        let splitString = username.split('-');
        method = splitString[0];
        username = splitString[1];
    }

    switch(method){
        case 'email':
            validationResult = validations.validateOTP(password);
            if(validationResult.valid){
                emailService.getEmailOTPByUserIdAndOtp(username,password)
                .then(result => {
                    if(result.present){
                        const expiryTime = result.data.expiresAt;
                        const otpId = result.data._id;
                        const currentTime = Date.now();
                        const type = result.data.type;
                        const userId = result.data.userId;
    
                        if(currentTime<expiryTime){
                            switch(type){
                                case 'login':
                                    userService.checkUserExistence(userId)
                                    .then(exists => {
                                        if(exists) return userService.getUserProfileCompletionData(userId)
                                        else throw new Error('Invalid user id');
                                    })
                                    .then(pfcResult => {
                                        callback(false, pfcResult);
                                        return emailService.deleteEmailOTPById(otpId)
                                    })
                                    .then(message => console.log(message))
                                    .catch(error => {
                                       throw new Error(error);
                                    })
                                break;

                                case 'registration':
                                    let firstName;
                                    let lastName;
                                    let email;
                                    let password;
                                    let countryCode;
                                    let phoneNumber;
                                    temporaryUserService.checkTemporaryUserExistence(userId)
                                    .then(exists => {
                                        if(exists) return temporaryUserService.findTemporaryUserById(userId)
                                        else throw new Error('Invalid temporary user id');
                                    })
                                    .then(result => {
                                        if(result.present){
                                            firstName = result.data.firstName;
                                            lastName = result.data.lastName;
                                            email = result.data.email;
                                            password = result.data.password;
                                            countryCode = result.data.countryCode;
                                            phoneNumber = result.data.phoneNumber;
    
                                            return generateService.generateNewUsername();
                                        }else throw new Error('Invalid temporary user id');
                                    })
                                    .then(uniqueUsername => {
                                        // userId = results[1];
                                        username = uniqueUsername;
                                        // 0 for phone number verification status
                                        // 1 for using default username
                                        return userService.insertNewUser(firstName, null, lastName, email, username, password, countryCode, phoneNumber, null, null, 0, 1)
                                    })
                                    .then(result => {
                                        callback(null,{
                                            id: userId,
                                            phoneNumberVerfied: false,
                                            usingDefaultUsername: true,
                                            services: ['iam']
                                        })
                                        return Promise.all([
                                            // internalService.sendInternalRequestToDeviceManagementServer('/userDefaultNotificationSettings', {"userId":userId}),
                                            temporaryUserService.deleteTemporaryUserById(userId),
                                            emailService.deleteEmailOTPById(otpId)
                                        ])
                                    })
                                    .then(results => console.log(results))
                                    .catch(error => {
                                        throw new Error(error);
                                    })
                                break;

                                default:
                            }
                        }else throw new Error('Expired otp received');
                    }else throw new Error('Incorrect email otp received');
                })
                .catch(error => {
                    if(error instanceof ApplicationError) return callback(error);
                    let caughtError;
                    if(error.hasOwnProperty('sql')){
                        caughtError = new definedErrors.DatabaseServerError();
                        caughtError.setAdditionalDetails(`Query that failed - ${error.sql}, Error number - ${error.errno}, Error code - ${error.code}`);
                        caughtError.setType('fatal');
                        return callback(caughtError);
                    } else if(error.message == 'Invalid temporary user id'){
                        caughtError = new definedErrors.UserDoesNotExist();
                        caughtError.setAdditionalDetails(`Credentials sent are - username - ${username}, password - ${password}`);
                        return callback(caughtError);
                    } else if(error.message == 'Invalid user id'){
                        caughtError = new definedErrors.UserDoesNotExist();
                        caughtError.setAdditionalDetails(`Credentials sent are - username - ${username}, password - ${password}`);
                        return callback(caughtError);
                    } else if(error.message == 'Expired otp received') {
                        caughtError = new definedErrors.Gone();
                        caughtError.setMessage('OTP expired');
                        return callback(caughtError);
                    } else if(error.message == 'Incorrect email otp received') {
                        caughtError = new definedErrors.IncorrectCredentials();
                        caughtError.setMessage('Incorrect email otp received');
                        return callback(caughtError);
                    }
                    caughtError = new definedErrors.InternalServerError();
                    caughtError.setAdditionalDetails(error);
                    return callback(caughtError);
                    // console.log(error)
                    // let err;
                    // if(error == 'Invalid user id' || error == 'Invalid temporary user id'){
                    //     err = new ServerError();
                    //     err.message = "User does not exist";
                    //     err.internalCode = 453;
                    //     err.statusCode = 401
                    //     err.name = 'user_does_not_exist'
                    // }else if(error == 'Expired otp received'){
                    //     err = new InvalidGrantError();
                    //     err.message = "OTP Expired";
                    //     err.internalCode = 410;// previous code 400
                    //     err.name = 'gone';
                    //     err.statusCode = 410;
                    //     emailService.deleteEmailOTP(otpId)
                    //     .then(message => console.log(message))
                    //     .catch(error => console.log("Error while deleting OTP - "+error));
                    // }else if(error == 'Incorrect email otp received'){
                    //     err = new InvalidGrantError();
                    //     err.message = "Incorrect OTP";
                    //     err.internalCode = 455;
                    //     err.statusCode = 401;// previous code 400
                    //     err.name = 'incorrect_credentials'
                    // }else{
                    //     console.log('Error while using getUser in oauth model, Error -',error);
                    //     err = new ServerError();
                    //     err.message = 'Internal server error';
                    //     err.internalCode = 500;
                    //     err.name = 'internal_server_error';
                    // }
                    // return callback(err);
                })
            }else{
                const caughtError = new definedErrors.InvalidCredentials();
                caughtError.setAdditionalDetails(`Invalid email otp sent, otp - ${password}`);
                return callback(caughtError);
            }
        break;

        case 'password':
            validationResult = validations.validatePassword(password);
            if(validationResult.valid){
                userService.getPassForUserById(username)
                .then(hash => bcryptService.compareHash(password,hash))
                .then(result => {
                    if(result.exists && result.data.isPasswordMatch)return userService.getUserProfileCompletionData(userId)
                    else throw new Error("Invalid credentials");
                })
                .then(pfcResult => callback(false, pfcResult))
                .catch(error => {
                    if(error instanceof ApplicationError) return callback(error);
                    let caughtError;
                    if(error.hasOwnProperty('sql')){
                        caughtError = new definedErrors.DatabaseServerError();
                        caughtError.setAdditionalDetails(`Query that failed - ${error.sql}, Error number - ${error.errno}, Error code - ${error.code}`);
                        caughtError.setType('fatal');
                        return callback(caughtError);
                    } else if(error.message == 'Invalid credentials'){
                        caughtError = new definedErrors.IncorrectCredentials();
                        caughtError.setAdditionalDetails(`Credentials sent are - username - ${username}, password - ${password}`);
                        return callback(caughtError);
                    } 
                    caughtError = new definedErrors.InternalServerError();
                    caughtError.setAdditionalDetails(error);
                    return callback(caughtError);
                })
            }else{
                const caughtError = new definedErrors.InvalidCredentials();
                caughtError.setAdditionalDetails(`Invalid password sent, password - ${password}`);
                return callback(caughtError);
            }
        break;

        case 'mobile':
            validationResult = validations.validateOTP(password);
            if(validationResult.valid){
                mobileService.getOTPByUserIdAndOtp(username,password)
                .then(result => {
                    if(result.present){
                        const expiryTime = result.data.expiresAt;
                        const otpId = result.data._id;
                        const currentTime = Date.now();
                        const userId = result.data.userId;

                        if(currentTime<expiryTime){
                            userService.checkUserExistence(userId)
                            .then(exists => {
                                if(exists) return userService.getUserProfileCompletionData(userId)
                                else throw new Error('Invalid user id');
                            })
                            .then(pfcResult => {
                                callback(false, pfcResult);
                                return emailService.deleteEmailOTPById(otpId)
                            })
                            .then(message => console.log(message))
                            .catch(error => {
                                throw new Error(error);
                            })
                        }else throw new Error('Expired otp received');
                    }else throw new Error('Incorrect otp received');
                })
                .catch(error => {
                    if(error instanceof ApplicationError) return callback(error);
                    let caughtError;
                    if(error.hasOwnProperty('sql')){
                        caughtError = new definedErrors.DatabaseServerError();
                        caughtError.setAdditionalDetails(`Query that failed - ${error.sql}, Error number - ${error.errno}, Error code - ${error.code}`);
                        caughtError.setType('fatal');
                        return callback(caughtError);
                    } else if(error.message == 'Invalid credentials'){
                        caughtError = new definedErrors.IncorrectCredentials();
                        caughtError.setAdditionalDetails(`Credentials sent are - username - ${username}, password - ${password}`);
                        return callback(caughtError);
                    } 
                    caughtError = new definedErrors.InternalServerError();
                    caughtError.setAdditionalDetails(error);
                    return callback(caughtError);
                })
            }else{
                const caughtError = new definedErrors.InvalidCredentials();
                caughtError.setAdditionalDetails(`Invalid phone otp sent, otp - ${password}`);
                return callback(caughtError);
            }
        break;

        default:
            const caughtError = new definedErrors.InternalServerError;
            caughtError.setAdditionalDetails(`The username was not properly concatinated with the method, given username - ${username}`);
            return callback(caughtError);
    }
}

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to insert access token and refresh token to database
 * @param {object} token - Object containing the access and refresh tokens and their expiration times
 * @param {object} client - Object containing client related data
 * @param {object} user - Object containing user related data
 * @param {requestCallback} callback - The callback that handles the response.
 * @returns {callback} - Callback function call with the response object to be sent for the request for a new token
 * @throws Internal server error, Database server error
 * @todo Third party case handling
 * 
**/
exports.saveToken = (token,client,user,callback) => {
    console.log('Save token')
    const userId = user.id;
    const clientId = client.id;
    const accessToken = token.accessToken;
    const accessTokenExpiresAt = token.accessTokenExpiresAt;
    const refreshToken = token.refreshToken;
    const refreshTokenExpiresAt = token.refreshTokenExpiresAt;

    oauthService.insertNewAccessToken(accessToken,userId,clientId,accessTokenExpiresAt)
    .then(accessTokenId => {
        if(refreshToken && refreshTokenExpiresAt) return oauthService.insertNewRefreshToken(refreshToken,userId,clientId,refreshTokenExpiresAt,accessTokenId)
        else return callback(null,{
            tokenType: "bearer",
            accessToken:token.accessToken,
            accessTokenExpiresAt:token.accessTokenExpiresAt,
            client:{services:JSON.parse(client.clientServices).filter(value => user.services.includes(value))},
            user:{phoneNumberVerified:user.phoneNumberVerified,usingDefaultUsername:user.usingDefaultUsername,services:user.services}
        })
    }).then(refreshTokenId => {
        if(client.clientType == 'firstParty'){
            user.services.push('deviceManagement'); //Because all users getting a token in the first party  application have access to device management server
            return callback(null,{
                tokenType: "bearer",
                accessToken: token.accessToken,
                accessTokenExpiresAt: token.accessTokenExpiresAt,
                refreshToken:token.refreshToken,
                refreshTokenExpiresAt: token.refreshTokenExpiresAt,
                client:{services:JSON.parse(client.clientServices).filter(value => user.services.includes(value))},
                // user:{id:userId, firstLogin:false}
                user:{phoneNumberVerified:user.phoneNumberVerified,usingDefaultUsername:user.usingDefaultUsername,services:user.services}
            })
        }else if(client.clientType == 'thirdParty'){
        }
    })
    .catch(error => {
        if(error instanceof ApplicationError) return callback(error);
        let caughtError;
        if(error.hasOwnProperty('sql')){
            caughtError = new definedErrors.DatabaseServerError();
            caughtError.setAdditionalDetails(`Query that failed - ${error.sql}, Error number - ${error.errno}, Error code - ${error.code}`);
            caughtError.setType('fatal');
            return callback(caughtError);
        }
        caughtError = new definedErrors.InternalServerError();
        caughtError.setAdditionalDetails(error);
        return callback(caughtError);
    })
}

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to insert authrorization code to database
 * @param {object} code - Object containing the authorization code and its expiration time
 * @param {object} client - Object containing client related data
 * @param {object} user - Object containing user related data
 * @param {requestCallback} callback - The callback that handles the response.
 * @returns {callback} - Callback function call with the response object to be sent for the request for a new authorization code
 * @throws Internal server error, Database server error
 * @todo none
 * 
**/
exports.saveAuthorizationCode = (code, client, user, callback) => {
    console.log('Save authorization code')

    const userId = user.id;
    const clientId = client.id;

    oauthService.insertNewAuthorizationCode(code.authorizationCode,code.expiresAt,code.redirectUri,code.scope,userId,clientId)
    .then(result => {
        const returnObject = {
            authorizationCode: code.authorizationCode,
            expiresAt: code.expiresAt,
            redirectUri: code.redirectUri,
            client:{
                id: client.id
            },
            user: user
        }
        if(code.scope) returnObject.scope = code.scope;
        return callback(null,returnObject);
    })
    .catch(error => {
        if(error instanceof ApplicationError) return callback(error);
        let caughtError;
        if(error.hasOwnProperty('sql')){
            caughtError = new definedErrors.DatabaseServerError();
            caughtError.setAdditionalDetails(`Query that failed - ${error.sql}, Error number - ${error.errno}, Error code - ${error.code}`);
            caughtError.setType('fatal');
            return callback(caughtError);
        }
        caughtError = new definedErrors.InternalServerError();
        caughtError.setAdditionalDetails(error);
        return callback(caughtError);
    })
}

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to retrieve and validate an access token details that has been sent through a request
 * @param {string} bearerToken - The token to be validated
 * @param {requestCallback} callback - The callback that handles the response.
 * @returns {callback} - Callback function call with the access token's data object containing 
 * all the details about the access token, handled by oauth-server library
 * @throws Incorrect credentials, Internal server error, Database server error
 * @todo Might need to add a new error for incorrect token
 * 
**/
exports.getAccessToken = (bearerToken, callback) => {
    console.log('Get access token')
    let id;
    let accessToken;
    let accessTokenExpiresAt;
    let clientId;
    let user;
    oauthService.getAccessTokenAndClientDetailsByToken(bearerToken)
    .then(result => {
        if(result.present){
            const clientSecret = result.data.clientSecret;
            id = result.data._id;
            clientId = result.data.clientId;
            user = result.data.user;
            accessToken = result.data.access_token;
            accessTokenExpiresAt = result.data.expiresAt;
            return jwtService.verify(bearerToken,clientSecret,config.jwt_cryptographic_algorithm)
        }else throw new Error('Incorrect token');
    })
    .then(verifiedJwt => {
        if(clientId == verifiedJwt.body.cid && user == verifiedJwt.body.sub) callback(null,{
            _id: id,
            accessToken: accessToken,
            accessTokenExpiresAt: accessTokenExpiresAt,
            client: {
                id: clientId
            },
            user: {
                id: user
            }
        });
        else throw new Error('Invalid authorization data');
    })
    .catch(error => {
        if(error instanceof ApplicationError) return callback(error);
        let caughtError;
        if(error.hasOwnProperty('sql')){
            caughtError = new definedErrors.DatabaseServerError();
            caughtError.setAdditionalDetails(`Query that failed - ${error.sql}, Error number - ${error.errno}, Error code - ${error.code}`);
            caughtError.setType('fatal');
            return callback(caughtError);
        } else if(error.message == 'Incorrect token'){
            caughtError = new definedErrors.Unauthorized();
            caughtError.setMessage('Unauthorized - Incorrect token');
            caughtError.setAdditionalDetails(`client id and user did not match data in JWT, client id - ${clientId}, user - ${user}, jwtBody - ${verifiedJwt.body}`);
            return callback(caughtError);
        } else if(error.message == 'Invalid authorization data'){
            caughtError = new definedErrors.Unauthorized();
            caughtError.setAdditionalDetails(`client id and user did not match data in JWT, client id - ${clientId}, user - ${user}, jwtBody - ${verifiedJwt.body}`);
            return callback(caughtError);
        }
        caughtError = new definedErrors.InternalServerError();
        caughtError.setAdditionalDetails(error);
        return callback(caughtError);
    })
}

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to retrieve and validate an refresh token details that has been sent through a request
 * @param {string} refreshToken - The token to be validated
 * @param {requestCallback} callback - The callback that handles the response.
 * @returns {callback} - Callback function call with the refresh token's data object containing 
 * all the details about the refresh token, handled by oauth-server library
 * @throws Incorrect credentials, Internal server error, Database server error
 * @todo none
 * 
**/
exports.getRefreshToken = (refreshToken, callback) => {
    console.log('Get refresh token')
    oauthService.getRefreshTokenAndClientDetailsByToken(refreshToken)
    .then(result => {
        if(result.present){
            const clientSecret = result.data.clientSecret;
            id = result.data._id;
            clientId = result.data.clientId;
            user = result.data.user;
            accessToken = result.data.access_token;
            accessTokenExpiresAt = result.data.expiresAt;
            return jwtService.verify(refreshToken,clientSecret,config.jwt_cryptographic_algorithm)
        }
        throw new Error('Incorrect token');
    })
    .then(verifiedJwt => {
        if(clientId == verifiedJwt.body.cid && user == verifiedJwt.body.sub) return callback(null,{
            _id: id,
            accessToken: accessToken,
            accessTokenExpiresAt: accessTokenExpiresAt,
            client: {
                id: clientId
            },
            user: {
                id: user
            }
        });
        throw new Error('Invalid authorization data');
    })
    .catch(error => {
        if(error instanceof ApplicationError) return callback(error);
        let caughtError;
        if(error.hasOwnProperty('sql')){
            caughtError = new definedErrors.DatabaseServerError();
            caughtError.setAdditionalDetails(`Query that failed - ${error.sql}, Error number - ${error.errno}, Error code - ${error.code}`);
            caughtError.setType('fatal');
            return callback(caughtError);
        } else if(error.message == 'Incorrect token'){
            caughtError = new definedErrors.Unauthorized();
            caughtError.setMessage('Unauthorized - Incorrect token');
            caughtError.setAdditionalDetails(`client id and user did not match data in JWT, client id - ${clientId}, user - ${user}, jwtBody - ${verifiedJwt.body}`);
            return callback(caughtError);
        } else if(error.message == 'Invalid authorization data'){
            caughtError = new definedErrors.Unauthorized();
            caughtError.setAdditionalDetails(`client id and user did not match data in JWT, client id - ${clientId}, user - ${user}, jwtBody - ${verifiedJwt.body}`);
            return callback(caughtError);
        }
        caughtError = new definedErrors.InternalServerError();
        caughtError.setAdditionalDetails(error);
        return callback(caughtError);
    })
}

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to retrieve and validate an authorization code details that has been sent through a request
 * @param {string} authorizationCode - The code to be validated
 * @param {requestCallback} callback - The callback that handles the response.
 * @returns {callback} - Callback function call with the authorizationn code's data object containing 
 * all the details about the authorizationn code, handled by oauth-server library
 * @throws Incorrect credentials, Internal server error, Database server error
 * @todo Might need to make new error for incorrect authorization code
 * 
**/
exports.getAuthorizationCode = (authorizationCode, callback) => {
    console.log('Get Authorization code')
    oauthService.getAuthCodeAndClientDetailsByToken(authorizationCode)
    .then(result => {
        if(result.present){
            const returnObject = {
                code: result.data.authorizationCode,
                expiresAt: result.data.expiresAt,
                client: {
                    id: result.data.clientId
                },
                user:{
                    id: result.data.user
                },
                redirectUri: result.data.redirectUri
            }
            if(result.data.scope) returnObject.scope = result.data.scope;
            return callback(null,returnObject);
        }
        throw new Error('Incorrect authorization code');
    })
    .catch(error => {
        if(error instanceof ApplicationError) return callback(error);
        let caughtError;
        if(error.hasOwnProperty('sql')){
            caughtError = new definedErrors.DatabaseServerError();
            caughtError.setAdditionalDetails(`Query that failed - ${error.sql}, Error number - ${error.errno}, Error code - ${error.code}`);
            caughtError.setType('fatal');
            return callback(caughtError);
        } else if(error.message == 'Incorrect token'){
            caughtError = new definedErrors.Unauthorized();
            caughtError.setMessage('Unauthorized - Incorrect token');
            caughtError.setAdditionalDetails(`client id and user did not match data in JWT, client id - ${clientId}, user - ${user}, jwtBody - ${verifiedJwt.body}`);
            return callback(caughtError);
        } else if(error.message == 'Invalid authorization data'){
            caughtError = new definedErrors.Unauthorized();
            caughtError.setAdditionalDetails(`client id and user did not match data in JWT, client id - ${clientId}, user - ${user}, jwtBody - ${verifiedJwt.body}`);
            return callback(caughtError);
        }
        caughtError = new definedErrors.InternalServerError();
        caughtError.setAdditionalDetails(error);
        return callback(caughtError);
    })
}

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to revoke a refresh token
 * @param {object} token - Object containing the refresh token
 * @param {requestCallback} callback - The callback that handles the response.
 * @returns {callback} - Callback function call with Boolean representing whether the refresh token was revoked successfully, true if revoked successfully
 * @throws Internal server error, Database server error
 * @todo none
 * 
**/
exports.revokeToken = (token, callback) => {
    console.log('Revoke token')
    const refreshToken = token.refreshToken;
    oauthService.deleteRefreshToken(refreshToken)
    .then(result => {
        return callback(false,true);
    })
    .catch(error => {
        if(error instanceof ApplicationError) return callback(error);
        let caughtError;
        if(error.hasOwnProperty('sql')){
            caughtError = new definedErrors.DatabaseServerError();
            caughtError.setAdditionalDetails(`Query that failed - ${error.sql}, Error number - ${error.errno}, Error code - ${error.code}`);
            caughtError.setType('fatal');
            return callback(caughtError);
        }
        caughtError = new definedErrors.InternalServerError();
        caughtError.setAdditionalDetails(error);
        return callback(caughtError);
    })
}

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to revoke an authorization code
 * @param {object} token - Object containing the authorization code
 * @param {requestCallback} callback - The callback that handles the response.
 * @returns {callback} - Callback function call with Boolean representing whether the authorization code was revoked successfully, true if revoked successfully
 * @throws Internal server error, Database server error
 * @todo none
 * 
**/
exports.revokeAuthorizationCode = (code, callback) => {
    console.log('Revoke Authorization code')
    const authorizationCode = code.code;

    oauthService.deleteAuthorizationCode(authorizationCode)
    .then(result => {
        return callback(false,true);
    })
    .catch(error => {
        if(error instanceof ApplicationError) return callback(error);
        let caughtError;
        if(error.hasOwnProperty('sql')){
            caughtError = new definedErrors.DatabaseServerError();
            caughtError.setAdditionalDetails(`Query that failed - ${error.sql}, Error number - ${error.errno}, Error code - ${error.code}`);
            caughtError.setType('fatal');
            return callback(caughtError);
        }
        caughtError = new definedErrors.InternalServerError();
        caughtError.setAdditionalDetails(error);
        return callback(caughtError);
    })
}
