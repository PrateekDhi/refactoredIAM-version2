const oauthServer = require('oauth2-server');
const { ApplicationError } = require('../errors');

const {oauthErrorHandler} = require('../middlewares/oauthErrorHandler');

const Request = oauthServer.Request;
const Response = oauthServer.Response;

module.exports = (router, app) => {
    const manageAuthenticationGrantType = (req,res,next) => {
        if(req.body.grant_type == 'mobile_otp'){
            req.body.username = 'mobile-'+req.body.username
            req.body.grant_type = 'password';
            next();
        }else if(req.body.grant_type == 'email_otp'){
            req.body.username = 'email-'+req.body.username
            req.body.grant_type = 'password';
            next();
        }else if(req.body.grant_type == 'password'){ //to be changed later
            req.body.username = 'password-'+req.body.username
            next();
        }else if(req.body.grant_type == 'authentication_code'){
            req.body.username = 'code-'+req.body.username
            next();
        }else{
            res
            .status(400)
            .json({"code":452,"message":"Invalid grant type","name":"invalid_fields"});//fields_missing
        }
    }

    const manageRefreshTokenRequest = (req,res,next) => {
        if(req.body.grant_type == 'refresh_token' && req.body.refresh_token != null && req.body.client_id != null){
            next();
        }else{
            res
            .status(400)
            .json({"code":452,"message":"Invalid grant type","name":"invalid_fields"});
        }
    }

    const tOptions = {
        // Allow token requests using the password grant to not include a client_secret.
        requireClientAuthentication: {password: false, refresh_token:false}
    };

    const obtainToken = (req, res, next) => {        
        const request = new Request(req);
        const response = new Response(res);
        return app.oauth.token(request, response, tOptions)
        .then(token => {
            res.json(token);
        }).catch(err => {
            /** @description Have to specifically send err.inner because the complete error includes the error instance sent by oauth-server library**/
            next(err.inner);
            // console.log("--jjfjkfjkffofj=----")
            // console.log("----obtainToken error-----"+err)
            // delete err.statusCode
            // if(err.internalCode != null){
            //     // delete err.statusCode; //same as code
            //     // delete err.status; //same as code
            //     // delete err.code;
            //     // let responseError = {...err}
            //     // responseError.code = responseError.internalCode;
            //     // delete responseError.internalCode;
            //     // delete responseError.statusCode
            //     // res.status(err.statusCode || 500).json(responseError);
            // }else{
            //     res.locals.errObject = err;
            //     next();
            // }
        });
    }
    
    // router.post('/getAccessToken', manageAuthenticationGrantType, obtainToken, oauthErrorHandler); //TODO: Add validation middleware
    router.post('/getAccessToken', manageAuthenticationGrantType, obtainToken);

    // router.post('/refreshToken', manageRefreshTokenRequest, obtainToken,  oauthErrorHandler); //TODO: Add validation middleware
    router.post('/refreshToken', manageRefreshTokenRequest, obtainToken);

    return router;
}