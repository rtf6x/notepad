var winston = require('winston');
var settings = require('../config.js');

var logTransports = [
  new (winston.transports.File)({
    filename: './error.log',
    level: 'error',
    name: 'file.error',
    json: false,
    timestamp: true,
    handleExceptions: false,
    maxsize: 50000000,
    maxFiles: 2
  }),

  new (winston.transports.File)({
    filename: './all-logs.log',
    name: 'file.info',
    json: false,
    timestamp: true,
    handleExceptions: false,
    maxsize: 25000000,
    maxFiles: 2,
    level: 'silly'
  })
];

logTransports.push(new (winston.transports.Console)({
  json: false,
  timestamp: false,
  handleExceptions: false,
  colorize: true,
  level: 'silly'
}));

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var logger = new (winston.Logger)({
  transports: logTransports,
  exitOnError: true
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
logger.log = function () {
  winston.Logger.prototype.log.apply(this, arguments);
};

module.exports = logger;
module.exports.setConfig = function (config) {
  settings.LOGGER = config;
  logger.remove(winston.transports.Console);
  logger.add(winston.transports.Console, {
    json: false,
    timestamp: false,
    handleExceptions: false,
    colorize: true,
    level: 'silly'
  });
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
