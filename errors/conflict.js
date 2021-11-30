const ApplicationError = require("./application_error");

module.exports = class Conflict extends ApplicationError{
    constructor(){
        super("Conflict",'conflict', 409, 409);
    }
}