const numberRegx = /^[0-9]+$/;

exports.validateOTP = (otp) => {
    if(otp.length == 6 && numberRegx.test(otp)) return {valid: true};
    else if(otp.length != 6 && !numberRegx.test(otp)) return {valid: false, error:["Incorrect otp length","OTP is not a numerical string"]};
    else if(otp.length != 6) return {valid: false, error:"Incorrect otp length"}
    return {valid: false, error:"OTP is not a numerical string"}
}

exports.validatePassword = (password) => {
    if(password.length >= 8 && password.length<=16) return {valid:true};
    else if(password.length < 8) return {valid: false, error:"Password too small"}
    return {valid: false, error:"Password too large"}
}