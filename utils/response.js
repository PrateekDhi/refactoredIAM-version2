/**
 *
 * file - response.js - The http response model
 *
 * @version    0.1.0
 * @created    10/11/2021
 * @copyright  Dhi Technologies
 * @license    For use by dhi Technologies applications
 *
 * Description : This http response model is the model that is used all accross the application for sending a HTTP response.
 *
 *
 * 10/11/2021 - PS - Created
 * 
**/

module.exports = class Response {
    constructor(data, message, internalCode, name, statusCode) {
      this.data = data;
      this.message = message;
      this.internalCode = internalCode;
      this.name = name;
      this.statusCode = statusCode;
    }

    getResponse() {
      const errorJson = {
        'code': this.internalCode,
        'message': this.message,
        'name': this.name,
      }
      let successJson;
      if(this.data == null){
          successJson = {
              'code': this.internalCode,
              'message': this.message
          };
          return this.name !== null ? errorJson : successJson;
      }
      successJson = {
        'code': this.internalCode,
        'message': this.message,
        'data': this.data,
      };
      return this.name !== null ? errorJson : successJson;
    }
}  