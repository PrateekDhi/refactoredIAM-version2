const ApplicationError = require("./application_error");

module.exports = class Forbidden extends ApplicationError{
    constructor(){
        super("Forbidden",'forbidden', 403, 403);
    }
}