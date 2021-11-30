const ApplicationError = require("./application_error");

module.exports = class IncorrectPassword extends ApplicationError{
    constructor(){
        super("Incorrect password given",'invalid_password', 401, 455);
    }
}