/**
 *
 * file - error.js - The error handler class
 *
 * @author     Prateek Shukla
 * @version    0.1.0
 * @created    25/11/2021
 * @copyright  Dhi Technologies
 * @license    For use by Dhi Technologies applications
 *
 * @description - Error handler is the common error handler used accorss the server.
 *
 *
 * 25/11/2021 - PS - Created
 * 
**/
const serverErrors = require('../../errors');
const ApplicationError = serverErrors.ApplicationError;

const cn = require('../common')
const today = cn.formattedTodaysDate()
const fs = require('fs')
const Logger= require('../logger');
let logger;
class ErrorHandler {

    async handleError(error) {
        if(!(fs.existsSync(`logs/error_${today}.log`))){
            logger = new Logger()
        }
        //TODO: Divide errors into levels and log accordingly
        await logger.error(
            'Error message from the centralized error-handling component',
            error,
        );
        // await sendMailToAdminIfCritical();
        // await sendEventsToSentry();
    }

    isTrustedError(error) {
        // if (error instanceof ApplicationError) {
        //   return error.isOperational;
        // }
        if(error instanceof ApplicationError) return true;
        return false;
    }
}

module.exports = new ErrorHandler();