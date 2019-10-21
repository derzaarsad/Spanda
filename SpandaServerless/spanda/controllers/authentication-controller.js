'use strict';

const lambdaUtil = require('../lib/lambda-util.js');
const expectedPasswordCredentialProperties = ['username', 'password']
const expectedRefreshTokenProperties = ['refresh_token']
const expectedUserProperties = ['id', 'password', 'email', 'phone', 'isAutoUpdateEnabled']

// pasted from emailregex.com
const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

// pasted from emailregex.com (should be valid for Germany)
const phoneRegex = /^([+][0-9]{1,3}[ .-])?([(]{1}[0-9]{1,6}[)])?([0-9 .\-/]{3,20})((x|ext|extension)[ ]?[0-9]{1,4})?$/

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
  logger.log('debug', 'user: ' + event.body)

  let user
  try {
    user = JSON.parse(event.body)
  } catch (err) {
    logger.log('error', 'could not parse body ' + err)
    return lambdaUtil.CreateErrorResponse(400, 'invalid user representation')
  }

  // TODO check parameters
  const missingProperty = lambdaUtil.HasMissingProperty(user, expectedUserProperties)
  if (missingProperty) {
    return lambdaUtil.CreateErrorResponse(400, 'missing user property: ' + missingProperty)
  }

  if (!emailRegex.test(user.email)) {
    return lambdaUtil.CreateErrorResponse(400, 'invalid email given')
  }
  if (!phoneRegex.test(user.phone)) {
    return lambdaUtil.CreateErrorResponse(400, 'invalid phone given')
  }

  let authorization

  try {
    authorization = await authentication.getClientCredentialsToken(clientSecrets)
      .then(token => lambdaUtil.CreateAuthHeader(token))
  } catch (err) {
    logger.log('error', 'error while authorizing against bank interface', { 'cause': err })
    return lambdaUtil.CreateErrorResponse(401, 'could not obtain an authentication token');
  }

  if (await users.findById(user.id)) {
    return lambdaUtil.CreateErrorResponse(409, 'user already exists');
  }

  const username = user.id
  const email = user.email
  const phone = user.phone
  const isAutoUpdateEnabled = user.isAutoUpdateEnabled === 'true'

  const newUser = users.new(username, email, phone, isAutoUpdateEnabled)

  try {
    await bankInterface.registerUser(authorization, newUser)
  } catch (err) {
    logger.log('error', 'could not register user', { 'cause': err })
    return lambdaUtil.CreateErrorResponse(500, 'could not perform user registration');
  }

  return users.save(newUser).then(userData => lambdaUtil.CreateResponse(201, userData));
}

// @Post('/oauth/login')
// @BodyProp() username: string,
// @BodyProp() password: string
exports.authenticateAndSave = (event, context, logger, clientSecrets, authentication) => {
  logger.log('debug', 'credentials: ' + event.body)

  const credentials = JSON.parse(event.body);

  // TODO check parameters
  const missingProperty = lambdaUtil.HasMissingProperty(credentials, expectedPasswordCredentialProperties)
  if (missingProperty) {
    return lambdaUtil.CreateErrorResponse(400, 'missing property: ' + missingProperty)
  }

  const username = credentials.username;
  const password = credentials.password;

  return authentication.getPasswordToken(clientSecrets, username, password)
    .then(response => lambdaUtil.CreateResponse(200, response))
    .catch(err => {
      logger.log('error', 'could not obtain password token for user ' + username, { 'cause': err })
      return lambdaUtil.CreateErrorResponse(401, 'unauthorized')
    });
}

// @Post('/oauth/token')
// @BodyProp() refresh_token: string
exports.updateRefreshToken = (event, context, logger, clientSecrets, authentication) => {
  logger.log('debug', 'body: ' + event.body)

  const body = event.body

  // TODO check parameters
  const missingProperty = lambdaUtil.HasMissingProperty(body, expectedRefreshTokenProperties)
  if (missingProperty) {
    return lambdaUtil.CreateErrorResponse(400, 'missing property: ' + missingProperty)
  }

  return authentication.getRefreshToken(clientSecrets, body['refresh_token'])
    .then(response => lambdaUtil.CreateResponse(200, response))
    .catch(err => {
      logger.log('error', 'could not obtain refresh token', { 'cause': err })
      return lambdaUtil.CreateErrorResponse(401, 'unauthorized')
    });
};

