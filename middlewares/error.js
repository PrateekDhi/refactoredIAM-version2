const cn = require('../utils/common');
const logger = require('../logs/logger').createLogger;
const sendResponse = require('../utils/common').sendResponse;

module.exports = (err, req, res, next) => {
    if(err.message) logger.error("Error Message: "+err.message);
    else logger.error("Error Message: "+err);

    sendResponse(res, null, err.message || "Internal server error", 500, "internal_server_error", 500);
}