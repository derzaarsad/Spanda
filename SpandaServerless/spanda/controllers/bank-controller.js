'use strict';

const lambdaUtil = require('../lib/lambda-util.js');

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

exports.getBankByBLZ = async(event, context, logger, clientSecrets, authentication, finapi) => {
  const pathParams = event.pathParameters

  // TODO: validate parameters
  if (!pathParams['blz']) {
    return lambdaUtil.CreateErrorResponse(400, 'invalid BLZ');
  }

  let authorization

  try {
    authorization = await authentication.getClientCredentialsToken(clientSecrets)
      .then(token => lambdaUtil.CreateAuthHeader(token))
  } catch (err) {
    logger.log('error', 'error while authorizing against finapi', err)
    return lambdaUtil.CreateErrorResponse(401, 'could not obtain an authentication token');
  }

  return finapi.listBanksByBLZ(authorization, pathParams['blz'])
    .then(response => lambdaUtil.CreateResponse(200, response))
    .catch(err => {
      // TODO distinguish unauthorized from other errors
      logger.log('error', 'error listing banks by BLZ', err)
      return lambdaUtil.CreateErrorResponse(500, 'could not list banks')
    })
}

exports.getWebformId = async(event, context, logger, clientSecrets, authentication, finapi) => {
  const authorization = lambdaUtil.hasAuthorization(event.headers)

  if (!authorization) {
    return lambdaUtil.CreateErrorResponse(403, 'unauthorized');
  }

  return finapi.importConnection(authorization, event.body.bankId)
    .then(response => lambdaUtil.CreateResponse(200, response))
    .catch(err => {
      logger.log('error', 'error importing connection', err)
      return lambdaUtil.CreateErrorResponse(500, 'could not import connection')
    });
}

exports.fetchWebFormInfo = async(event, context, logger, clientSecrets, authentication, finapi, users, connections) => {
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

  const webId = event.pathParameters['webFormId']
  let webForm
  try {
    webForm = await finapi.fetchWebForm(authorization, webId)
  } catch (err) {
    logger.log('error', 'could not fetch web form with id ' + webId)
    return lambdaUtil.CreateErrorResponse(500, 'could not fetch web form');
  }

  const body = webForm.serviceResponseBody
  const bankConnection = connections.new(body.id, body.bankId)
  bankConnection.bankAccounts = body.accountIds

  user.bankConnections.push(body.id)

  // TODO: rollback
  return Promise.all([users.save(user), connections.save(bankConnection)])
    .then(() => lambdaUtil.createResponse(200, webForm))
    .catch(err => {
      logger.log('error', 'error persisting user data', err)
      lambdaUtil.createError(500, 'could not persist user data')
    })
}

exports.getAllowance = async(event, context, logger, clientSecrets, authentication, finapi, users) => {
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

