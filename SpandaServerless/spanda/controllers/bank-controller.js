'use strict';

const lambdaUtil = require('../lib/lambda-util.js');
const blzPattern = /^\d{8}$/

const getUserInfo = async (logger, bankInterface, authorization) => {
  logger.log('info', 'authenticating user', { 'authorization': authorization })
  return bankInterface.userInfo(authorization)
}

// @Get('/banks/{blz}')
// @Param('blz') blz
exports.getBankByBLZ = async(event, context, logger, clientSecrets, authentication, bankInterface) => {
  const pathParams = event.pathParameters

  if (!pathParams['blz']) {
    return lambdaUtil.CreateErrorResponse(400, 'no BLZ given');
  }

  const blz = pathParams['blz']
  if (!blzPattern.test(blz)) {
    return lambdaUtil.CreateErrorResponse(400, 'invalid BLZ given');
  }

  let authorization

  try {
    authorization = await authentication.getClientCredentialsToken(clientSecrets)
      .then(token => lambdaUtil.CreateAuthHeader(token))
  } catch (err) {
    logger.log('error', 'error while authorizing against bank interface', { 'cause': err })
    return lambdaUtil.CreateErrorResponse(401, 'could not obtain an authentication token');
  }

  return bankInterface.listBanksByBLZ(authorization, pathParams['blz'])
    .then(response => lambdaUtil.CreateResponse(200, response))
    .catch(err => {
      // TODO distinguish unauthorized from other errors
      logger.log('error', 'error listing banks by BLZ', { 'cause': err })
      return lambdaUtil.CreateErrorResponse(500, 'could not list banks')
    })
}

// @Post('/bankConnections/import')
// @Header('Authorization') authorization: string,
// @BodyProp() bankId: number)
exports.getWebformId = async(event, context, logger, bankInterface, users, encryptions) => {
  const authorization = lambdaUtil.hasAuthorization(event.headers)

  if (!authorization) {
    return lambdaUtil.CreateErrorResponse(401, 'unauthorized');
  }

  let user

  try {
    // Get user from authorization
    let userInfo = await bankInterface.userInfo(authorization);
    user = await users.findById(userInfo.id);
    if(!user) {
      throw new Error("user is not found in the database");
    }
  } catch (err) {
    logger.log('error', 'error authenticating user', err)
    return lambdaUtil.CreateErrorResponse(401, 'unauthorized')
  }

  const body = JSON.parse(event.body);
  const response = await bankInterface.importConnection(authorization, body.bankId);

  const secret = encryptions.EncryptText(authorization);

  user.activeWebFormId = response.formId;
  user.activeWebFormAuth = secret.iv;

  return users.save(user).then(() => {
      /*
       * Client usage: {location}?callbackUrl={RestApi}/webForms/callback/{webFormAuth}
      */
      return lambdaUtil.CreateResponse(200, { location: response.location, webFormAuth: response.formId + "-" + secret.encryptedData });
    })
    .catch(err => {
      logger.log('error', 'error importing connection', { 'cause': err })
      return lambdaUtil.CreateErrorResponse(500, 'could not import connection')
    });
}

// @Get('/webForms/{webFormId}')
// @Param('webId') webId
// @Header('Authorization') authorization: string
exports.fetchWebFormInfo = async(event, context, logger, bankInterface, users, connections, encryptions) => {

  if (!event.pathParameters.webFormAuth) {
    return lambdaUtil.CreateInternalErrorResponse('no webFormAuth');
  }

  let splitted = event.pathParameters.webFormAuth.split("-");
  let webId = splitted[0];

  const user = await users.findByWebForm(webId)
  if (!user) {
    logger.log('error', 'no user found for webId ' + webId)
    return lambdaUtil.CreateInternalErrorResponse('no user found');
  }

  const authorization = encryptions.DecryptText({ iv: user.activeWebFormAuth, encryptedData: splitted[1] })

  let webForm
  try {
    webForm = await bankInterface.fetchWebForm(authorization, webId)
  } catch (err) {
    logger.log('error', 'could not fetch web form with id ' + webId)
    return lambdaUtil.CreateInternalErrorResponse('could not fetch web form');
  }

  const body = webForm.serviceResponseBody
  if (!body) {
    logger.log('error', 'empty body')
    return lambdaUtil.CreateInternalErrorResponse('empty body');
  }

  const bankConnection = connections.new(body.id, body.bankId)
  bankConnection.bankAccountIds = body.accountIds

  user.bankConnectionIds.push(body.id)

  // TODO: rollback on failure
  return Promise.all([users.save(user), connections.save(bankConnection)])
    .then(() => lambdaUtil.CreateResponse(200, body))
    .catch(err => {
      logger.log('error', 'error persisting bank connection data', { 'cause': err })
      lambdaUtil.CreateInternalErrorResponse('could not persist bank connection data')
    })
}

// @Get('/allowance')
// @Header('Authorization') authorization: string
exports.getAllowance = async(event, context, logger, bankInterface, users) => {
  const authorization = lambdaUtil.hasAuthorization(event.headers)

  if (!authorization) {
    return lambdaUtil.CreateErrorResponse(401, 'unauthorized');
  }

  let userInfo
  try {
    userInfo = await getUserInfo(logger, bankInterface, authorization)
  } catch (error) {
    logger.log('error', 'invalid token', { 'authorization': authorization })
    return lambdaUtil.CreateErrorResponse(401, 'unauthorized');
  }

  const username = userInfo.id
  const user = await users.findById(username)

  if (!user) {
    logger.log('error', 'no user found for username ' + username)
    return lambdaUtil.CreateInternalErrorResponse('error fetching allowance');
  }

  return lambdaUtil.CreateResponse(200, { 'allowance': user.allowance });
}

