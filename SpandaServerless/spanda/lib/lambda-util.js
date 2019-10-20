'use strict';

const util = require('./util');

const HasMissingProperty = (obj, properties) => {
  for (let i = 0; i < properties.length; i++) {
    const expectedProperty = properties[i];

    if (!Object.prototype.hasOwnProperty.call(obj, expectedProperty)) {
      return expectedProperty;
    }
  }

  return null;
}
const CreateResponse = (status, body) => {
  return { "statusCode": status, "headers": { "Content-Type": "application/json" }, "body": JSON.stringify(body) };
};

const CreateErrorResponse = (status, message) => {
  return CreateResponse(status, {
    "message": message
  });
};

exports.CreateInternalErrorResponse = (err) => {
  return CreateErrorResponse(500, err);
};

exports.hasAuthorization = (header) => {
  return header['authorization'] || header['Authorization'];
};

exports.HasMissingProperty = HasMissingProperty;
exports.CreateAuthHeader = util.CreateAuthHeader;
exports.CreateResponse = CreateResponse;
exports.CreateErrorResponse = CreateErrorResponse;
