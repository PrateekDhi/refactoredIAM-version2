const InvalidGrantError = require('oauth2-server/lib/errors/invalid-grant-error');
const ServerError = require('oauth2-server/lib/errors/server-error');
const UnauthorizedRequestError = require('oauth2-server/lib/errors/unauthorized-request-error')
const InvalidClientError = require('oauth2-server/lib/errors/invalid-client-error');
const InvalidTokenError = require('oauth2-server/lib/errors/invalid-token-error');

const cn = require('../../utils/common');

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
const { Console } = require('winston/lib/winston/transports');

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
                    if(scope) claims = tokenClaim.fetchWithScope(); //try catch for this
                    else claims = tokenClaim.fetchWithoutScope(); //try catch for this
                    jwt = jwtService.create(claims,result.data.clientSecret,process.env.JWT_CRYPTOGRAPHIC_ALGORITHM);
                    jwt.setExpiration();
        
                    token = jwt.compact();
                    return callback(false,token);
                }catch(error){
                    throw new Error("Error in tokenClaim model - ",error);
                }
            }else throw new Error("Incorrect client id");
        })
        .catch((error) => {
            let err = {};
            if(error == "Incorrect client id"){
                err = new InvalidClientError();
                err.message = 'Invalid client credentials'
                err.internalCode = 401
                err.name = 'unauthorized'
                err.statusCode = 401
            }else{
                console.log('Error while using generateAccessToken in oauth model, Error -',error);
                err = new ServerError();
                err.message = 'Database server error';
                err.internalCode = 503;
                err.name = 'database_server_error';
            }
            return callback(err);
            // throw new Error(error);
        })
    }else{
        const err = new ServerError();
        err.message = 'Failed to generate token';
        err.internalCode = 500;
        err.name = 'internal_server_error';
        return callback(err);
        // throw new Error("Absent client id or user id, cannot proceed");
    }
}

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
                throw new Error("Invalid OauthResponseClient model - ",error);
            }
        }else throw new Error('Incorrect client id')
    })
    .catch(error => {
        if(error == 'Incorrect client id'){
            const err = new InvalidClientError();
            err.message = 'Invalid client credentials'
            err.internalCode = 401
            err.name = 'unauthorized'
            err.statusCode = 401
            return callback(err);
        }else{
            console.log('Error while using getClient in oauth model, Error -',error);
            //TODO: Separate handling for database errors
            const err = new ServerError();
            err.message = 'Internal server error';
            err.internalCode = 500;
            err.name = 'internal_server_error';
            return callback(err);
        }
    })
}

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
        if(error == 'Incorrect client id'){
            const err = new InvalidClientError();
            err.message = 'Invalid client credentials'
            err.internalCode = 401
            err.name = 'unauthorized'
            err.statusCode = 401
            return callback(err);
        }else{
            console.log('Error while using grantTypeAllowed in oauth model, Error -',error);
            //TODO: Separate handling for database errors
            const err = new ServerError();
            err.message = 'Internal server error';
            err.internalCode = 500;
            err.name = 'internal_server_error';
            return callback(err);
        }
    })
}

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
                                    //TODO: Handle default case
                            }
                        }else throw new Error('Expired otp received');
                    }else throw new Error('Incorrect email otp received');
                })
                .catch(error => {
                    console.log(error)
                    let err;
                    if(error == 'Invalid user id' || error == 'Invalid temporary user id'){
                        err = new ServerError();
                        err.message = "User does not exist";
                        err.internalCode = 453;
                        err.statusCode = 401
                        err.name = 'user_does_not_exist'
                    }else if(error == 'Expired otp received'){
                        err = new InvalidGrantError();
                        err.message = "OTP Expired";
                        err.internalCode = 410;// previous code 400
                        err.name = 'gone';
                        err.statusCode = 410;
                        emailService.deleteEmailOTP(otpId)
                        .then(message => console.log(message))
                        .catch(error => console.log("Error while deleting OTP - "+error));
                    }else if(error == 'Incorrect email otp received'){
                        err = new InvalidGrantError();
                        err.message = "Incorrect OTP";
                        err.internalCode = 455;
                        err.statusCode = 401;// previous code 400
                        err.name = 'incorrect_credentials'
                    }else{
                        console.log('Error while using getUser in oauth model, Error -',error);
                        //TODO: Separate handling for database errors
                        err = new ServerError();
                        err.message = 'Internal server error';
                        err.internalCode = 500;
                        err.name = 'internal_server_error';
                    }
                    return callback(err);
                })
            }else{
                console.log('Validation error -',validationResult.error);
                const err = new ServerError();
                err.message = 'Internal server error';
                err.internalCode = 500;
                err.name = 'internal_server_error';
                return callback(err);
                // throw new Error(validationResult.error);
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
                    if(error == "Invalid credentials"){
                        const err = new InvalidGrantError();
                        err.message = "Incorrect user credentials";
                        err.internalCode = 456 //pre 400
                        err.name = 'incorrect_password'
                        err.statusCode = 400
                        return callback(err)
                        // throw new Error('Invalid user credentials');
                    }else{
                        console.log('Error while using getUser in oauth model, Error -',error);
                        //TODO: Separate handling for database errors and other specific errors
                        const err = new ServerError();
                        err.message = 'Internal server error';
                        err.internalCode = 500;
                        err.name = 'internal_server_error';
                        return callback(err);
                    }
                })
            }else{
                console.log('Validation error -',validationResult.error);
                const err = new ServerError();
                err.message = 'Internal server error';
                err.internalCode = 500;
                err.name = 'internal_server_error';
                return callback(err);
                // throw new Error(validationResult.error);
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
                    let err;
                    if(error == 'Invalid user id'){
                        err = new ServerError();
                        err.message = "User does not exist";
                        err.internalCode = 453;
                        err.statusCode = 401
                        err.name = 'user_does_not_exist'
                    }else if(error == 'Expired otp received'){
                        err = new InvalidGrantError();
                        err.message = "OTP Expired";
                        err.internalCode = 410;// previous code 400
                        err.name = 'gone';
                        err.statusCode = 410;
                        mobileService.deleteOTP(otpId)
                        .then(message => console.log(message))
                        .catch(error => console.log("Error while deleting OTP - "+error));
                    }else if(error == 'Incorrect otp received'){
                        err = new InvalidGrantError();
                        err.message = "Incorrect OTP";
                        err.internalCode = 455;
                        err.statusCode = 401;// previous code 400
                        err.name = 'incorrect_credentials'
                    }else{
                        console.log('Error while using getUser in oauth model, Error -',error);
                        //TODO: Separate handling for database errors
                        err = new ServerError();
                        err.message = 'Internal server error';
                        err.internalCode = 500;
                        err.name = 'internal_server_error';
                    }
                    return callback(err);
                })
            }else{
                console.log('Validation error -',validationResult.error);
                const err = new ServerError();
                err.message = 'Internal server error';
                err.internalCode = 500;
                err.name = 'internal_server_error';
                return callback(err);
                // throw new Error(validationResult.error);
            }
        break;

        default:
            const err = new InvalidGrantError();
            err.message = "Invalid user credentials";
            err.internalCode = 454 //pre 400
            err.name = 'invalid_credentials'
            err.statusCode = 401
            return callback(err)
            // throw new Error("Invalid grant when trying to get user in oauth model");
    }
}

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
            //TODO: Handling third party client's access token when third party support starts
        }
    })
    .catch(error => {
        console.log('Error while using saveToken in oauth model, Error -',error);
        //TODO: Separate handling for database errors
        const err = new ServerError();
        err.message = 'Internal server error';
        err.internalCode = 500;
        err.name = 'internal_server_error';
        return callback(err);
        // throw new Error(error);
    })
}

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
        console.log('Error while using saveAuthorizationCode in oauth model, Error -',error);
        //TODO: Separate handling for database errors
        const err = new ServerError();
        err.message = 'Internal server error';
        err.internalCode = 500;
        err.name = 'internal_server_error';
        return callback(err);
        // throw new Error(error);
    })
}

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
            return jwtService.verify(bearerToken,clientSecret,process.env.JWT_CRYPTOGRAPHIC_ALGORITHM)
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
        let err = {};
        if(error == 'Incorrect token'){
            err = new InvalidTokenError();
            err.message = 'Incorrect Token'
            err.internalCode = 455 
            err.name = 'incorrect_credentials'
            err.statusCode = 401
        }else if(error == 'Invalid authorization data'){
            err = new InvalidTokenError();
            err.internalCode = 454 //previous code 400
            err.name = 'invalid_authorization_data'
            err.statusCode = 401
        }else{
            console.log('Error while using getAccessToken in oauth model, Error -',error);
            //TODO: Separate handling for database errors
            err = new ServerError();
            err.message = 'Internal server error';
            err.internalCode = 500;
            err.name = 'internal_server_error';
        }   
        return callback(err);
    })
}

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
            return jwtService.verify(refreshToken,clientSecret,process.env.JWT_CRYPTOGRAPHIC_ALGORITHM)
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
        let err = {};
        if(error == 'Incorrect token'){
            err = new InvalidTokenError();
            err.message = 'Incorrect Token'
            err.internalCode = 455 
            err.name = 'incorrect_credentials'
            err.statusCode = 401
        }else if(error == 'Invalid authorization data'){
            err = new InvalidTokenError();
            err.internalCode = 454 //previous code 400
            err.name = 'invalid_authorization_data'
            err.statusCode = 401
        }else{
            console.log('Error while using getRefreshToken in oauth model, Error -',error);
            //TODO: Separate handling for database errors
            err = new ServerError();
            err.message = 'Internal server error';
            err.internalCode = 500;
            err.name = 'internal_server_error';
        }   
        return callback(err);
    })
}

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
        let err = {};
        if(error == 'Incorrect authorization code'){
            err = new UnauthorizedRequestError();
            err.message = 'Unauthorized'
            err.internalCode = 401
            err.name = 'unauthorized'
            err.statusCode = 401
        }else{
            console.log('Error while using getAuthorizationCode in oauth model, Error -',error);
            //TODO: Separate handling for database errors
            err = new ServerError();
            err.message = 'Internal server error';
            err.internalCode = 500;
            err.name = 'internal_server_error';
        }
        return callback(err);
    })
}

exports.revokeToken = (token, callback) => {
    console.log('Revoke token')
    const refreshToken = token.refreshToken;
    oauthService.deleteRefreshToken(refreshToken)
    .then(result => {
        return callback(false,true);
    })
    .catch(error => {
        console.log('Error while using revokeToken in oauth model, Error -',error);
        //TODO: Separate handling for database errors
        const err = new ServerError();
        err.message = 'Internal server error';
        err.internalCode = 500;
        err.name = 'internal_server_error';
        return callback(err);
    })
}

exports.revokeAuthorizationCode = (code, callback) => {
    console.log('Revoke Authorization code')
    const authorizationCode = code.code;

    oauthService.deleteAuthorizationCode(authorizationCode)
    .then(result => {
        return callback(false,true);
    })
    .catch(error => {
        console.log('Error while using revokeAuthorizationCode in oauth model, Error -',error);
        //TODO: Separate handling for database errors
        const err = new ServerError();
        err.message = 'Internal server error';
        err.internalCode = 500;
        err.name = 'internal_server_error';
        return callback(err);
    })
}