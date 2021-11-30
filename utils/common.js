const crypto = require('crypto')

exports.generateOTP = () => {

    const digits = "0123456789";

    let OTP = '';
    for(let i=0; i<6; i++){
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

exports.allNullOrEmpty = (object) => {
    const isEmptyOrNull = Object.values(object).every(x => (x == null || x == ''));
    return isEmptyOrNull
}

exports.generateRandomString = (length) => {
    let result           = '';
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

exports.generateRandomNumberString = (length) => {
    let result           = '';
    const characters       = '0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

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

exports.mergeTwoStringArraysWithourDuplicates = (array1,array2) => {
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

exports.generateRandomByteHexString = (length) => {
    return new Promise((resolve,reject) => {
        resolve(crypto.randomBytes(Math.ceil(length/2)).toString('hex'))
    })
}
 
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

exports.hideEmailAddress = (email) => {
    return email.replace(/(.{2})(.*)(?=@)/,
    (gp1, gp2, gp3) => { 
      for(let i = 0; i < gp3.length; i++) { 
        gp2+= "*"; 
      } return gp2; 
    });
}

exports.hidePhoneNumber = (phoneNumber) => {
    return phoneNumber.substr(0,2)+'******'+phoneNumber.substr(-2)
}

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

exports.sendResponse = (res, data, message, internalCode, name, statusCode) => { //name denotes presence of error, it signifies type of error
    const errorJson = {
        'code': internalCode,
        'message': message,
        'name': name,
    }
    let successJson = {
        'code': internalCode,
        'message':message
    }
    if(data == null){
        res
        .status(statusCode)
        .json(name !== null ? errorJson : successJson);
    }else{
        successJson = {
            'code':internalCode,
            'message':message,
            'data':data,
        }
        res
        .status(statusCode)
        .json(name !== null ? errorJson : successJson);
    }
}