const ApplicationError = require("./application_error");

module.exports = class MysqlConnectionError extends ApplicationError{
    constructor(){
        super("Mysql connection error occured",'mysql_connection_error', 500, 5151);
    }
}