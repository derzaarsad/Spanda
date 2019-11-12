'use strict';

/*
 * Initialize controllers with environment variables
 */
const initializeInMemoryBackend = () => {
  const Users = require('./lib/users');
  const BankConnections = require('./lib/bank-connections');

  return {
    users: Users.NewInMemoryRepository(),
    connections: BankConnections.NewInMemoryRepository()
  }
}

const initializeDynamoDbBackend = env => {
  const DynamoDB = require('aws-sdk/clients/dynamodb')
  const Users = require('./lib/users');
  const BankConnections = require('./lib/bank-connections');

  const dynamoDbClient = new DynamoDB({apiVersion: '2012-08-10', region: env['REGION']});

  return {
    users: Users.NewDynamoDbRepository(dynamoDbClient, env['USERS_TABLE_NAME']),
    connections: BankConnections.NewDynamoDbRepository(dynamoDbClient, env['BANK_CONNECTIONS_TABLE_NAME'])
  }
}

const initializePostgreSQLBackend = env => {
  if((!env['PGUSER']) || (!env['PGPASSWORD'])) {
    throw new Error("no credentials are provided for PostgreSQL storage");
  }
  const { Pool } = require('pg');
  const format = require('pg-format');

  const Users = require('./lib/users');
  const BankConnections = require('./lib/bank-connections');

  const usersSchema = require('./lib/schema/users');
  const bankConnectionsSchema = require('./lib/schema/bank-connections');

  const pool = new Pool();

  return {
    users: Users.NewPostgreSQLRepository(pool, format, usersSchema),
    connections: BankConnections.NewPostgreSQLRepository(pool, format, bankConnectionsSchema)
  }
}

module.exports = (env) => {
  console.log('Configuring controllers from environment:')
  console.log(JSON.stringify(env))

  const axios = require('axios');

  const ClientSecrets = require('./lib/client-secrets');
  const Authentication = require('./lib/authentication');

  let storageBackend
  if(env['STORAGE_BACKEND'] === 'IN_MEMORY') {
    storageBackend = initializeInMemoryBackend();
  } else {

    if((!env['USERS_TABLE_NAME']) || (!env['BANK_CONNECTIONS_TABLE_NAME'])) {
      throw new Error("not enough information for storage");
    }

    if (env['STORAGE_BACKEND'] === 'DYNAMODB') {
      storageBackend = initializeDynamoDbBackend(env);
    } else if(env['STORAGE_BACKEND'] === 'POSTGRESQL') {
      storageBackend = initializePostgreSQLBackend(env);
    } else {
      throw new Error('unknown storage type');
    }
  }

  const baseURL = env['FINAPI_URL'] || 'https://sandbox.finapi.io';
  const options = { timeout: env['FINAPI_TIMEOUT'] || 3000 };

  const httpClient = axios.create({
    baseURL: baseURL,
    timeout: options.timeout,
    headers: { 'Accept': 'application/json' },
  });

  const authentication = Authentication.Basic(httpClient);

  const clientSecrets = ClientSecrets.Resolved(env['FINAPI_CLIENT_ID'], env['FINAPI_CLIENT_SECRET']);

  return {
    'clientSecrets': clientSecrets,
    'authentication': authentication,
    'bankInterface': require('./lib/bankInterface')(httpClient),
    'users': storageBackend.users,
    'connections': storageBackend.connections
  };
};
