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

const hasAuthorization = header => {
  return header['authorization'] || header['Authorization']
}

exports.default = {
  'createResponse': createResponse,
  'createError': createError,
  'authorizationHeader': util.authorizationHeader
}
