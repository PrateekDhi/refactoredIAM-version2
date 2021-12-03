/**
 *
 * file - common.js - The common functions grouped
 *
 * @author     Prateek Shukla
 * @version    0.1.0
 * @created    10/11/2021
 * @copyright  Dhi Technologies
 * @license    For use by Dhi Technologies applications
 *
 * @description - All common functions used accross the system
 *
 *
 * 10/11/2021 - PS - Created
 * 
**/

const crypto = require('crypto')

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to generate otp
 * @param - none
 * @returns {String} - String random OTP
 * @throws none
 * @todo Generalize more to allow OTP of different lengths
 * 
**/
exports.generateOTP = () => {

    const digits = "0123456789";

    let OTP = '';
    for(let i=0; i<6; i++){
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

/**
 * 
 * @author Prateek Shukla
 * @description The function is used to check if an object has all properties null or empty string
 * @param {object} object - The object that needs to be checked
 * @returns {Boolean} - Boolean value representing true if object has all null or empty properties, false otherwise
 * @throws none
 * @todo none
 * 
**/
exports.allNullOrEmpty = (object) => {
    const isEmptyOrNull = Object.values(object).every(x => (x == null || x == ''));
    return isEmptyOrNull
}

/**
 * 
 * @author Prateek Shukla
 * @description Function used to generate a random string synchronously
 * @param {number} length - Integer representing the length of the required random string
 * @returns {String} - Generated random string
 * @throws none
 * @todo none
 * 
**/
exports.generateRandomString = (length) => {
    let result           = '';
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/**
 * 
 * @author Prateek Shukla
 * @description Function used to generate a random string containing only numbers, synchronously
 * @param {number} length - Integer representing the length of the required random string
 * @returns {String} - Generated random number string
 * @throws none
 * @todo none
 * 
**/
exports.generateRandomNumberString = (length) => {
    let result           = '';
    const characters       = '0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/**
 * 
 * @author Prateek Shukla
 * @description Function used to generate a random id asynchronously
 * @param {number} length - Integer representing the length of the required random id
 * @returns {Promise} - Promise object represents a random id generated
 * @throws none
 * @todo might need to be updated or else deprecated
 * 
**/
exports.asyncGenerateRandomId = (length) => {
    return new Promise((resolve,reject) => {
        let result           = '';
        const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for ( let i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        resolve(result+Date.now())
    })
}

/**
 * 
 * @author Prateek Shukla
 * @description Function used to merge two arrays(containing strings) while also removing duplicates
 * @param {object} array1 - The first array to be merged
 * @param {object} array2 - The second array to be merged
 * @returns {Promise} - Promise object represents the merged array
 * @throws none
 * @todo Could make the removing of duplication part as a separate function for higher modularity
 * 
**/
exports.mergeTwoStringArraysWithoutDuplicates = (array1,array2) => {
    return new Promise((resolve,reject) => {
        let result_array = [];
        let arr = array1.concat(array2);
        let len = arr.length;
        let assoc = {};
    
        while(len--) {
            let item = arr[len];
    
            if(!assoc[item]) 
            { 
                result_array.unshift(item);
                assoc[item] = true;
            }
        }

       resolve(result_array);
    })
}

/**
 * 
 * @author Prateek Shukla
 * @description Function used to generate a random string using crypto.randomBytes
 * @param {number} length - Integer representing the length of the required random string
 * @returns {Promise} - Promise object represents the generated random string
 * @throws none
 * @todo can be deprecated
 * 
**/
exports.generateRandomByteHexString = (length) => {
    return new Promise((resolve,reject) => {
        resolve(crypto.randomBytes(Math.ceil(length/2)).toString('hex'))
    })
}

/**
 * 
 * @author Prateek Shukla
 * @description Function used to check if the given date string is valid or not
 * @param {string} dateString - A date string
 * @returns {Boolean} - Boolean value, true represents that the given date string is valid while false represents that it is invalid
 * @throws none
 * @todo none
 * 
**/
exports.isValidDate = (dateString) => {
    // Date format: YYYY-MM-DD
    const datePattern = /^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;

    // Check if the date string format is a match
    const matchArray = dateString.match(datePattern);
    if (matchArray == null) {
        return false;
    }

    // Remove any non digit characters
    let cleanDateString = dateString.replace(/\D/g, ''); 

    // Parse integer values from date string
    let year = parseInt(cleanDateString.substr(0, 4));
    let month = parseInt(cleanDateString.substr(4, 2));
    let day = parseInt(cleanDateString.substr(6, 2));
    
    // Define number of days per month
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Adjust for leap years
    if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)) {
        daysInMonth[1] = 29;
    }

    // check month and day range
    if (month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1]) {
        return false;
    }

    // You made it through!
    return true;
}

/**
 * 
 * @author Prateek Shukla
 * @description Function used to hide certain character in an email
 * @param {string} email - A string representing an email
 * @returns {String} - Same email which was passed but with certain characters replace by '*'s
 * @throws none
 * @todo 1) might need testing for longer emails
 *       2) could add stars to domain name as well
 *       3) might need to validate the email first
 * 
**/
exports.hideEmailAddress = (email) => {
    return email.replace(/(.{2})(.*)(?=@)/,
    (gp1, gp2, gp3) => { 
      for(let i = 0; i < gp3.length; i++) { 
        gp2+= "*"; 
      } return gp2; 
    });
}

/**
 * 
 * @author Prateek Shukla
 * @description Function used to hide certain character in a phone number
 * @param {string} phoneNumber - A string representing an phone number
 * @returns {String} - Same phone number which was passed but with certain characters replace by '*'s
 * @throws none
 * @todo 1) might need testing for phone number with length more or less than 10
 *       2) might need to validate the phone number first
 * 
**/
exports.hidePhoneNumber = (phoneNumber) => {
    return phoneNumber.substr(0,2)+'******'+phoneNumber.substr(-2)
}

/**
 * 
 * @author Prateek Shukla
 * @description Function used to get today's date in mm-dd-yyyy format
 * @param - none
 * @returns {String} - String representing todays date in the required mm-dd-yyyy format
 * @throws none
 * @todo none
 * 
**/
exports.formattedTodaysDate = () => {
    let today = new Date();
    let dd = today.getDate();

    let mm = today.getMonth()+1; 
    let yyyy = today.getFullYear();
    if(dd<10) 
    {
        dd='0'+dd;
    } 

    if(mm<10) 
    {
        mm='0'+mm;
    } 
    today = mm+'-'+dd+'-'+yyyy;
    return today;
}