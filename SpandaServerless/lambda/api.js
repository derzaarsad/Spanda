const axios = require('axios')
const winston = require('winston')
const lambdaUtil = require('./lib/lambda-util')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log` 
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
// 
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const ClientSecrets = require('./lib/client-secrets')
const Authentication = require('./lib/authentication')
const FinAPI = require('./lib/finapi')

// const url = 'http://checkip.amazonaws.com/';
const baseURL = 'https://sandbox.finapi.io'
const options = { timeout: 3000 }

const httpClient = axios.create({
  baseURL: baseURL,
  timeout: options.timeout,
  headers: { 'Accept': 'application/json' },
});

const env = process.env

// Configuration from environment
// AUTH_TYPE
// AUTH_CLIENT_ID
// AUTH_CLIENT_SECRET
// PERSISTENCE_TYPE (only in-memory for now)

const finapi = FinAPI.NewClient(httpClient)
// const authenticationController = authenticationController.NewLambdaController(logger, clientSecrets, authentication, finapi, users)
// const bankController = bankController.NewLambdaController(logger, clientSecrets, authentication, finapi, users, connections)

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
exports.lambdaHandler = async (event, context) => {
  try {
    // const ret = await axios(url);
    const response = {
      'statusCode': 200,
      'body': JSON.stringify({
        message: 'hello world',
        // location: ret.data.trim()
      })
    }
  } catch (err) {
    console.log(err);
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
  // call authenticationController.isUserAuthenticated
}

// @Post('/users')
// @BodyProp() id: string
// @BodyProp() password
// @BodyProp() email: string
// @BodyProp() phone: string
// @BodyProp() isAutoUpdateEnabled: boolean
exports.register = async (event, context) => {
  // call authenticationController.registerUser
}

// @Post('/oauth/login')
// @BodyProp() username: string,
// @BodyProp() password: string
exports.authenticateAndSave = async (event, context) => {
  // call authenticationController.authenticateAndSave
}

// @Post('/oauth/token')
// @BodyProp() refresh_token: string
exports.updateRefreshToken = async (event, context) => {
  // call authenticationController.updateRefreshToken(refreshToken)
}

/*
 * Bank Controller
 * ---------------
 */

// @Get('/banks/{blz}')
// @Param('blz') blz
exports.getBankByBLZ = async (event, context) => {
}

// @Post('/bankConnections/import')
// @Header('Authorization') authorization: string,
// @BodyProp() bankId: number)
exports.getWebformId = async (event, context) => {
  // call api.importConnection
}

// @Get('/webForms/{webId}')
// @Param('webId') webId
// @Header('Username') username
// @Header('Authorization') authorization: string
exports.fetchWebFormInfo = async (event, context) => {
  // fetch user by id; if non existing, return immediately
  // get the form by the given id
  // create a new bank connection
  // update the user's bank connections
}

// @Get('/allowance')
// @Header('Username') username
// @Header('Authorization') authorization: string
exports.getAllowance = async (event, context) => {
  // fetch the user by id
  // return their allowance { allowance: user.allowance }
}
