const ApplicationError = require("./application_error");

module.exports = class InvalidRecoveryToken extends ApplicationError{
    constructor(){
        super("Invalid recovery token",'invalid_recovery_token', 401, 457);
    }
}