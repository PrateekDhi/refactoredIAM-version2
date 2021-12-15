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

const logger= require('../logger');
class ErrorHandler {

    async handleError(error) {
        // delete error.type;
        // console.log('--------------------------')
        // console.log(error.type)
        switch(error.type){
            case 'trace':
                await logger.trace(
                    'Trace message from the centralized error-handling component',
                    error,
                )
            break;

            case 'debug':
                await logger.debug(
                    'Debug message from the centralized error-handling component',
                    error,
                )
            break;

            case 'info':
                await logger.info(
                    'Info message from the centralized error-handling component',
                    error,
                )
            break;

            case 'warn':
                await logger.warn(
                    'Warning message from the centralized error-handling component',
                    error,
                )
            break;

            case 'fatal':
                //TODO: Send mail for fatal errors
                await logger.fatal(
                    'Fatal message from the centralized error-handling component',
                    error,
                )
            break;

            default:
                await logger.error(
                    'Error message from the centralized error-handling component',
                    error,
                )
        }
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