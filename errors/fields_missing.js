const ApplicationError = require("./application_error");

module.exports = class FieldsMissing extends ApplicationError{
    constructor(){
        super("Fields missing",'fields_missing', 400, 400);
    }
}