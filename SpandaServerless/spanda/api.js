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
 */
const env = process.env;
const lambdaUtil = require('./lib/lambda-util');
const logger = require('./CreateLogger')(env)
const services = require('./ControllerProvider')(env, logger)
const authenticationController = require('./controllers/authentication-controller')
const bankController = require('./controllers/bank-controller')

/*
 * Authentication Controller
 * -------------------------
 */
exports.isUserAuthenticated = async (event, context) => {
  try {
    return authenticationController.isUserAuthenticated(event, context, services.logger, services.finapi)
  } catch (err) {
    logger.log('error', 'error authorizing', err)
    return lambdaUtil.CreateInternalErrorResponse(err)
  }
}

exports.registerUser = async (event, context) => {
  try {
    return authenticationController.registerUser(event, context, services.logger,
      services.clientSecrets, services.authentication, services.finapi, services.users)
  } catch (err) {
    logger.log('error', 'error registering user', err)
    return lambdaUtil.CreateInternalErrorResponse(err)
  }
}

exports.authenticateAndSaveUser = async (event, context) => {
  try {
    return authenticationController.authenticateAndSave(event, context, services.logger,
      services.clientSecrets, services.authentication)
  } catch (err) {
    logger.log('error', 'error logging in user', err)
    return lambdaUtil.CreateInternalErrorResponse(err)
  }
}

exports.updateRefreshToken = async (event, context) => {
  try {
    return authenticationController.updateRefreshToken(event, context, services.logger,
      services.clientSecret, services.authentication)
  } catch (err) {
    logger.log('error', 'error refreshing token', err)
    return lambdaUtil.CreateInternalErrorResponse(err)
  }
}

/*
 * Bank Controller
 * ---------------
 */
exports.getBankByBLZ = async (event, context) => {
  try {
    return bankController.getBankByBLZ(event, context, services.logger, services.clientSecrets,
      services.authentication, services.finapi)
  } catch (err) {
    logger.log('error', 'error listing banks', err)
    return lambdaUtil.CreateInternalErrorResponse(err)
  }
}

exports.getWebFormId = async (event, context) => {
  try {
    return bankController.getWebformId(event, context, services.logger,
      services.finapi)
  } catch (err) {
    logger.log('error', 'error importing bank connection', err)
    return lambdaUtil.CreateInternalErrorResponse(err)
  }
}

exports.fetchWebFormInfo = async (event, context) => {
  try {
    return bankController.fetchWebFormInfo(event, context, services.logger,
      services.finapi, services.users, services.connections)
  } catch (err) {
    logger.log('error', 'error fetching webform id', err)
    return lambdaUtil.CreateInternalErrorResponse(err)
  }
}

exports.getAllowance = async (event, context) => {
  try {
    return bankController.getAllowance(event, context, services.logger,
      services.finapi, services.users)
  } catch (err) {
    logger.log('error', 'error fetching fetching allowance', err)
    return lambdaUtil.CreateInternalErrorResponse(err)
  }
}
