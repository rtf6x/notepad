const { createLogger, format, transports } = require('winston');
const { combine, prettyPrint, colorize } = format;
// const settings = require('../config.js');

var logTransports = [
  new transports.File({
    filename: './error.log',
    level: 'error',
    name: 'file.error',
    json: false,
    timestamp: true,
    handleExceptions: false,
    maxsize: 50000000,
    maxFiles: 2
  }),

  new transports.File({
    filename: './all-logs.log',
    name: 'file.info',
    json: false,
    timestamp: true,
    handleExceptions: false,
    maxsize: 25000000,
    maxFiles: 2,
    level: 'silly'
  }),
  new transports.Console(),
];

const logger = createLogger({
  level: 'info',
  timestamp: true,
  handleExceptions: false,
  format: combine(colorize(), prettyPrint(), format.splat(), format.simple()),
  transports: logTransports,
});

module.exports = logger;
