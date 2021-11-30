const ApplicationError = require("./application_error");

module.exports = class IncorrectCredentials extends ApplicationError{
    constructor(){
        super("Incorrect credentials given",'invalid_credentials', 401, 455);
    }
}