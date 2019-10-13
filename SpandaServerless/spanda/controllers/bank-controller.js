'use strict';

const lambdaUtil = require('../lib/lambda-util.js');

module.exports = (logger, clientSecrets, authentication, finapi, users, connections) => {
  const unauthorized = async (authorization) => {
    try {
      logger.log('info', 'authenticating user', { 'authorization': authorizaiton })
      await finapi.userInfo(authorization)

      // Return nothing on success.
      return null
    } catch (err) {
      logger.log('error', 'invalid token', { 'authorization': authorizaiton })
      return lambdaUtil.CreateErrorResponse(401, 'unauthorized');
    }
  }

  return {
    getBankByBLZ: async (blz) => {
      let authorization

      try {
        authorization = await authentication.getClientCredentialsToken(clientSecrets)
          .then(token => lambdaUtil.CreateAuthHeader(token))
      } catch (err) {
        logger.log('error', 'error while authorizing against finapi', err)
        return lambdaUtil.CreateErrorResponse(401, 'could not obtain an authentication token');
      }

      return finapi.listBanksByBLZ(authorization, blz)
        .then(response => lambdaUtil.CreateResponse(200, response))
        .catch(err => {
          // TODO distinguish unauthorized from other errors
          logger.log('error', 'error listing banks by BLZ', err)
          return lambdaUtil.CreateErrorResponse(500, 'could not list banks')
        })
    },

    getWebformId: async (authorization, bankId) => {
      return finapi.importConnection(authorization, bankId)
        .then(response => lambdaUtil.CreateResponse(200, response))
        .catch(err => {
          logger.log('error', 'error importing connection', err)
          return lambdaUtil.CreateErrorResponse(500, 'could not import connection')
        });
    },

    fetchWebFormInfo: async (authorization, username, webId) => {
      const unauthorized = await unauthorized(authorization)
      if (unauthorized) {
        return unauthorized
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
        logger.log('error', 'could not fetch web form with id ' + webid)
        return lambdaUtil.CreateErrorResponse(500, 'could not fetch web form');
      }

      const body = webForm.serviceResponseBody
      const bankConnection = connections.new(body.id, body.bankId)
      bankConnection.bankAccounts = body.accountIds

      user.bankConnections.push(body.id)

      // TODO: rollback
      return Promise.all([users.save(user), connections.save(bankConnection)])
        .then(res => lambdaUtil.createResponse(200, webForm))
        .catch(err => lambdaUtil.createError(500, 'could not persist user data'))
    },

    getAllowance: async (authorization, username) => {
      const unauthorized = await unauthorized(authorization)

      if (unauthorized) {
        return unauthorized
      }

      const user = await users.findById(username)

      if (!user) {
        logger.log('info', 'no user found for username ' + username)
        return lambdaUtil.CreateErrorResponse(404, 'user not found');
      }

      return lambdaUtil.CreateResponse(200, { 'allowance': user.allowance });
    }
  }
};
