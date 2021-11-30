const ApplicationError = require("./application_error");

module.exports = class NoAuthorizationHeader extends ApplicationError{
    constructor(){
        super("Unauthorized request: no authentication given",'no_authorization_header', 401, 415);
    }
}