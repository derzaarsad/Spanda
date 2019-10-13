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

const env = process.env;
const lambdaUtil = require('./lib/lambda-util');
const ControllerProvider = require('./ControllerProvider')(env)
const authenticationController = ControllerProvider.authenticationController
const bankController = ControllerProvider.bankController
const logger = ControllerProvider.logger

/*
 * Authentication Controller
 * -------------------------
 */

// @Get('/users')
// @Header('Authorization') authorization: string
exports.isUserAuthenticated = async (event, context) => {
  const authorization = lambdaUtil.hasAuthorization(event.headers)

  if (!authorization) {
    return lambdaUtil.CreateErrorResponse(403, 'unauthorized');
  } else {
    try {
      return authenticationController.isUserAuthenticated(authorization)
    } catch (err) {
      return lambdaUtil.CreateInternalErrorResponse(err)
    }
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
  logger.log('debug', 'user: ' + user)
  // TODO check parameters

  try {
    return authenticationController.registerUser(user.id, user.password, user.email, user.phone, user.isAutoUpdateEnabled)
  } catch (err) {
    return lambdaUtil.CreateInternalErrorResponse(err)
  }
}

// @Post('/oauth/login')
// @BodyProp() username: string,
// @BodyProp() password: string
exports.authenticateAndSaveUser = async (event, context) => {
  const credentials = event.body
  logger.log('debug', 'credentials: ' + credentials)

  try {
    return authenticationController.authenticateAndSave(credentials.username, credentials.password)
  } catch (err) {
    return lambdaUtil.CreateInternalErrorResponse(err)
  }
}

// @Post('/oauth/token')
// @BodyProp() refresh_token: string
exports.updateRefreshToken = async (event, context) => {
  const body = event.body
  logger.log('debug', 'body: ' + body)

  try {
    return authenticationController.updateRefreshToken(body.refreshToken)
  } catch (err) {
    return lambdaUtil.CreateInternalErrorResponse(err)
  }
}

/*
 * Bank Controller
 * ---------------
 */

// @Get('/banks/{blz}')
// @Param('blz') blz
exports.getBankByBLZ = async (event, context) => {
  const pathParams = event.pathParameters

  // TODO: validate parameters
  if (!pathParams['blz']) {
    return lambdaUtil.CreateErrorResponse(400, 'invalid BLZ');
  }

  try {
    return bankController.getBankByBLZ(pathParams['blz'])
  } catch (err) {
    return lambdaUtil.CreateInternalErrorResponse(err)
  }
}

// @Post('/bankConnections/import')
// @Header('Authorization') authorization: string,
// @BodyProp() bankId: number)
exports.getWebFormId = async (event, context) => {
  const authorization = lambdaUtil.hasAuthorization(event.headers)

  if (!authorization) {
    return lambdaUtil.CreateErrorResponse(403, 'unauthorized');
  }

  try {
    return bankController.getWebformId(authorization, event.body.bankId)
  } catch (err) {
    return lambdaUtil.CreateInternalErrorResponse(err)
  }
}

// @Get('/webForms/{webId}')
// @Param('webId') webId
// @Header('Username') username
// @Header('Authorization') authorization: string
exports.fetchWebFormInfo = async (event, context) => {
  const authorization = lambdaUtil.hasAuthorization(event.headers)

  if (!authorization) {
    return lambdaUtil.CreateErrorResponse(403, 'unauthorized');
  }

  const username = event.headers['Username']

  if (!username) {
    return lambdaUtil.CreateErrorResponse(400, 'no username given');
  }

  const webId = event.pathParameters['webFormId']

  try {
    return bankController.fetchWebFormInfo(authorization, username, webId)
  } catch (err) {
    return lambdaUtil.CreateInternalErrorResponse(err)
  }
}

// @Get('/allowance')
// @Header('Username') username
// @Header('Authorization') authorization: string
exports.getAllowance = async (event, context) => {
  const authorization = lambdaUtil.hasAuthorization(event.headers)

  if (!authorization) {
    return lambdaUtil.CreateErrorResponse(403, 'unauthorized');
  }

  const username = event.headers['Username']

  if (!username) {
    return lambdaUtil.CreateErrorResponse(400, 'no username given');
  }

  try {
    return bankController.getAllowance(authorization, username)
  } catch (err) {
    return lambdaUtil.CreateInternalErrorResponse(err)
  }
}
