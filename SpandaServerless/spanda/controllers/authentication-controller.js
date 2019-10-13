'use strict';

const lambdaUtil = require('../lib/lambda-util.js');

// @Get('/users')
// @Header('Authorization') authorization: string
exports.isUserAuthenticated = async(event, context, logger, bankInterface) => {
  const authorization = lambdaUtil.hasAuthorization(event.headers)

  if (!authorization) {
    return lambdaUtil.CreateErrorResponse(403, 'unauthorized');
  }

  return bankInterface.userInfo(authorization).then(response => lambdaUtil.CreateResponse(200, response))
    .catch(err => {
      logger.log('error', 'error authenticating user', err)
      return lambdaUtil.CreateErrorResponse(401, 'unauthorized')
    });
}

// @Post('/users')
// @BodyProp() id: string
// @BodyProp() password
// @BodyProp() email: string
// @BodyProp() phone: string
// @BodyProp() isAutoUpdateEnabled: boolean
exports.registerUser = async(event, context, logger, clientSecrets, authentication, bankInterface, users) => {
  const user = event.body
  logger.log('debug', 'user: ' + user)
  // TODO check parameters

  if (await users.findById(user.id)) {
    return lambdaUtil.CreateErrorResponse(409, 'user already exists');
  }

  let authorization

  try {
    authorization = await authentication.getClientCredentialsToken(clientSecrets)
      .then(token => lambdaUtil.CreateAuthHeader(token))
  } catch (err) {
    logger.log('error', 'error while authorizing against bankInterface', err)
    return lambdaUtil.CreateErrorResponse(401, 'could not obtain an authentication token');
  }

  const newUser = users.new(user.id, user.email, user.phone, user.isAutoUpdateEnabled)

  try {
    await bankInterface.registerUser(authorization, newUser)
  } catch (err) {
    logger.log('error', 'could not register user', err)
    return lambdaUtil.CreateErrorResponse(500, 'could not perform user registration');
  }

  return users.save(user).then(userData => lambdaUtil.CreateResponse(201, userData));
}

// @Post('/oauth/login')
// @BodyProp() username: string,
// @BodyProp() password: string
exports.authenticateAndSave = (event, context, logger, clientSecrets, authentication) => {
  const credentials = event.body
  // TODO check parameters
  logger.log('debug', 'credentials: ' + credentials)

  const username = credentials.username;
  const password = credentials.password;

  return authentication.getPasswordToken(clientSecrets, username, password)
    .then(response => lambdaUtil.CreateResponse(200, response))
    .catch(err => {
      logger.log('error', 'could not obtain password token for user ' + username, err)
      return lambdaUtil.CreateErrorResponse(401, 'unauthorized')
    });
}

// @Post('/oauth/token')
// @BodyProp() refresh_token: string
exports.updateRefreshToken = (event, context, logger, clientSecrets, authentication) => {
  const body = event.body
  // TODO check parameters
  logger.log('debug', 'body: ' + body)

  return authentication.getRefreshToken(clientSecrets, body['refresh_token'])
    .then(response => lambdaUtil.CreateResponse(200, response))
    .catch(err => {
      logger.log('error', 'could not obtain refresh token', err)
      return lambdaUtil.CreateErrorResponse(401, 'unauthorized')
    });
};

