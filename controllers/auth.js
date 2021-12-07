/**
 *
 * file - auth.js - Authentication controller
 *
 * @version    0.1.0
 * @created    23/10/2021
 * @copyright  Dhi Technologies
 * @license    For use by dhi Technologies applications
 *
 * Description : schema and workflow for rwgistering users
 *
 *
 * 23/10/2021 - PS - Refactored
 *
 *  
 * TODO: Add a cron job that deletes all the invalidated or used up otps from DB if they are not required for analytics purpose
 * IMPORTANT - This file contains controller functionalities for all auth related endpoints
**/
const cn = require('../utils/common');
const config = require('../config');
//Models
const User = require('../models/User');
const Otp = require('../models/MobileOTP');
const RecoveryToken = require('../models/RecoveryToken');

//Services
const emailService = require('../services/emailOtp');
const messagingService = require('../services/otp');
const generateService = require('../services/generate');
const jweService = require('../services/jwe');
const temporaryUserService = require('../services/temporaryUser');
const userService = require('../services/user');
const bcryptService = require('../services/bcrypts');

//Response model
const Response = require('../utils/response');

//Errors
const definedErrors = require('../errors');
const ApplicationError = definedErrors.ApplicationError;

exports.userRegistrationDetails = (firstName,lastName,email,password,countryCode,phoneNumber,client_id,service) => {
/**
 * @Validations
 * 1) Is the client valid -> req.body.client_id
 * 2) Registration form fields validation
 * 3) Does Email already exist(DB action - User model needed)
 * 
 * @Sanitization
 * 1) Convert email to lowercase
**/
    return new Promise((resolve,reject) => {
        //TODO: Conversion of email to lower case should we done within validation middleware
        let temporaryUserId;
        bcryptService.generateHash(password, config.bcrypt.password_salt_rounds)
        .then(hashedPassword => {
                return Promise.all([
                    emailService.sendOTP(email.toLowerCase()),
                    temporaryUserService.insertNewTemporaryUser(firstName, lastName, email.toLowerCase(), hashedPassword, countryCode, phoneNumber, client_id, service)
                ])
            }
        )
        .then(results => {
            temporaryUserId = results[1];
            //userId,otp,type,service,attemptNumber
            return emailService.insertNewEmailOTP(temporaryUserId,results[0].eOTP,'registration',service,1);
        })
        .then(otpId => {
            let response = new Response({
                temporaryUserId: temporaryUserId,
                action: 'registration',
                otpId: otpId,
                email: cn.hideEmailAddress(email.toLowerCase())
            },"OTP sent to email address, will be valid for the next 1 hour",200,null, 200)
            return resolve(response.getResponse());
        })
        .catch(err => {
            if(err instanceof ApplicationError) reject(err);
            else {
                caughtError = new definedErrors.InternalServerError();
                caughtError.setAdditionalDetails(err);
                return reject(caughtError);
            }
        })
    })
}


//Version - 1

// exports.userLoginDetails = (client_id, username, service, isEmail, userId) => {
//     return new Promise((resolve,reject) => {
//         if(isEmail){
//             let userId;
//             Promise.all([
//                 emailService.sendOTP(username.toLowerCase()),
//                 userService.findUserByEmailAddress(username.toLowerCase())
//             ])
//             .then(results => {
//                 userId = results[1].data.id;
//                 return emailService.insertNewEmailOTP(userId,results[0].eOTP,'login',service,1);
//             })
//             // emailService.sendOTP(req.body.username.toLowerCase())
//             // .then(result => emailService.insertNewEmailOTP(req.userId,result.eOTP,'login',req.body.service,1))
//             .then(otpId => {
//                 let response = new Response({
//                     userId: userId,
//                     action: 'login',
//                     otpId: otpId,
//                     email: cn.hideEmailAddress(username.toLowerCase())
//                 },
//                 "OTP sent to email address, will be valid for the next 1 hour",200,null, 200)
//                 return resolve(response.getResponse());
//             })
//             .catch(err => {
//                 console.log(err);
//                 if(err.message == "Database server error"){
//                     const response = new Response(null,"User login details check failed", 503, "database_server_error", 503)
//                     return reject(response.getResponse());
//                 } else {
//                     const response = new Response(null,"User login details check failed", 500, "internal_server_error", 500)
//                     return reject(response.getResponse());
//                 }
//             })
//         }else{
//             let email;
//             let userId;
//             userService.findUserEmailByUsername(username)
//             .then(result => {
//                 if(result.present){
//                     email = result.email;
//                     return Promise.all([
//                         emailService.sendOTP(email),
//                         userService.findUserByEmailAddress(email)
//                     ])
//                 }
//                 throw new Error('Invalid username')
//             })
//             .then(results => {
//                 userId = results[1].data.id;
//                 return emailService.insertNewEmailOTP(userId,results[0].eOTP,'login',service,1)
//             })
//             .then(otpId => {
//                 const response = new Response({
//                     userId: userId,
//                     action: 'login',
//                     otpId: otpId,
//                     email: cn.hideEmailAddress(email)
//                 },
//                 "OTP sent to email address, will be valid for the next 1 hour",200,null, 200)
//                 return resolve(response.getResponse());
//             })
//             .catch(err => {
//                 console.log(err);
//                 if(err.message == "Database server error"){
//                     const response = new Response(null,"User login details check failed", 503, "database_server_error", 503)
//                     return reject(response.getResponse());
//                 } else {
//                     const response = new Response(null,"User login details check failed", 500, "internal_server_error", 500)
//                     return reject(response.getResponse());
//                 }
//             })
//         }
//     })
// }

//Version - 2

exports.userLoginDetails = (client_id, username, service, isEmail, userId) => {
/**
 * @Validations
 * 1) Is the client valid -> req.body.client_id
 * 2) Login form fields validation
 * 3) Does username field contain a username or an email address -> ADD req.isEmail = true if its and email and false if its a username
 * 4) Email provided is a registered email address OR 
 *    provided username is a registered username and add userId to 
 *    request -> req.userId should be set to user's id to whom the email belongs(Or adding userId to req could be done using a middleware)
**/
    return new Promise((resolve,reject) => {
        let userId;
        let userEmail;
        return new Promise((resolve,reject) => {
            if(isEmail) resolve(username.toLowerCase())
            else userService.findUserEmailByUsername(username)
            .then(result => {
                if(result.present){resolve(result.data.email)}
                else reject("Incorrect email")
            })
            .catch(error => reject(error))
        })
        .then(email => {
            userEmail = email;
            return Promise.all([
                emailService.sendOTP(userEmail),
                userService.findUserByEmailAddress(userEmail)
            ])
        })
        .then(results => {
            userId = results[1].data._id;
            return emailService.insertNewEmailOTP(userId,results[0].eOTP,'login',service,1);
        })
        // emailService.sendOTP(req.body.username.toLowerCase())
        // .then(result => emailService.insertNewEmailOTP(req.userId,result.eOTP,'login',req.body.service,1))
        .then(otpId => {
            let response = new Response({
                userId: userId,
                action: 'login',
                otpId: otpId,
                email: cn.hideEmailAddress(userEmail)
            },
            "OTP sent to email address, will be valid for the next 1 hour",200,null, 200)
            return resolve(response.getResponse());
        })
        .catch(err => {
            if(err.message == "Database server error"){
                const response = new Response(null,"User login details check failed", 503, "database_server_error", 503)
                return reject(response.getResponse());
            } else if(err == "Incorrect email"){
                const response = new Response(null,"User login details check failed", 400, "incorrect_email", 400)
                return reject(response.getResponse());
            }else {
                const response = new Response(null,"User login details check failed", 500, "internal_server_error", 500)
                return reject(response.getResponse());
            }
        })
    })
}

exports.resendEmailOTP = (otpId) => {
/**
 * @Validations
 * 1) Is the client valid -> req.body.client_id
 * 2) Resend otp form validation
 * 3) Does otpId exist
**/
    let email;
    let userId;
    let action;
    let service;
    let attemptNumber;
    emailService.getEmailOTPDataById(otpId)
    .then(result => {
        if(result.present){
            userId = result.data.userId;
            action = result.data.action;
            service = result.data.service;
            attemptNumber = result.data.attemptNumber;
            return userService.findUserEmailById(userId)
        }
        throw new Error('Incorrect OTP Id');
    })
    .then(result => {
        if(result.present){
            email = result.data.email;
            return emailService.sendOTP(email);
        }
        throw new Error('Incorrect User Id');
    })
    .then(otp => emailService.insertNewEmailOTP(userId,otp,action,service,attemptNumber+1))
    .then(otpId => {
        const responseObject = {
            action: otpData.action,
            otpId: otpId,
            email: cn.hideEmailAddress(email)
        }
        if(action == "registration") responseObject.temporaryUserId = userId;
        else responseObject.userId = userId;
        cn.sendResponse(res,responseObject,"OTP sent to email address, will be valid for the next 1 hour",200,null, 200)
    })
    .catch(err => {
        if(err.message == "Database server error") cn.sendResponse(res,null,"Resend Email OTP Failed", 503, "database_server_error", 503);
        else cn.sendResponse(res,null,"Resend Email OTP Failed", 500, "internal_server_error", 500);
    })
}

exports.mobileOTPLogin = (client_id, username, service) => {
/**
 *  @Validations
 * 1) Is the client valid -> req.body.client_id
 * 2) Mobiel otp login form validation
 * 3) Email provided is a registered email address OR 
 *    provided username is a registered username and add userId to 
 *    request -> req.userId should be set to user's id to whom the email belongs(Or adding userId to req could be done using a middleware)
**/
    let phoneNumber;
    let countryCode;
    //Need to find phone number, its country code and whether its verified or not first because during phone number login we receive email 
    //or username in request body not phone number

    userService.findUserByUsername(req.userId)
    .then(result => {
        if(result.present){
            phoneNumber = result.data.phoneNumber;
            countryCode = result.data.countryCode;
            if(result.data.phoneNumberVerificationStatus == 1) return messagingService.sendOTP(phoneNumber)
            throw new Error('Phone number not verified');
        }
        throw new Error('Invalid user id');
    })
    .then(mobileOtp => messagingService.insertNewPhoneOTP(userId,mobileOtp,'login',service,1))
    .then(otpId => {
        cn.sendResponse(res,
            {
                userId: req.userId,
                action: 'login',
                otpId: otpId,
                countryCode: countryCode,
                phoneNumber: cn.hidePhoneNumber(phoneNumber)
            },
            "OTP sent to phone number, will be valid for the next 1 hour",200,null, 200
        )
    })
    .catch(err => {
        if(err.message == "Database server error") cn.sendResponse(res,null,"Mobile otp login process failed", 503, "database_server_error", 503);
        else cn.sendResponse(res,null,"Mobile otp login process failed", 500, "internal_server_error", 500);
    })
}

exports.resendPhoneOTP = (client_id, otpId) => {
/**
 * @Validations
 * 1) Is the client valid -> req.body.client_id
 * 2) Resend otp form validation
 * 3) Does otpId exist
**/

    let userId;
    let action;
    let service;
    let attemptNumber;
    let phoneNumber;
    let countryCode;
    messagingService.findMobileOTPDataById(otpId)


    Otp.findOneById(req.body.otpId)
    .then(result => {
        otpData = result;
        return User.findPhoneNumber(result.userId);
    })
    .then(result => {
        phoneNumber = result.phoneNumber;
        countryCode = result.countryCode;
        return messagingService.sendOTP(result)
    })
    .then(result => {
        const otp = new Otp(otpData.userId,result.mOTP,otpData.action,otpData.service,otpData.attemptNumber+1);
        return otp.save();
    })
    .then(otpId => {
        cn.sendResponse(res,
            {
                userId: otpData.userId,
                action: otpData.action,
                otpId: otpId,
                countryCode: countryCode,
                phoneNumber: cn.hideEmailAddress(phoneNumber)
            },
            "OTP sent to phone number, will be valid for the next 1 hour",200,null, 200
        )
    })
    .catch(err => {
        if(err.message == "Database server error") cn.sendResponse(res,null,"Resend Phone OTP Failed", 503, "database_server_error", 503);
        else cn.sendResponse(res,null,"Resend Phone OTP Failed", 500, "internal_server_error", 500);
    })
}

exports.resetPasswordEmail = (username,client_id) => {
/**
 * @Validations
 * 1) Is the client valid -> req.body.client_id
 * 2) Resen password email form validation
 * 3) Does username field contain a username or an email address -> ADD req.isEmail = true if its and email and false if its a username
 * 4) Email provided is a registered email address OR 
 *    provided username is a registered username and add userId to 
 *    request -> req.userId should be set to user's id to whom the email belongs(Or adding userId to req could be done using a middleware)
**/
    if(req.isEmail){
        generateService.generateGivenByteSizeString(16)
        .then(result => {
            let expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 1);
            const recoveryToken = new RecoveryToken(result, req.userId, expiryDate)
            return recoveryToken.save();
        })
        .then(result => jweService.createEncrypt(config.recovery_token_encryption_key.k,token))  //createEncrypt takes the key as first parameter and data to be encrypted as second parameter
        .then(JWE => emailService.sendRecoveryEmail(req.body.username,JWE))
        .then(result => sendResponse(res,null,"Reset password email process completed - Email has been sent to registered email address", 200, null, 200))
        .catch(err => {
            if(err.message == "Database server error") cn.sendResponse(res,null,"Resend Phone OTP Failed", 503, "database_server_error", 503);
            else cn.sendResponse(res,null,"Resend Phone OTP Failed", 500, "internal_server_error", 500);
        })
    }else{
        generateService.generateGivenByteSizeString(16)
        .then(result => {
            let expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 1);
            const recoveryToken = new RecoveryToken(result, req.userId, expiryDate)
            return recoveryToken.save();
        })
        .then(result => Promise.all(
            [
                jweService.createEncrypt(process.env.RECOVERYTOKENENCRYPTIONKEY,token),
                User.findEmail(req.userId)
            ])
        )  //createEncrypt takes the key as first parameter and data to be encrypted as second parameter
        .then(results => emailService.sendRecoveryEmail(results[1],results[0]))
        .then(result => sendResponse(res,null,"Reset password email process completed - Email has been sent to registered email address", 200, null, 200))
        .catch(err => {
            if(err.message == "Database server error") cn.sendResponse(res,null,"Resend Phone OTP Failed", 503, "database_server_error", 503);
            else cn.sendResponse(res,null,"Resend Phone OTP Failed", 500, "internal_server_error", 500);
        })
    }
}

exports.setNewPassword = (client_id, recoveryToken, password) => {
/**
 * @Validations
 * 1) Is the client valid -> req.body.client_id
 * 2) Set password form validation
 * 3) Does recovery token exist, if exists set req.tokenId = <Recovery Token's Id>, req.userId = userId in the token
**/
    RecoveryToken.findById(req.tokenId)
    .then(result => {
        if(!result.expired) cn.sendResponse(res,null,"Recovery token expired", 410, "gone", 410);
        else return crypt.hash(password, 12);
    })
    .then(hashedPassword => {
        const user = new User(req.userId, null, null, null, null, null, hashedPassword, null, null, null, null, null, null, null, Date.now());
        return user.update();
    })
    .then(result => sendResponse(res,null,"Password reset successful",200,null, 200))
    .catch(err => {
        if(err.message == "Database server error") cn.sendResponse(res,null,"Resend Phone OTP Failed", 503, "database_server_error", 503);
        else cn.sendResponse(res,null,"Resend Phone OTP Failed", 500, "internal_server_error", 500);
    })
}