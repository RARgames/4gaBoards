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

const logFormatConsoleProd = winston.format.combine(
  winston.format.uncolorize(),
  winston.format.timestamp({ format: timestampFormatProd }),
  winston.format.printf((log) => `${log.timestamp} ${log.message}`),
);

const logFormatConsoleDev = winston.format.combine(
  winston.format.timestamp({ format: timestampFormatDev }),
  winston.format.printf((log) => `${log.timestamp} ${log.message}`),
);

const logFormatFileProd = winston.format.combine(winston.format.uncolorize(), winston.format.timestamp({ format: timestampFormatProd }), winston.format.json());

const logFormatFileDev = winston.format.combine(
  winston.format.uncolorize(),
  winston.format.timestamp({ format: timestampFormatProd }),
  winston.format.printf((log) => `${log.timestamp} ${log.message}`),
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
