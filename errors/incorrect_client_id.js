const ApplicationError = require("./application_error");

module.exports = class IncorrectClientId extends ApplicationError{
    constructor(){
        super("Incorrect client id given",'incorrect_client', 401, 4550);
    }
}