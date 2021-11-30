const ApplicationError = require("./application_error");

module.exports = class UserAlreadyRegistered extends ApplicationError{
    constructor(){
        super("Username/Email taken",'user_already_registered', 400, 422);
    }
}