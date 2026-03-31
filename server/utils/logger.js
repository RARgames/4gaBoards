const util = require('util');
const winston = require('winston');

/**
 * The default timestamp used by the logger.
 * Format example: "2022-08-18 6:30:02"
 */
const timestampFormatProd = 'YYYY-MM-DD HH:mm:ss';
const timestampFormatDev = 'HH:mm:ss';

const logfile = `${process.cwd()}/logs/4gaBoards.log`;

/**
 * Log level for both console and file log sinks.
 *
 * Refer {@link https://github.com/winstonjs/winston#logging here}
 * for more information on Winston log levels.
 */
const logLevel = process.env.NODE_ENV === 'production' ? process.env.LOG_LEVEL || 'warn' : process.env.LOG_LEVEL || 'info';
winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'white',
  verbose: 'gray',
});

const combineMessageAndSplat = () => {
  return {
    transform: (info) => {
      // eslint-disable-next-line no-param-reassign
      info.message = util.format(info.message, ...(info[Symbol.for('splat')] || []));
      // eslint-disable-next-line no-param-reassign
      info.message = info.message.replace(/^ (info|warn|error|verbose|debug):\s*/i, '');
      return info;
    },
  };
};

const logFormatConsoleProd = winston.format.combine(
  winston.format.uncolorize(),
  combineMessageAndSplat(),
  winston.format.timestamp({ format: timestampFormatProd }),
  winston.format.printf((log) => `${log.timestamp} [${log.level.toUpperCase()}] ${log.message}`),
);

const logFormatConsoleDev = winston.format.combine(
  winston.format.uncolorize(),
  combineMessageAndSplat(),
  winston.format.timestamp({ format: timestampFormatDev }),
  winston.format.printf((log) => `${log.timestamp} [${log.level.toUpperCase()}] ${log.message}`),
  winston.format.colorize({ all: true }),
);

const logFormatFileProd = winston.format.combine(winston.format.uncolorize(), combineMessageAndSplat(), winston.format.timestamp({ format: timestampFormatProd }), winston.format.json());

const logFormatFileDev = winston.format.combine(
  winston.format.uncolorize(),
  combineMessageAndSplat(),
  winston.format.timestamp({ format: timestampFormatProd }),
  winston.format.printf((log) => `${log.timestamp} [${log.level.toUpperCase()}] ${log.message}`),
);

// eslint-disable-next-line new-cap
const customLogger = new winston.createLogger({
  transports: [
    new winston.transports.File({
      level: logLevel,
      format: process.env.NODE_ENV === 'production' ? logFormatFileProd : logFormatFileDev,
      filename: logfile,
    }),
    new winston.transports.Console({
      level: logLevel,
      format: process.env.NODE_ENV === 'production' ? logFormatConsoleProd : logFormatConsoleDev,
    }),
  ],
});

module.exports = {
  customLogger,
};
