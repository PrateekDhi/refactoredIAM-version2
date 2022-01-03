const ApplicationError = require("./application_error");

module.exports = class InvalidRequestContents extends ApplicationError{
    constructor(){
        super("Invalid request contents",'invalid_request_contents', 422, 422);
    }
}