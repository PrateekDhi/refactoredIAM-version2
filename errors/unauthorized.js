const ApplicationError = require("./application_error");

module.exports = class Unauthorized extends ApplicationError{
    constructor(){
        super("Unauthorized",'unauthorized', 401, 401);
    }
}