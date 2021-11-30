const ApplicationError = require("./application_error");

module.exports = class DatabaseServerError extends ApplicationError{
    constructor(){
        super("Database server error",'database_server_error', 503, 503);
    }
}