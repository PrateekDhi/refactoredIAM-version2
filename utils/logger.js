/**
 *
 * file - logger.js - The file that is used to handle logs
 *
 * @author     Nikita Kriplani
 * @version    0.1.0
 * @created    25/11/2021
 * @copyright  Dhi Technologies
 * @license    For use by Dhi Technologies applications
 *
 * @description - All logging related functionalities are handled in this file
 *
 * Unknown    - NK - Created
 * 25/11/2021 - PS - Updated
 * 
**/
const winston = require('winston');
const config = require('../config');

const cn = require('./common');

const today = cn.formattedTodaysDate()

/**@description - Used to define custom error levels and color patterns for each level**/
const customLevels = {
    levels: {
      trace: 5,
      debug: 4,
      info:  3,
      warn:  2,
      error: 1,
      fatal: 0
    },
    colors: {
      trace: 'white',
      debug: 'green',
      info: 'green',
      warn: 'yellow',
      error: 'red',
      fatal: 'red'
    },
};

/**@description - Used to define custom error levels and color patterns for each level**/
const fileFormatter = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.splat(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    return `${timestamp} [${level}]: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    }`;
  }),
);

const consoleFormatter = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.splat(),
    winston.format.printf((info) => {
      const { timestamp, level, message, ...meta } = info;
    
      return `${timestamp} [${level}]: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
      }`;
    }),
);

/**
 * 
 * @class
 * @description - The logger class is responsible for defining file transport, console transport, creating the logger, configuring it and defining the functions that can be used 
 * according to different types of errors(or otherwise) that are to be logged by the logger
 * @todo Check why new log files are not created while the server is running already, since we need to created log file on daily basis.
 * 
 */
class Logger {    
    constructor() {
      const saveToFileTransport = new winston.transports.File({
        format: fileFormatter,
        filename: `logs/error_${today}.log`,
        level: 'error',
      });
      const consoleLogTransport = new winston.transports.Console({
        format: consoleFormatter,
      });
      let transports;
      if(config.node_env === 'production') transports = [saveToFileTransport];
      else if(config.node_env === 'development') transports = [consoleLogTransport,saveToFileTransport];
      else transports = [consoleLogTransport]
      this.logger = winston.createLogger({
        level: config.node_env !== 'production' ? 'trace' : 'error',
        levels: customLevels.levels,
        transports: transports,
      });
      winston.addColors(customLevels.colors);
    }
    
    trace(msg, meta) {
      this.logger.log('trace', msg, meta);
    }
    
    debug(msg, meta) {
      this.logger.debug(msg, meta);
    }
    
    info(msg, meta) {
      this.logger.info(msg, meta);
    }
    
    warn(msg, meta) {
      this.logger.warn(msg, meta);
    }
    
    error(msg, meta) {
      this.logger.error(msg, meta);
    }
    
    fatal(msg, meta) {
      this.logger.log('fatal', msg, meta);
    }
}

    
module.exports = Logger;