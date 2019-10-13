'use strict';

/*
 * Initialize controllers with environment variables
 */
module.exports = (env) => {
  console.log('Configuring controllers from environment:')
  console.log(JSON.stringify(env))

  const axios = require('axios');

  const ClientSecrets = require('./lib/client-secrets');
  const Authentication = require('./lib/authentication');
  
  const Users = require('./lib/users');
  const BankConnections = require('./lib/bank-connections');

  const baseURL = env['FINAPI_URL'] || 'https://sandbox.finapi.io';
  const options = { timeout: env['FINAPI_TIMEOUT'] || 3000 };

  const httpClient = axios.create({
    baseURL: baseURL,
    timeout: options.timeout,
    headers: { 'Accept': 'application/json' },
  });

  const authentication = Authentication.Basic(httpClient);

  const clientSecrets = ClientSecrets.Resolved(env['FINAPI_CLIENT_ID'], env['FINAPI_CLIENT_SECRET']);

  const users = Users.NewInMemoryRepository();
  const connections = BankConnections.NewInMemoryRepository();

  return {
    'clientSecrets': clientSecrets,
    'authentication': authentication,
    'bankInterface': require('./lib/bankInterface')(httpClient),
    'users': users,
    'connections': connections
  };
};
