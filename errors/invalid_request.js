const ApplicationError = require("./application_error");

module.exports = class InvalidRequest extends ApplicationError{
    constructor(){
        super("Invalid request: malformed authorization header",'invalid_request', 400, 485);
    }
}