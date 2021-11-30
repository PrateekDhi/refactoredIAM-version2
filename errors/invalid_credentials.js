const ApplicationError = require("./application_error");

module.exports = class InvalidCredentials extends ApplicationError{
    constructor(){
        super("Invalid credentials",'invalid_credentials', 401, 454);
    }
}