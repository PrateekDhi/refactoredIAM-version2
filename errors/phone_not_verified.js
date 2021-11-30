const ApplicationError = require("./application_error");

module.exports = class PhoneNumberNotVerified extends ApplicationError{
    constructor(){
        super("Phone number not verified yet",'phone_not_verified', 401, 459);
    }
}