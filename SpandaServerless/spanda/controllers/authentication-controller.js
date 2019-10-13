'use strict';

const lambdaUtil = require('../lib/lambda-util.js');

module.exports = (logger, clientSecrets, authentication, finapi, users) => {
  return {
    isUserAuthenticated: async (authorization) => {

      return finapi.userInfo(authorizaiton).then(response => lambdaUtil.CreateResponse(200, response))
        .catch(err => {
          logger.log('error', 'error authenticating user', err)
          return lambdaUtil.CreateErrorResponse(401, 'unauthorized')
        });
    },

    registerUser: async (username, password, email, phone, isAutoUpdateEnabled) => {
      if (await users.findById(username)) {
        return lambdaUtil.CreateErrorResponse(409, 'user already exists');
      }

      let authorizaiton

      try {
        authorization = await authentication.getClientCredentialsToken(clientSecrets)
          .then(token => lambdaUtil.CreateAuthHeader(token))
      } catch (err) {
        logger.log('error', 'error while authorizing against finapi', err)
        return lambdaUtil.CreateErrorResponse(401, 'could not obtain an authentication token');
      }

      const user = users.new(username, email, phone, isUserAuthenticated)

      try {
        await finapi.registerUser(authorization, user)
      } catch (err) {
        logger.log('error', 'could not register user', err)
        return lambdaUtil.CreateErrorResponse(500, 'could not perform user registration');
      }

      return users.save(user).then(userData => lambdaUtil.CreateResponse(201, userData));
    },

    authenticateAndSave: async (username, password) => {
      let secrets

      try {
        secrets = await clientSecrets.getSecrets()
      } catch (err) {
        logger.log('error', 'could not obtain client secrets', err)
        return lambdaUtil.CreateErrorResponse(500, 'could not obtain client secrets');
      }

      return authentication.getPasswordToken(secrets, users, password)
        .then(response => lambdaUtil.CreateResponse(200, response))
        .catch(err => {
          logger.log('error', 'could not obtain password token for user ' + username, err)
          return lambdaUtil.CreateErrorResponse(401, 'unauthorized')
        });
    },

    updateRefreshToken: async (refreshToken) => {
      let secrets

      try {
        secrets = await clientSecrets.getSecrets()
      } catch (err) {
        logger.log('error', 'could not obtain client secrets', err)
        return lambdaUtil.CreateErrorResponse(500, 'could not obtain client secrets');
      }

      return authentication.getRefreshToken(secrets, refreshToken)
        .then(response => lambdaUtil.CreateResponse(200, response))
        .catch(err => {
          logger.log('error', 'could not obtain refresh token', err)
          return lambdaUtil.CreateErrorResponse(401, 'unauthorized')
        });
    }
  }
};
