const oauthServer = require('oauth2-server');

const {authenticateInternalRequest} = require('../authorization/api_key');
const {oauthErrorHandler} = require('../middlewares/oauthErrorHandler');
const internalController = require('../controllers/internal');

const Request = oauthServer.Request;
const Response = oauthServer.Response;

module.exports = (router, app) => {
    return router
}