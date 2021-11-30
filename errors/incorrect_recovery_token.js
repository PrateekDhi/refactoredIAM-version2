const ApplicationError = require("./application_error");

module.exports = class IncorrectRecoveryToken extends ApplicationError{
    constructor(){
        super("Incorrect recovery token given",'incorrect_recovery_token', 401, 457);
    }
}