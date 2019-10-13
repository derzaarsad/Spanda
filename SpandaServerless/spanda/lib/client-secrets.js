'use strict'

const Mutex = require('./mutex')

exports.Resolved = (clientId, clientSecret) => {
  return {
    getSecrets: async () => {
      return { clientId: clientId, clientSecret: clientSecret }
    },
  }
}

exports.FromSSM = (ssm, clientIdParam, clientSecretParam) => {
  const mutex = new Mutex()

  let resolved = false
  let credentials = null
  let error = null

  const requestParam = (paramName, encrypted) => {
    const parameterRequest = {
      Name: paramName,
      WithDecryption: encrypted,
    }

    return new Promise((resolve, reject) => {
      ssm.getParameter(parameterRequest, function(err, data) {
        if (err) {
          reject(err)
        } else {
          resolve(data.Parameter.Value)
        }
      })
    })
  }

  const resolveCredentials = async () => {
    if (!resolved) {
      try {
        const results = await Promise.all([
          requestParam(clientIdParam, false),
          requestParam(clientSecretParam, true),
        ])
        credentials = { clientId: results[0], clientSecret: results[1] }
      } catch (err) {
        error = err
      } finally {
        // note that the mutex should prevent race conditions
        resolved = true // eslint-disable-line require-atomic-updates
      }
    }
  }

  return {
    getSecrets: async () => {
      await mutex.synchronize(resolveCredentials)

      if (error) {
        throw error
      } else {
        return credentials
      }
    }
  }
}
