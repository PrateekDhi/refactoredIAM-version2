const ApplicationError = require("./application_error");

module.exports = class InvalidFields extends ApplicationError{
    constructor(){
        super("Invalid fields",'invalid_fields', 400, 452);
    }
}