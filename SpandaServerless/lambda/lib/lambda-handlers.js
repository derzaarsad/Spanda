'use strict'

const initializeFromEnvironmentObject = env => {
  console.log(env)

  const axios = require('axios')
  const winston = require('winston')
  const lambdaUtil = require('./lambda-util').default

  const ClientSecrets = require('./client-secrets')
  const Authentication = require('./authentication')
  const FinAPI = require('./finapi')
  const Users = require('./users')
  const BankConnections = require('./bank-connections')
  const AuthenticationController = require('./authentication-controller')
  const BankController = require('./bank-controller')

  const logger = winston.createLogger({
    level: env['LOGGER_LEVEL'] || 'debug',
    format: winston.format.json(),
    transports: [
      new winston.transports.Console({
        format: winston.format.json()
      }),
    ]
  });

  const baseURL = env['FINAPI_URL'] || 'https://sandbox.finapi.io'
  const options = { timeout: env['FINAPI_TIMEOUT'] || 3000 }

  const httpClient = axios.create({
    baseURL: baseURL,
    timeout: options.timeout,
    headers: { 'Accept': 'application/json' },
  });

  const finapi = FinAPI.NewClient(httpClient)
  const authentication = Authentication.Basic(httpClient)

  let clientSecrets = ClientSecrets.Resolved(env['AUTH_CLIENT_ID'], env['AUTH_CLIENT_SECRET'])
  console.log('clientId: ' + env['AUTH_CLIENT_ID'] + ' clientSecret: ' + env['AUTH_CLIENT_SECRET'])

  const users = Users.NewInMemoryRepository()
  const connections = BankConnections.NewInMemoryRepository()

  return {
    'logger': logger,
    'finapi': finapi,
    'clientSecrets': clientSecrets,
    'authentication': authentication,
    'connections': connections,
    'users': users,
    'bankController': BankController.NewLambdaController(logger, clientSecrets, authentication, finapi, users, connections),
    'authenticationController': AuthenticationController.NewLambdaController(logger, clientSecrets, authentication, finapi, users)
  }
}

exports.initializeFromEnvironmentObject = initializeFromEnvironmentObject
