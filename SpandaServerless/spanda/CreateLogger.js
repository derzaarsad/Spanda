'use strict';

/*
  Initialize logger with environment variables
*/
module.exports = env => {
  console.log('Configuring logger from environment:')

  const winston = require('winston');

  return winston.createLogger({
    level: env['LOGGER_LEVEL'] || 'debug',
    format: winston.format.json(),
    transports: [
      new winston.transports.Console({
        format: winston.format.json()
      }),
    ]
  });
};