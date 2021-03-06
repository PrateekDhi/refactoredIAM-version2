/**
 *
 * file - controller.js - The controller handler function
 *
 * @version    0.1.0
 * @created    10/11/2021
 * @copyright  Dhi Technologies
 * @license    For use by Dhi Technologies applications
 *
 * @description - Controller handler is the common handler used by all routes.
 *
 *
 * 10/11/2021 - PS - Created
 * 
**/

const controllerHandler = (promise, params) => async (req, res, next) => {
    // console.log(promise)
    // console.log(params)
    const boundParams = params ? params(req, res, next) : [];
    // console.log(boundParams)
    try {
      // console.log('Starting to await promise')
      const result = await promise(...boundParams);
      // console.log(result);
      // return result;
      return res.status(200).json(result || { code: 200, message: 'OK' });
    } catch (error) {
      next(error);
      // console.log(error instanceof Error)
      // if(error instanceof Error) console.log(error);
      // const returnError = error instanceof Error ? {code: 500, message: 'Internal server error', name: 'internal_server_error'} : error;
      // return res.status(error.code || 500).json(returnError || { code: 500, message: 'Internal server error', name: 'internal_server_error'});
    }
};

module.exports = controllerHandler;