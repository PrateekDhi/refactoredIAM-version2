exports.ApplicationError = require('./application_error');
exports.BadGateway = require('./bad_gateway');
exports.Conflict = require('./conflict');
exports.DatabaseServerError = require('./database_server_error');
exports.FieldsMissing = require('./fields_missing');
exports.Forbidden = require('./forbidden');
exports.Gone = require('./gone');
exports.IncorrectClientId = require('./incorrect_client_id')
exports.IncorrectCredentials = require('./incorrect_credentials');
exports.IncorrectPassword = require('./incorrect_password');
exports.IncorrectRecoveryToken = require('./incorrect_recovery_token');
exports.InternalServerError = require('./internal_server_error');
exports.InvalidCredentials = require('./invalid_credentials');
exports.InvalidFields = require('./invalid_fields');
exports.InvalidRecoveryToken = require('./invalid_recovery_token');
exports.InvalidRequest = require('./invalid_request');
exports.NoAuthorizationHeader = require('./no_authorization_header');
exports.OtpAttemptsCompleted = require('./otp_attempts_completed');
exports.PhoneNumberNotVerified = require('./phone_not_verified');
exports.Unauthorized = require('./unauthorized');
exports.UndefinedRoute = require('./undefined_route');
exports.UserAlreadyRegistered = require('./user_already_registered');
exports.UserDoesNotExist = require('./user_does_not_exist');

// //Divisions of error
// exports.fatalErrors = [InternalServerError,DatabaseServerError]

