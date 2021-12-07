exports.manageAuthenticationGrantType = (req, res, next) => {
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

exports.manageRefreshTokenRequest = (req, res, next) => {
    if(req.body.grant_type == 'refresh_token' && req.body.refresh_token != null && req.body.client_id != null){
        next();
    }else{
        res
        .status(400)
        .json({"code":452,"message":"Invalid grant type","name":"invalid_fields"});
    }
}

exports.obtainToken = (req, res, next) => {
    
}