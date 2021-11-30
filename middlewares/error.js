const cn = require('../utils/common');
const errorHandler = require('../utils/handlers/error');
const definedErrors = require('../errors');
const ApplicationError = definedErrors.ApplicationError;

module.exports = async (err, req, res, next) => {
    if (!res.headersSent) {
        if (err instanceof ApplicationError) res.status(err.status).json(err.getResponseObject());
        else res.status(500).json({code: 500, message: 'Internal server error', name: 'internal_server_error'})
    }
    if (!errorHandler.isTrustedError(err)) {
        next(err);
    }
    await errorHandler.handleError(err);
    // if(err.message) logger.error("Error Message: "+err.message);
    // else logger.error("Error Message: "+err);

    // sendResponse(res, null, err.message || "Internal server error", 500, "internal_server_error", 500);
}