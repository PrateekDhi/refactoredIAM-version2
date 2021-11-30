// const validationMiddleware = require('../middlewares/validationMiddleware');

const userController = require('../controllers/user');
const authController = require('../controllers/auth');
const c = require('../utils/handlers/controller');

//Services
const userService = require('../services/user');
const clientService = require('../services/client');

//Response model
const Response = require('../utils/response');

//Errors
const definedErrors = require('../errors');
const ApplicationError = definedErrors.ApplicationError;

module.exports = (router, app) => {
    // router.use(validationMiddleware)

    //User registration details(Registration STEP 1) Route
    //TODO: Validation for client id and service
    router.post('/userRegistrationDetails', c(authController.userRegistrationDetails, (req, res, next) => [req.body.firstName,req.body.lastName,req.body.email,req.body.password,req.body.countryCode,req.body.phoneNumber,req.body.client_id,req.body.service]));
    
    //Username suggestion for users who are not logged in Route
    router.post('/usernameSuggestion', c(authController.usernameSuggestion, (req, res, next) => []));

    //User login details(Login STEP 1) Route
    router.post('/userLoginDetails',
    (req, res, next) => {
        clientService.checkClientExistenceById(req.body.client_id)
        .then(exists => {
            if(exists) return next();
            throw new Error('Incorrect Client Id');
        })
        .catch(err => {
            if(err instanceof ApplicationError) return next(err);
            let caughtError;
            if(err.message == 'Incorrect Client Id'){
                caughtError = new definedErrors.IncorrectClientId();
                caughtError.setAdditionalDetails("Incorrect client id in request body during /userLoginDetails");
                return next(caughtError);
            }
            caughtError = new definedErrors.InternalServerError();
            caughtError.setAdditionalDetails(error);
            return next(caughtError);
        })
    },
    (req, res, next) => {
        //TODO: This has to be done later via validation middleware
        if(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(req.body.username)) req.isEmail = true; //checking if the field is an email address
        else req.isEmail = false;
        next();
    },
    (req, res, next) => {
        //TODO: This has to be done later via validation middleware
        //Optimization - We can create a separate service function which only gets the count of users by email
        // next();
        if(req.isEmail){
            userService.findUserByEmailAddress(req.body.username.toLowerCase())
            .then(fuReturnValue => {
                if(fuReturnValue.present) return next();
                throw new Error('unregistered_email');
                // else{
                //     const response = new Response(null,"User login details verification failed", 400, "unregistered_email", 400)
                //     res.status(response.statusCode).json(response.getResponse());
                // }
            })
            .catch(err => {
                if(err instanceof ApplicationError) return next(err);
                let caughtError;
                if(err.message == 'unregistered_email'){
                    caughtError = new definedErrors.UserDoesNotExist();
                    caughtError.setAdditionalDetails("Unregistered email in request body during /userLoginDetails");
                    return next(caughtError);
                }
                caughtError = new definedErrors.InternalServerError();
                caughtError.setAdditionalDetails(error);
                return next(caughtError);
            })
        }else{
            userService.findUserByUsername(req.body.username)
            .then(fuReturnValue => {
                if(fuReturnValue.present) next();
                throw new Error('unregistered_username');
            })
            .catch(err => {
                if(err instanceof ApplicationError) return next(err);
                let caughtError;
                if(err.message == 'unregistered_username'){
                    caughtError = new definedErrors.UserDoesNotExist();
                    caughtError.setAdditionalDetails("Unregistered username in request body during /userLoginDetails");
                    return next(caughtError);
                }
                caughtError = new definedErrors.InternalServerError();
                caughtError.setAdditionalDetails(error);
                return next(caughtError);
            })
        }
    },
    c(authController.userLoginDetails, (req, res, next) => [req.body.client_id,req.body.username,req.body.service,req.isEmail]));

    //Resend email otp Route
    router.post('/resendEmailOTP',
    (req, res, next) => {
        clientService.checkClientExistenceById(req.body.client_id)
        .then(exists => {
            if(exists) return next();
            throw new Error('Incorrect Client Id');
        })
        .catch(error => {
            if(err instanceof ApplicationError) return next(err);
            let caughtError;
            if(error.message == "Incorrect Client Id"){
                caughtError = new definedErrors.IncorrectClientId();
                caughtError.setAdditionalDetails("Incorrect client id sent in body during /mobileOTPLogin");
                return next(caughtError);
            }
            caughtError = new definedErrors.InternalServerError();
            caughtError.setAdditionalDetails(error);
            return next(caughtError);
        })
    }, 
    c(authController.resendEmailOTP, (req, res, next) => [req.body.otpId]));

    //Mobile OTP Login Route
    router.post('/mobileOTPLogin',
    (req, res, next) => {
        clientService.checkClientExistenceById(req.body.client_id)
        .then(exists => {
            if(exists) return next();
            throw new Error('Incorrect Client Id');
        })
        .catch(error => {
            if(err instanceof ApplicationError) return next(err);
            let caughtError;
            if(error.message == "Incorrect Client Id"){
                caughtError = new definedErrors.IncorrectClientId();
                caughtError.setAdditionalDetails("Incorrect client id sent in body during /mobileOTPLogin");
                return next(caughtError);
            }
            caughtError = new definedErrors.InternalServerError();
            caughtError.setAdditionalDetails(error);
            return next(caughtError);
        })
    },
    (req, res, next) => {
        //TODO: This has to be done later via validation middleware
        if(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(req.body.username)) req.isEmail = true; //checking if the field is an email address
        else req.isEmail = false;
        next();
    },
    (req, res, next) => {
        //TODO: This has to be done later via validation middleware
        //Optimization - We can create a separate service function which only gets the count of users by email
        if(req.isEmail){
            userService.findUserByEmailAddress(req.body.username.toLowerCase())
            .then(fuReturnValue => {
                if(fuReturnValue.present) next();
                else throw new Error("Unregistered user")
            })
            .catch(err => {
                if(err instanceof ApplicationError) return next(err);
                let caughtError;
                if(error.message == "Unregistered user"){
                    caughtError = new definedErrors.UserDoesNotExist();
                    caughtError.setAdditionalDetails("Unregistered email in request body during /mobileOTPLogin");
                    return next(caughtError);
                }
                caughtError = new definedErrors.InternalServerError();
                caughtError.setAdditionalDetails(error);
                return next(caughtError);
                // const response = new Response(null,"User registration details addition failed", 500, "internal_server_error", 500)
                // res.status(response.statusCode).json(response.getResponse());
                // throw new Error(err);
            })
        }else{
            userService.findUserByUsername(req.body.username)
            .then(fuReturnValue => {
                if(fuReturnValue.present) next();
                else throw new Error("Unregistered user")
            })
            .catch(err => {
                if(err instanceof ApplicationError) return next(err);
                let caughtError;
                if(err == "Unregistered user"){
                    caughtError = new definedErrors.UserDoesNotExist();
                    caughtError.setMessage("Unregistered username in request body during /mobileOTPLogin")
                    return next(caughtError);
                }
                caughtError = new definedErrors.InternalServerError();
                caughtError.setAdditionalDetails(error);
                return next(caughtError);
                // const response = new Response(null,"User registration details addition failed", 500, "internal_server_error", 500)
                // res.status(response.statusCode).json(response.getResponse());
                // throw new Error(err);
            })
        }
    },c(authController.mobileOTPLogin, (req, res, next) => [req.body.username]));

    //
    router.post('/resendPhoneOTP', authController.resendPhoneOTP);

    router.post('/resetPasswordEmail', authController.resetPasswordEmail);

    router.post('/setNewPassword', authController.setNewPassword);


    router.post('/userRegistrationDetails', authController.userRegistrationDetails);
    router.post('/usernameSuggestion', userController.usernameSuggestion);
    router.post('/userLoginDetails',authController.userLoginDetails);
    router.post('/mobileOTPLogin',authController.mobileOTPLogin);
    router.post('/resendPhoneOTP', authController.resendPhoneOTP);

    router.post('/resetPasswordEmail', authController.resetPasswordEmail);

    router.post('/setNewPassword', authController.setNewPassword);

    // router.post('/androidVersionCheck',authController.androidVersionCheck);

    // router.post('/updationAndroidVersionCheck',authController.updationAndroidVersionCheck);

    // router.get('/deleteTestUser',userController.deleteTestUser);

    return router
}