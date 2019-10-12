'use strict'

const util = require('./util')

const createResponse = (status, body) => {
  return { "statusCode": status, "headers": { "Content-Type": "application/json" }, "body": JSON.stringify(body) }
}

const createError = (status, message) => {
  return createResponse(status, {
    "message": message
  })
}

const handleException = (err) => {
  return createResponse(500, { "message": err })
}

const hasAuthorization = header => {
  return header['authorization'] || header['Authorization']
}

exports.default = {
  'handleException': handleException,
  'createResponse': createResponse,
  'createError': createError,
  'authorizationHeader': util.authorizationHeader
}
