const config = require('../config');
const sgMail = require('@sendgrid/mail');
const cn = require('../utils/common');
const EmailOTP = require('../models/EmailOTP');
const definedErrors = require('../errors');

sgMail.setApiKey(config.email_gateway_api_key);

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to send otp to an email
 * @param {string} email - Email of the client
 * @returns {Promise} - Promise object represents either javascript object 
 * {message: <Mesasge that can be used for display>, eOTP: <The OTP that was sent to the email>}
 * @throws Database server error, Internal server error
 * @todo none
 * 
**/
exports.sendOTP = (email) => {
    // console.log(config.email_gateway_api_key)
    // console.log(sgMail)
    let eOTP = cn.generateOTP();

    console.log("Email OTP - "+eOTP);

    return new Promise((resolve, reject) => {
        // const eText = "OTP-"+eOTP+". It will expire in next 1 hour";
        const eHTML = '<!DOCTYPE html> <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"> <head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width,initial-scale=1"> <meta name="x-apple-disable-message-reformatting"> <title>Indhi</title>  <style> table, td, div, h1, p { font-family: Arial, sans-serif; } a { text-decoration: none; } @media screen and (max-width: 530px) { .unsub { display: block; padding: 8px; margin-top: 14px; border-radius: 6px; background-color: #555555; text-decoration: none !important; font-weight: bold; } .col-lge { max-width: 100% !important; } } @media screen and (min-width: 531px) { .col-sml { max-width: 27% !important; } .col-lge { max-width: 73% !important; } } </style> </head> <body style="margin:0;padding:0;word-spacing:normal;background-color:#ffffff;"> <div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#ffffff;"> <table role="presentation" style="width:100%;border:none;border-spacing:0;"> <tr> <td align="center" style="padding:0;">  <table role="presentation" style="width:94%;max-width:600px;border:none;border-spacing:0;text-align:center;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#363636;"> <tr> <td style="padding:40px 30px 20px 30px;text-align:center;font-size:24px;font-weight:bold;"> <a href="https://indhi.io/" style="text-decoration:none;"><img src="https://indhi.io/mailer/images/logo.png" width="165" alt="Logo" style="width:80%;max-width:165px;height:auto;border:none;text-decoration:none;color:#ffffff;"></a> </td> </tr> <tr> <td style="padding:20px;background-color:#ffffff;"> <h1 style="margin-top:0;margin-bottom:16px;font-size:26px;line-height:32px;font-weight:bold;letter-spacing:-0.02em;">Verification Code</h1> <br /> <h2 style="margin:0;font-size:26px;line-height:32px;font-weight:normal;">' + eOTP + '</h2> <br /> </td> </tr> <tr> <td style="padding:10px;background-color:#ffffff;"> <p style="margin:0;font-size:13px;line-height:22px;">Here is your OTP verification code.<br>It will expire in 1 hour.</p> <p style="margin:0;font-size:13px;line-height:22px;">If you did not try to sign in right now, please email <a href="mailto:support@indhi.io">support@indhi.io</a> for assistance.</p> <p style="margin-top:30px;font-size:14px;line-height:22px;font-weight:bold;">Thank you for using indhi.</p> </td> </tr> <tr> <td style="padding:10px;font-size:24px;line-height:28px;font-weight:bold;background-color:#ffffff;border-bottom:1px solid #f0f0f5;border-color:rgba(201,201,207,.35);"> <a href="http://www.example.com/" style="text-decoration:none;"><img src="images/1200x800-1.png" width="540" alt="" style="width:100%;height:auto;border:none;text-decoration:none;color:#363636;"></a> </td> </tr> <tr> <td style="padding:30px;text-align:center;font-size:12px;background-color:#ffffff;color:#808080;">  <p style="margin:0;font-size:14px;line-height:20px;">© 2021 Dhi Technologies Private Limited<br><a class="unsub" href="http://indhi.io/" style="color:#cccccc;text-decoration:underline;">Unsubscribe</a></p> </td> </tr> </table>  </td> </tr> </table> </div> </body> </html>'
        const eMsg = {
            to: email,
            from: 'alerts@indhi.io',
            subject: 'Indhi OTP',
            // text: eText,
            html: eHTML
        };
        sgMail.send(eMsg,(error,result) => {
            // console.log('SMS gateway callback')
            if(error){
                const caughtError = new definedErrors.BadGateway();
                caughtError.setAdditionalDetails(`Email gateway error - ${error}`);
                return reject(caughtError);         
            }
            else{
                // console.log('SENDING RESPONSE OF EMAIL OTP SENT')
                let responseObj = {};
                responseObj.message = "OTP sent to email address, will be valid for next 1 hour";
                responseObj.eOTP = eOTP;
                resolve(responseObj);
            }
        });
    });
}

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to insert a new email otp
 * @param {string} userId - Id of the user to whom the otp was sent
 * @param {string} otp - The otp that was sent to the user
 * @param {string} type - Type of process - login/registration
 * @param {string} service - Service associated with this process - IAM/Developer/Device Management
 * @param {string} attemptNumber - The current attempt number for this otp sending cycle(Max allowed 3 right now)
 * @returns {Promise} - Promise object represents a string which is the inserted id of the email otp
 * @throws Database server error, Internal server error
 * @todo none
 * 
**/
exports.insertNewEmailOTP = (userId,otp,type,service,attemptNumber) => {
    return new Promise((resolve, reject) => {
        let assignedOTPId;
        generateEmailOTPId()
        .then(otpId => {
            assignedOTPId = otpId;
            const otpExpirationTime = getEmailOTPExpirationTime(Date.now());
            const emailOTP = new EmailOTP(otpId, otp, userId, type, otpExpirationTime, service, attemptNumber);
            return emailOTP.save();
        })
        .then(([rows,fields]) => {
            // console.log('--------------------------------')
            // console.log(rows.affectedRows, fields);
            if(rows.affectedRows != 1) throw new Error("No rows affected while inserting email otp");
            else return resolve(assignedOTPId);
        })
        .catch(error => {
            if(error instanceof ApplicationError) return reject(error);
            let caughtError;
            if(error.sqlMessage){
                caughtError = new definedErrors.DatabaseServerError();
                caughtError.setAdditionalDetails(`Query that failed - ${error.sql}, Error number - ${error.errno}, Error code - ${error.code}`);
                return reject(caughtError);
                // console.error('Query that failed - ', error.sql, 'Error number - ',error.errno, 'Error code - ',error.code);
                // error.message = "Database server error";
            }
            caughtError = new definedErrors.InternalServerError();
            caughtError.setAdditionalDetails(error);
            return reject(caughtError);
        });
    })
}

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to get email otp complete data given the id and otp 
 * @param {string} id - OTP entry's id
 * @param {string} otp - OTP that was sent
 * @returns {Promise} - Promise object represents either javascript object {present: false} if entity is not present or 
 * javascript object {present: true, data: <Data that was requested from this function>} if entity is present
 * @throws Database server error, Internal server error
 * @todo none
 * 
**/
exports.getEmailOTPByUserIdAndOtp = (id,otp) => {
    return new Promise((resolve, reject) => {
        EmailOTP.findEmailOtpByUserIdAndOtp(id,otp)
        .then(([rows,fields]) => {
            let returnValue = {};
            if(rows.length == 1){
                returnValue.present = true;
                returnValue.data = rows[0];
                return resolve(returnValue);
            }else if(rows.length == 0){
                returnValue.present = false;
                return resolve(returnValue);
            }
            return reject("Duplicate entries found for given username - ", username);
        })
        .catch(error => {
            if(error instanceof ApplicationError) return reject(error);
            let caughtError;
            if(error.sqlMessage){
                caughtError = new definedErrors.DatabaseServerError();
                caughtError.setAdditionalDetails(`Query that failed - ${error.sql}, Error number - ${error.errno}, Error code - ${error.code}`);
                return reject(caughtError);
                // console.error('Query that failed - ', error.sql, 'Error number - ',error.errno, 'Error code - ',error.code);
                // error.message = "Database server error";
            }
            caughtError = new definedErrors.InternalServerError();
            caughtError.setAdditionalDetails(error);
            return reject(caughtError);
            // if(error.sqlMessage){
            //   console.error('Query that failed - ', error.sql, 'Error number - ',error.errno, 'Error code - ',error.code);
            //   error.message = "Database server error";
            // }
            // return reject(error);
        });
    })
}

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to get email otp complete data given the id
 * @param {string} id - OTP entry's id
 * @returns {Promise} - Promise object represents either javascript object {present: false} if entity is not present or 
 * javascript object {present: true, data: <Data that was requested from this function>} if entity is present
 * @throws Database server error, Internal server error
 * @todo none
 * 
**/
exports.getEmailOTPDataById = (id) => {
    return new Promise((resolve, reject) => {
        EmailOTP.findById(id)
        .then(([rows,fields]) => {
            let returnValue = {};
            if(rows.length == 1){
                returnValue.present = true;
                returnValue.data = rows[0];
                return resolve(returnValue);
            }else if(rows.length == 0){
                returnValue.present = false;
                return resolve(returnValue);
            }
            return reject("Duplicate entries found for given email otp id - ", id);
        })
        .catch(error => {
            if(error instanceof ApplicationError) return reject(error);
            let caughtError;
            if(error.sqlMessage){
                caughtError = new definedErrors.DatabaseServerError();
                caughtError.setAdditionalDetails(`Query that failed - ${error.sql}, Error number - ${error.errno}, Error code - ${error.code}`);
                return reject(caughtError);
                // console.error('Query that failed - ', error.sql, 'Error number - ',error.errno, 'Error code - ',error.code);
                // error.message = "Database server error";
            }
            caughtError = new definedErrors.InternalServerError();
            caughtError.setAdditionalDetails(error);
            return reject(caughtError);
            // if(error.sqlMessage){
            //   console.error('Query that failed - ', error.sql, 'Error number - ',error.errno, 'Error code - ',error.code);
            //   error.message = "Database server error";
            // }
            // return reject(error);
        });
    })
}

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to delete an email otp entry from database
 * @param {string} id - OTP entry's id
 * @returns {Promise} - Promise object represents boolean true if deleted successfully
 * @throws Database server error, Internal server error
 * @todo none
 * 
**/
exports.deleteEmailOTPById = (id) => {
    return new Promise((resolve, reject) => {
        EmailOTP.deleteById(id)
        .then(([rows,fields]) => {
            return resolve(true);
        })
        .catch(error => {
            if(error instanceof ApplicationError) return reject(error);
            let caughtError;
            if(error.sqlMessage){
                caughtError = new definedErrors.DatabaseServerError();
                caughtError.setAdditionalDetails(`Query that failed - ${error.sql}, Error number - ${error.errno}, Error code - ${error.code}`);
                return reject(caughtError);
                // console.error('Query that failed - ', error.sql, 'Error number - ',error.errno, 'Error code - ',error.code);
                // error.message = "Database server error";
            }
            caughtError = new definedErrors.InternalServerError();
            caughtError.setAdditionalDetails(error);
            return reject(caughtError);
            // if(error.sqlMessage){
            //     console.error('Query that failed - ', error.sql, 'Error number - ',error.errno, 'Error code - ',error.code);
            //     error.message = "Database server error";
            // }
            // return reject(error);
        });
    })
}

//Local functions

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to generate a new email otp entry id
 * @param - none
 * @returns {Promise} - Pending promise that will be give the id
 * @throws none
 * @todo none
 * 
**/
const generateEmailOTPId = () => cn.asyncGenerateRandomId(6);

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to get the system defined expiration time for an otp given the creation time of the otp.
 * @param {number} creationTime  - The creation time of the otp in millsecond timestamp format
 * @returns {Number} - Millisecond timestamp representing the expiration time for an email otp
 * @throws none
 * @todo none
 * 
**/
const getEmailOTPExpirationTime = (creationTime) => {
    let expiryTime = creationTime + config.email_otp.validity_duration;
    return expiryTime;
}