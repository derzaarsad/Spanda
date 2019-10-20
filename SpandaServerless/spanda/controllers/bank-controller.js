'use strict';

const lambdaUtil = require('../lib/lambda-util.js');
const blzPattern = /^\d{8}$/

const unauthorized = async (logger, finapi, authorization) => {
  try {
    logger.log('info', 'authenticating user', { 'authorization': authorization })
    await finapi.userInfo(authorization)

    // Return nothing on success.
    return null
  } catch (err) {
    logger.log('error', 'invalid token', { 'authorization': authorization })
    return lambdaUtil.CreateErrorResponse(401, 'unauthorized');
  }
}

// @Get('/banks/{blz}')
// @Param('blz') blz
exports.getBankByBLZ = async(event, context, logger, clientSecrets, authentication, finapi) => {
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
    logger.log('error', 'error while authorizing against finapi', { 'cause': err })
    return lambdaUtil.CreateErrorResponse(401, 'could not obtain an authentication token');
  }

  return finapi.listBanksByBLZ(authorization, pathParams['blz'])
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
exports.getWebformId = async(event, context, logger, finapi) => {
  const authorization = lambdaUtil.hasAuthorization(event.headers)

  if (!authorization) {
    return lambdaUtil.CreateErrorResponse(403, 'unauthorized');
  }

  return finapi.importConnection(authorization, event.body.bankId)
    .then(response => lambdaUtil.CreateResponse(200, response))
    .catch(err => {
      logger.log('error', 'error importing connection', { 'cause': err })
      return lambdaUtil.CreateErrorResponse(500, 'could not import connection')
    });
}

// @Get('/webForms/{webFormId}')
// @Param('webId') webId
// @Header('Username') username
// @Header('Authorization') authorization: string
exports.fetchWebFormInfo = async(event, context, logger, finapi, users, connections) => {
  const authorization = lambdaUtil.hasAuthorization(event.headers)

  if (!authorization) {
    return lambdaUtil.CreateErrorResponse(403, 'unauthorized');
  }

  const webId = event.pathParameters['webFormId']
  if (!webId) {
    return lambdaUtil.CreateErrorResponse(400, 'no webform id given');
  }

  const username = event.headers['Username']

  if (!username) {
    return lambdaUtil.CreateErrorResponse(400, 'no username given');
  }

  const error = await unauthorized(logger, finapi, authorization)
  if (error) {
    return error
  }

  const user = await users.findById(username)
  if (!user) {
    logger.log('info', 'no user found for username ' + username)
    return lambdaUtil.CreateErrorResponse(404, 'user not found');
  }

  let webForm
  try {
    webForm = await finapi.fetchWebForm(authorization, webId)
  } catch (err) {
    logger.log('error', 'could not fetch web form with id ' + webId)
    return lambdaUtil.CreateInternalErrorResponse('could not fetch web form');
  }

  const body = webForm.serviceResponseBody
  const bankConnection = connections.new(body.id, body.bankId)
  bankConnection.bankAccountIds = body.accountIds

  user.bankConnectionIds.push(body.id)

  // TODO: rollback
  return Promise.all([users.save(user), connections.save(bankConnection)])
    .then(() => lambdaUtil.CreateResponse(200, body))
    .catch(err => {
      logger.log('error', 'error persisting bank connection data', { 'cause': err })
      lambdaUtil.CreateInternalErrorResponse('could not persist bank connection data')
    })
}

// @Get('/allowance')
// @Header('Username') username
// @Header('Authorization') authorization: string
exports.getAllowance = async(event, context, logger, finapi, users) => {
  const authorization = lambdaUtil.hasAuthorization(event.headers)

  if (!authorization) {
    return lambdaUtil.CreateErrorResponse(403, 'unauthorized');
  }

  const username = event.headers['Username']

  if (!username) {
    return lambdaUtil.CreateErrorResponse(400, 'no username given');
  }

  const error = await unauthorized(logger, finapi, authorization)
  if (error) {
    return error
  }

  const user = await users.findById(username)

  if (!user) {
    logger.log('info', 'no user found for username ' + username)
    return lambdaUtil.CreateErrorResponse(404, 'user not found');
  }

  return lambdaUtil.CreateResponse(200, { 'allowance': user.allowance });
}

