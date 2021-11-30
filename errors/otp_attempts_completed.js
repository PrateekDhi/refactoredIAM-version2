const ApplicationError = require("./application_error");

module.exports = class OtpAttemptsCompleted extends ApplicationError{
    constructor(){
        super("Allowed number of otp attempts completed",'otp_attempts_completed', 408, 429);
    }
}