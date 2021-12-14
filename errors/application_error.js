class ApplicationError extends Error{
    constructor(message, name, status, internalCode, errors){
        super();
        Error.captureStackTrace(this, this.constructor);
        this.name = name || 'internal_server_error';
        this.message = message || "Internal Server Error";
        this.status = status || 500;
        this.internalCode = internalCode || 500;
        errors != null ? this.errors = errors : null;
        this.additionalDetails = null;
        this.type = 'error';
    }
    
    getResponseObject() {
        const responseObj = {};
        responseObj.code = this.internalCode;
        responseObj.message = this.message;
        responseObj.name = this.name;
        responseObj.errors = this.errors;
        return responseObj;
    }

    setMessage(message) {
        this.message = message;
    }

    setErrors(errorsArray) {
        this.errors = errorsArray;
    }

    setAdditionalDetails(additionalDetails) {
        if(additionalDetails instanceof Error) this.additionalDetails = additionalDetails.message;
        else this.additionalDetails = additionalDetails;
    }

    setType(type) {
        console.log(type)
        if(['trace','debug','info','warn','fatal','error'].includes(type)) this.type = type;
    }
}

module.exports = ApplicationError;