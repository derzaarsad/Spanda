'use strict';

/*
  Initialize controllers with environment variables
*/
module.exports = env => {
  console.log('Configuring controllers from environment:')
  console.log(JSON.stringify(env))

  const axios = require('axios');
  const winston = require('winston');

  const ClientSecrets = require('./lib/client-secrets');
  const Authentication = require('./lib/authentication');
  const FinAPI = require('./lib/finapi');
  const Users = require('./lib/users');
  const BankConnections = require('./lib/bank-connections');
  const AuthenticationController = require('./controllers/authentication-controller');
  const BankController = require('./controllers/bank-controller');

  const logger = winston.createLogger({
    level: env['LOGGER_LEVEL'] || 'debug',
    format: winston.format.json(),
    transports: [
      new winston.transports.Console({
        format: winston.format.json()
      }),
    ]
  });

  const baseURL = env['FINAPI_URL'] || 'https://sandbox.finapi.io';
  const options = { timeout: env['FINAPI_TIMEOUT'] || 3000 };

  const httpClient = axios.create({
    baseURL: baseURL,
    timeout: options.timeout,
    headers: { 'Accept': 'application/json' },
  });

  const finapi = FinAPI.NewClient(httpClient);
  const authentication = Authentication.Basic(httpClient);

  const clientSecrets = ClientSecrets.Resolved(env['FINAPI_CLIENT_ID'], env['FINAPI_CLIENT_SECRET']);

  const users = Users.NewInMemoryRepository();
  const connections = BankConnections.NewInMemoryRepository();

  return {
    'logger': logger,
    'bankController': BankController(logger, clientSecrets, authentication, finapi, users, connections),
    'authenticationController': AuthenticationController(logger, clientSecrets, authentication, finapi, users)
  };
};
