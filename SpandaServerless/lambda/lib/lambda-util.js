'use strict'

const util = require('./util')

const createResponse = (status, body) {
  return { "statusCode": status, "body": body }
}

const createError = (status, message) {
  return createResponse(status, {
    "message": message
  })
}

exports.default = {
  'createResponse': createResponse,
  'createError': createError,
  'authorizationHeader': util.authorizationHeader
}
