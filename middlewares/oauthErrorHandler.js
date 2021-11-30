module.exports.oauthErrorHandler = (req, res, next) => {
    const errObject = res.locals.errObject;

    if(errObject){
        if(errObject.name == 'invalid_argument'){
            // delete err.statusCode; //same as code
            delete errObject.status; //same as code
            let responseError = {...errObject};
            responseError.code = 430;
            delete responseError.statusCode;
            res.status(errObject.statusCode || 500).json(responseError);
        }else if(errObject.name == 'invalid_request'){// no token provide and also when bearer is not written
            // delete err.statusCode; //same as code
            delete errObject.status; //same as code
            let responseError = {...errObject};
            responseError.code = 485;
            delete responseError.statusCode;
            res.status(errObject.statusCode || 500).json(responseError);
        }else if(errObject.name == 'invalid_client'){
            // delete err.statusCode; //same as code
            delete errObject.status; //same as code
            let responseError = {...errObject};
            responseError.code = 431;
            delete responseError.statusCode;
            res.status(errObject.statusCode || 500).json(responseError);
        }else if(errObject.name == 'server_error'){
            // delete err.statusCode; //same as code
            delete errObject.status; //same as code
            let responseError = {...errObject};
            responseError.code = 500;
            responseError.name = "internal_"+responseError.name;
            delete responseError.statusCode;
            res.status(errObject.statusCode || 500).json(responseError);
    
        }else if(errObject.name == 'unsupported_grant_type'){
            // delete err.statusCode; //same as code
            delete errObject.status; //same as code
            let responseError = {...errObject};
            responseError.code = 432;
            delete responseError.statusCode;
            res.status(errObject.statusCode || 500).json(responseError);
        }else if(errObject.name == 'unauthorized_client'){
            // delete err.statusCode; //same as code
            delete errObject.status; //same as code
            let responseError = {...errObject};
            responseError.code = 433;
            delete responseError.statusCode;
            res.status(errObject.statusCode || 500).json(responseError);
    
        }else if(errObject.name == 'unsupported_response_type'){
            // delete err.statusCode; //same as code
            delete errObject.status; //same as code
            let responseError = {...errObject};
            responseError.code = 434;
            delete responseError.statusCode;
            res.status(errObject.statusCode || 500).json(responseError);
    
        }else if(errObject.name == 'invalid_scope'){
            // delete err.statusCode; //same as code
            delete errObject.status; //same as code
            let responseError = {...errObject};
            responseError.code = 435;
            delete responseError.statusCode;
            res.status(errObject.statusCode || 500).json(responseError);
    
        }else if(errObject.name == 'invalid_token'){// when token expired
            // delete err.statusCode; //same as code
            delete errObject.status; //same as code
            errObject.statusCode = 410;
            let responseError = {...errObject};
            responseError.code = 410;
            responseError.name = "gone";
            delete responseError.statusCode;
            res.status(errObject.statusCode || 500).json(responseError);
    
        }else if(errObject.name == 'unauthorized_request'){// when no authorization is given same for empty authorization value
            // delete err.statusCode; //same as code
            delete errObject.status; //same as code
            let responseError = {...errObject};
            responseError.code = 415;
            responseError.name = "no_authorization_header";
            delete responseError.statusCode;
            res.status(errObject.statusCode || 500).json(responseError);
    
        }else if(errObject.name == 'insufficient_scope'){
            // delete err.statusCode; //same as code
            delete errObject.status; //same as code
            let responseError = {...errObject};
            responseError.code = 436;
            delete responseError.statusCode;
            res.status(errObject.statusCode || 500).json(responseError);
    
        }else {
            // delete err.statusCode; //same as code
            delete errObject.status; //same as code
            let responseError = {...errObject};
            responseError.code = 500;
            responseError.name = "internal_server_error";
            delete responseError.statusCode;
            res.status(errObject.statusCode || 500).json(responseError);
        }
    }else next();  
}