const ApplicationError = require("./application_error");

module.exports = class Gone extends ApplicationError{
    constructor(){
        super("Entity expired",'gone', 410, 410);
    }
}