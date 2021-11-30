const ApplicationError = require("./application_error");

module.exports = class BadGateway extends ApplicationError{
    constructor(){
        super("Bad Gateway",'bad_gateway', 502, 502);
    }
}