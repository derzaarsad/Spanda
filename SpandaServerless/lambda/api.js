const axios = require('axios')
const winston = require('winston')
const lambdaUtil = require('./lib/lambda-util').default

const Path = require('path-parser').default
const ClientSecrets = require('./lib/client-secrets')
const Authentication = require('./lib/authentication')
const FinAPI = require('./lib/finapi')
const Users = require('./lib/users')
const BankConnections = require('./lib/bank-connections')
const AuthenticationController = require('./lib/authentication-controller')
const BankController = require('./lib/bank-controller')

const env = process.env

// Configuration from environment
// LOGGER_LEVEL
// FINAPI_URL
// FINAPI_TIMEOUT
// AWS_REGION
// AUTH_TYPE
// AUTH_CLIENT_ID
// AUTH_CLIENT_SECRET
// PERSISTENCE_TYPE (only in-memory for now)

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

let clientSecrets
if (env['AUTH_TYPE'] === 'simple') {
  clientSecrets = ClientSecrets.Resolved(env['AUTH_CLIENT_ID'], env['AUTH_CLIENT_SECRET'])
} else {
  throw 'unsupported auth type'
}

const users = Users.NewInMemoryRepository()
const connections = BankConnections.NewInMemoryRepository()

const authenticationController = AuthenticationController.NewLambdaController(logger, clientSecrets, authentication, finapi, users)
const bankController = BankController.NewLambdaController(logger, clientSecrets, authentication, finapi, users, connections)

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
exports.helloWorld = async (event, context) => {
  let response
  try {
    // const ret = await axios(url);
    response = {
      'statusCode': 200,
      'body': JSON.stringify({
        message: 'hello world',
      })
    }
  } catch (err) {
    logger.log('info', err);
    return err;
  }

  return response
};

/*
 * Authentication Controller
 * -------------------------
 */

// @Get('/users')
// @Header('Authorization') authorization: string
exports.isUserAuthenticated = async (event, context) => {
  const authorization = lambdaUtil.hasAuthorization(event.headers)

  if (!authorization) {
    return lambdaUtil.createError(403, 'unauthorized')
  } else {
    return authenticationController.isUserAuthenticated(authorization)
  }
}

// @Post('/users')
// @BodyProp() id: string
// @BodyProp() password
// @BodyProp() email: string
// @BodyProp() phone: string
// @BodyProp() isAutoUpdateEnabled: boolean
exports.registerUser = async (event, context) => {
  const user = event.body
  logger('debug', 'user: ' + user)
  // TODO check parameters
  return authenticationController.registerUser(user.id, user.password, user.email, user.phone, user.isAutoUpdateEnabled)
}

// @Post('/oauth/login')
// @BodyProp() username: string,
// @BodyProp() password: string
exports.authenticateAndSaveUser = async (event, context) => {
  const credentials = event.body
  logger('debug', 'credentials: ' + credentials)
  return authenticationController.authenticateAndSave(credentials.username, credentials.password)
}

// @Post('/oauth/token')
// @BodyProp() refresh_token: string
exports.updateRefreshToken = async (event, context) => {
  const body = event.body
  logger('debug', 'body: ' + body)
  authenticationController.updateRefreshToken(body.refreshToken)
}

/*
 * Bank Controller
 * ---------------
 */

// @Get('/banks/{blz}')
// @Param('blz') blz
exports.getBankByBLZ = async (event, context) => {
  const path = Paths.createPath('/banks/:blz<\\d{8}>')
  const pathParams = path.test(event.pathParameters)

  if (!pathParams) {
    return lambdaUtil.createError(400, 'invalid BLZ')
  }

  return bankController.getBankByBLZ(pathParams['blz'])
}

// @Post('/bankConnections/import')
// @Header('Authorization') authorization: string,
// @BodyProp() bankId: number)
exports.getWebFormId = async (event, context) => {
  const authorization = lambdaUtil.hasAuthorization(event.headers)

  if (!authorization) {
    return lambdaUtil.createError(403, 'unauthorized')
  }

  return bankController.getWebformId(authorization, event.body.bankId)
}

// @Get('/webForms/{webId}')
// @Param('webId') webId
// @Header('Username') username
// @Header('Authorization') authorization: string
exports.fetchWebFormInfo = async (event, context) => {
  const authorization = lambdaUtil.hasAuthorization(event.headers)

  if (!authorization) {
    return lambdaUtil.createError(403, 'unauthorized')
  }

  const path = Paths.createPath('/webForms/:webId')
  const pathParams = path.test(event.pathParameters)

  if (!pathParams) {
    return lambdaUtil.createError(400, 'bad web id given')
  }

  const username = event.headers['Username']

  if (!username) {
    return lambdaUtil.createError(400, 'no username given')
  }

  const webId = pathParams['webId']

  return bankController.fetchWebFormInfo(authorization, username, webId)
}

// @Get('/allowance')
// @Header('Username') username
// @Header('Authorization') authorization: string
exports.getAllowance = async (event, context) => {
  const authorization = lambdaUtil.hasAuthorization(event.headers)

  if (!authorization) {
    return lambdaUtil.createError(403, 'unauthorized')
  }

  const username = event.headers['Username']

  if (!username) {
    return lambdaUtil.createError(400, 'no username given')
  }

  return bankController.getAllowance(authorization, username)
}
