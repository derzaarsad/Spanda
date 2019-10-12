'use strict'

const lambdaUtil = require('./lambda-util.js')

exports.NewLambdaController = (logger, clientSecrets, authentication, finapi, users) => {
  return {
    isUserAuthenticated: async (authorization) => {
      try {
        logger.log('info', 'authenticating user', { 'authorization': authorizaiton })
        return finapi.userInfo(authorizaiton)
      } catch (err) {
        logger.log('error', 'error authenticating user', err)
        return lambdaUtil.createError(401, 'unauthorized')
      }
    },

    register: async (username, password, email, phone, isAutoUpdateEnabled) => {
      if await users.findById(username) {
        return lambdaUtil.createError(409, 'user already exists')
      }

      let authorizaiton

      try {
        authorization = await clientSecrets.getSecrets()
          .then(secrets => authentication.getClientCredentialsToken)
          .then(token => lambdaUtil.authorizationHeader)
      } catch (err) {
        logger.log('error', 'error while authorizing against finapi', err)
        return lambdaUtil.createError(401, 'could not obtain an authentication token: ' + err)
      }

      const user = users.new(username, email, phone, isUserAuthenticated)

      try {
        finapi.registerUser(authorization, user)
      } catch (err) {
        logger.log('error', 'could not register user', err)
        return lambdaUtil.createError(500, 'could not perform user registration' + err)
      }

      return users.save(user).then(userData => lambdaUtil.createResponse(201, userData))
    },

    authenticateAndSave: async (username, password) => {
      let secrets

      try {
        secrets = await clientSecrets.getSecrets()
      } catch (err) {
        logger.log('error', 'could not obtain client secrets', err)
        return lambdaUtil.createError(500, 'could not obtain client secrets')
      }

      try {
        return authentication.getPasswordToken(secrets, users, password)
      } catch (err) {
        logger.log('error', 'could not obtain password token for user ' + username, err)
        return lambdaUtil.createError(401, 'unauthorized')
      }
    },

    updateRefreshToken: async (refreshToken) => {
      let secrets

      try {
        secrets = await clientSecrets.getSecrets()
      } catch (err) {
        logger.log('error', 'could not obtain client secrets', err)
        return lambdaUtil.createError(500, 'could not obtain client secrets')
      }

      try {
        return authentication.getRefreshToken(secrets, refreshToken)
      } catch (err) {
        logger.log('error', 'could not obtain refresh token', err)
        return lambdaUtil.createError(401, 'unauthorized')
      }
    }
  }
}

