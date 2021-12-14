const fs = require('fs');
const oauthServer = require('oauth2-server');

const Request = oauthServer.Request;
const Response = oauthServer.Response;

const userController = require('../controllers/user');
const cn = require('../utils/common');

//Errors
const definedErrors = require('../errors');
const ApplicationError = definedErrors.ApplicationError;

const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // console.log(req.originalUrl)
        if(req.originalUrl == '/restricted/updateProfile'){
            let dest = 'uploads/';
            let stat = null;
            try {
                stat = fs.statSync(dest);
            } catch (err) {
                fs.mkdirSync(dest);
            }
            if (stat && !stat.isDirectory()) {
                cb('Directory cannot be created because an inode of a different type exists at "' + dest + '"');
            }else{
                cb(null, dest)
            }
        }else if(req.originalUrl == '/restricted/testOTAUpdationProcess'){
            // console.log('------------------------------------------')
            // console.log(req.body)
            // console.log('------------------------------------------')
            let dest = 'tempUploads/';
            let stat = null;
            try {
                stat = fs.statSync(dest);
            } catch (err) {
                fs.mkdirSync(dest);
            }
            if (stat && !stat.isDirectory()) {
                cb('Directory cannot be created because an inode of a different type exists at "' + dest + '"');
            }else{
                cb(null, dest)
            }
        }
    },
    filename: (req, file, cb) => {
        if(req.originalUrl == '/restricted/updateProfile'){
            sub = cn.generateRandomString(6) + Date.now(); 
            cb(null, sub + file.originalname);
        }else{
            // console.log(req.body.model+req.body.versionNumber)
            cb(null,file.originalname)
        }
    }
})
const fileFilter = (req, file, cb) => {
    // console.log(file.mimetype)
    if(file.mimetype === 'image/jpeg' || file.mimetype == 'image/png' || file.mimetype == 'text/plain' || file.mimetype == 'application/octet-stream'){
        cb(null,true);
    }else{
        cb("Invalid file type",false);
    }
};
const upload = multer({
    storage:storage, 
    limits:{
        fileSize: 1024 * 1024 * 10
    },
    fileFilter:fileFilter
});
//OLD IMPLEMENTATION(DOES NOT SUPPORT OTA)
// const multer = require('multer');
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/')
//     },
//     filename: (req, file, cb) => {
//         sub = cn.generateRandomString(6) + Date.now(); 
//         cb(null, sub + file.originalname);
//     }
// })
// const fileFilter = (req, file, cb) => {
//     if(file.mimetype === 'image/jpeg' || file.mimetype == 'image/png' || file.mimetype == 'text/plain'){
//         cb(null,true);
//     }else{
//         cb("Invalid file type",false);
//     }
// };
// const upload = multer({
//     storage:storage, 
//     limits:{
//         fileSize: 1024 * 1024 * 10
//     },
//     fileFilter:fileFilter
// });
// const validationMiddleware = require('../middlewares/validationMiddleware')
module.exports =  (router, app) => {

    //route for entering into the restricted area.
    // router.post('/enter',  app.oauth.authenticate(), restrictedController.test)
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

    // router.post('/usernameSuggestion',authenticateRequest, oauthErrorHandler, userController.usernameSuggestion);
    // router.post('/createUsername',authenticateRequest, oauthErrorHandler, userController.createUsername); //TODO: Add validation middleware
    // router.post('/phoneNumberVerificationOTPRequest',authenticateRequest, oauthErrorHandler, userController.phoneNumberVerificationOTPRequest);
    // router.post('/phoneNumberOTPValidation',authenticateRequest, oauthErrorHandler, userController.phoneNumberOTPValidation); //TODO: Add validation middleware
    // router.post('/resendPhoneOTP',authenticateRequest, oauthErrorHandler, userController.resendPhoneOTP); //TODO: Add validation middleware
    // router.post('/fetchAvatars',authenticateRequest, oauthErrorHandler, userController.fetchAvatars);
    // router.post('/updateProfile',authenticateRequest, oauthErrorHandler, upload.single('profilePhoto'), userController.updateProfile); //TODO: Add validation middleware
    // router.post('/fetchProfile',authenticateRequest, oauthErrorHandler, userController.fetchProfile);
    // router.post('/logoutUser',authenticateRequest, oauthErrorHandler, userController.logoutUser);
    // router.post('/changePassword', authenticateRequest, oauthErrorHandler, userController.changePassword); //TODO: Add validation middleware
    // router.post('/downloadPhoto',authenticateRequest,userController.downloadPhoto);

    const aOptions = {
        // Allow token requests using the password grant to not include a client_secret.
        allowEmptyState: true,
        authenticateHandler: {
            handle: (request, response) => {
                // console.log(response)
                return response.locals.oauth.token.user;
            }
        }
    };

    const authorizeHandler = (req,res,next) => {
        // console.log(req.query);
        let request = new Request(req);
        let response = new Response(res);
        return app.oauth.authorize(request, response, aOptions)
        .then(code => {
            res.locals.oauth = {code: code};
            res.json(res.locals.oauth.code);
        })
        .catch(err => {
            // handle error condition
            // delete err.statusCode
            if(err.internalCode != null){
                // delete err.statusCode; //same as code
                delete err.status; //same as code
                delete err.code;
                let responseError = {...err}
                responseError.code = responseError.internalCode;
                delete responseError.internalCode;
                delete responseError.statusCode
                res.status(err.statusCode || 500).json(responseError);
            }else{
                res.locals.errObject = err;
                next();
            }
        });
    }

    // router.get('/authorize', authenticateRequest, authorizeHandler, oauthErrorHandler)

    
    // router.post('/authorize', authenticateRequest, (req, res, next) => {
    //     const options = {
    //         authenticateHandler: {
    //             handle: (data) => {
    //                 console.log(data)
    //                 console.log(res.locals.oauth.token.user)
    //                 // Whatever you need to do to authorize / retrieve your user from post data here
    //                 return res.locals.oauth.token.user 
    //             }
    //         }
    //     }
    //     // Include options to override
    //     app.oauth.authorize(request, response, options);
    // })
    return router;
}