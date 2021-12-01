const winston = require('winston');
const config = require('../config');

const cn = require('./common');

const today = cn.formattedTodaysDate()

const customLevels = {
    levels: {
      trace: 5,
      debug: 4,
      info: 3,
      warn: 2,
      error: 1,
      fatal: 0,
    },
    colors: {
      trace: 'white',
      debug: 'green',
      info: 'green',
      warn: 'yellow',
      error: 'red',
      fatal: 'red',
    },
};

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

class Logger {    
    constructor() {
      //TODO: Check why new log files are not created while the server is running already, since we need to created log file on daily basis.
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
    
module.exports = new Logger();