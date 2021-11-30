const ApplicationError = require("./application_error");

module.exports = class InternalServerError extends ApplicationError{
    constructor(){
        super("Internal server error",'internal_server_error', 500, 500);
    }
}