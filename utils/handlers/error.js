const serverErrors = require('../../errors');
const logger = require('../logger');

const ApplicationError = serverErrors.ApplicationError;

class ErrorHandler {
    static async handleError(error) {
        //TODO: Divide errors into levels and log accordingly
        await logger.error(
            'Error message from the centralized error-handling component',
            error,
        );
        // await sendMailToAdminIfCritical();
        // await sendEventsToSentry();
    }

    static isTrustedError(error) {
        // if (error instanceof ApplicationError) {
        //   return error.isOperational;
        // }
        if(error instanceof ApplicationError) return true;
        return false;
    }
}

export const errorHandler = new ErrorHandler();