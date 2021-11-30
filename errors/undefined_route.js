const ApplicationError = require("./application_error");

module.exports = class UndefinedRoute extends ApplicationError{
    constructor(){
        super("Not Found",'undefined_route', 404, 404);
    }
}