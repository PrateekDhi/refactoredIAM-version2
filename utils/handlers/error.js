const serverErrors = require('../../errors');
const logger = require('../logger');

const ApplicationError = serverErrors.ApplicationError;

class ErrorHandler {
    async handleError(error) {
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