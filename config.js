/**
 *
 * file - config.js - The main configuration file
 *
 * @version    0.1.0
 * @created    10/11/2021
 * @copyright  Dhi Technologies
 * @license    For use by dhi Technologies applications
 *
 * Description : This file's main purpose is to make sure that the values global 
 * values received are in the correct type when picked up from enviornment variables.
 *
 *
 * 16/11/2021 - PS - Created
 * 
**/

module.exports = {
    config_id: process.env.CONFIG_ID,
    server_ip: process.env.HOST,
    server_port: process.env.PORT,
    app: {
        domainName:process.env.DOMAIN_NAME,
        serverIp:process.env.SERVER_IP,
        ip:process.env.IP,
        port: parseInt(process.env.PORT)
    },
    app_db: {
        connectionLimit : parseInt(process.env.MYSQL_CONNECTION_LIMIT),
        host     : process.env.MYSQL_HOST,
        user     : process.env.MYSQL_USER,
        password : process.env.MYSQL_PASS,
        database : process.env.MYSQL_DB_NAME,
        debug    : process.env.MYSQL_DEBUG_OPTION,
        waitForConnections : process.env.MYSQL_WAIT_FOR_CONNECTIONS_OPTION,
        queueLimit : parseInt(process.env.MYSQL_QUEUE_LIMIT)
    },
    server_link: process.env.SERVER_LINK,
    email_gateway_api_key: process.env.EMAIL_GATEWAY_API_KEY,
    sms_gateway:{
        user_name: process.env.SMS_GATEWAY_USERNAME,
        api_key: process.env.SMS_GATEWAY_API_KEY,
        sender_id: process.env.SMS_GATEWAY_SENDER_ID
    },
    payment_gateway:{
        hostname: process.env.PAYMENT_GATEWAY_HOSTNAME,
        path: process.env.PAYMENT_GATEWAY_PATH,
        client_id: process.env.PAYMENT_GATEWAY_CLIENT_ID,
        client_secret: process.env.PAYMENT_GATEWAY_CLIENT_SECRET
    },
    recovery_token_encryption_key:{ 
        kty: process.env.RECOVERY_TOKEN_ENCRIPTION_KEY_KTY,
        kid: process.env.RECOVERY_TOKEN_ENCRIPTION_KEY_ID,
        alg: process.env.RECOVERY_TOKEN_ENCRIPTION_KEY_ALG,
        k: process.env.RECOVERY_TOKEN_ENCRIPTION_KEY
    },
    iam_server_details:{
        protocol: process.env.IAM_SERVER_PROTOCOL,
        host: process.env.IAM_SERVER_HOST,
        port: process.env.IAM_SERVER_PORT,
        apiKey: process.env.IAM_SERVER_APIKEY
    },
    bcrypt:{
        password_salt_rounds: parseInt(process.env.PASSWORD_SALT_ROUNDS)
    },
    app_url: process.env.APP_URL,
    group_invitation_code_link:{
        path: process.env.GROUP_INVITATION_CODE_LINK_PATH,
        param_key: process.env.GROUP_INVITATION_CODE_LINK_PARAM_KEY
    },
    email_otp: {
        validity_duration: parseInt(process.env.EMAIL_OTP_VALIDITY_DURATION)
    }
}