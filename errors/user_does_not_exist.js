const ApplicationError = require("./application_error");

module.exports = class UserDoesNotExist extends ApplicationError{
    constructor(){
        super("Username/Email is not registered",'user_does_not_exist', 400, 422);
    }
}