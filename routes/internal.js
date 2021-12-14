const oauthServer = require('oauth2-server');

const authenticateInternalRequest = require('../authorization/InternalAuth/api_key');
const {oauthErrorHandler} = require('../middlewares/oauthErrorHandler');
const internalController = require('../controllers/internal');
const c = require('../utils/handlers/controller');

const Request = oauthServer.Request;
const Response = oauthServer.Response;

module.exports = (router, app) => {
    //TODO: Change authenticateRequest to a helper function that is imported and used here
    const authenticateRequest = (req,res,next) => {

        const request = new Request(req);
        const response = new Response(res);
    
        return app.oauth.authenticate(request, response)
        .then(token => {
            // console.log(token)
            // req.locals.oauth = {token: token};
            res.locals.oauth = {token: token}; //to pass on the token and its details to the controller function after succesful authorization
            next();
        }).catch(err => {
            if(err instanceof ApplicationError) return next(err);
            let caughtError = new definedErrors.InternalServerError();
            caughtError.setAdditionalDetails(err);
            return next(caughtError);
        });
    }

    router.use(authenticateInternalRequest);

    // router.post('/validateUserToken', authenticateRequest, c(internalController.mobileOTPLogin, (req, res, next) => []));
    // router.post('/addServiceToUserScope', internalController.addServiceToUserScope);
    // router.post('/fetchUserFCMTokens', internalController.fetchUserFCMTokens);
    // router.post('/fetchUserServicesList', internalController.fetchUserServicesList);
    // router.post('/fetchMultipleUsersFCMTokens', internalController.fetchMultipleUsersFCMTokens)
    // router.post('/checkUserEmailExistence', internalController.checkUserEmailExistence);
    // router.post('/fetchUserProfileData', internalController.fetchUserProfileData);
    // router.post('/fetchUsersGeneralData', internalController.fetchUsersGeneralData);
    // router.post('/fetchUsersFullName',internalController.fetchUsersFullName);

    return router
}