'use strict'

const qs = require('querystring')

const Basic = (http) => {
  const requestParams = secrets => {
    return {
      client_id: secrets.clientId,
      client_secret: secrets.clientSecret
    }
  }

  const ccRequest = secrets => {
    const formData = requestParams(secrets)
    formData['grant_type'] = 'client_credentials'

    return qs.stringify(formData)
  }

  const passwordRequest = (clientSecrets, user, pass) => {
    const formData = requestParams(clientSecrets)
    formData['grant_type'] = 'password'
    formData['username'] = user
    formData['password'] = pass

    return qs.stringify(formData)
  }

  const refresthTokenRequest = (clientSecrets, refreshToken) => {
    const formData = requestParams(clientSecrets)
    formData['grant_type'] = 'refresh_token'
    formData['refresh_token'] = refreshToken

    return qs.stringify(formData)
  }

  return {
    getClientCredentialsToken: async (clientSecrets) => {
      return clientSecrets.getSecrets()
        .then(secrets => http.post('/oauth/token', ccRequest(secrets)))
        .then(response => response.data)
    },

    getPasswordToken: async (clientSecrets, user, pass) => {
      return clientSecrets.getSecrets()
        .then(secrets => http.post('/oauth/token', passwordRequest(secrets, user, pass)))
        .then(response => response.data)
    },

    getRefreshToken: async (clientSecrets, refreshToken) => {
      return clientSecrets.getSecrets()
        .then(secrets => http.post('/oauth/token', refresthTokenRequest(secrets, refreshToken)))
        .then(response => response.data)
    }
  }
}

exports.Basic = Basic
