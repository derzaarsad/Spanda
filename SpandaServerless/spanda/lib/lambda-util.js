'use strict';

const util = require('./util');

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

exports.CreateAuthHeader = util.CreateAuthHeader;
exports.CreateResponse = CreateResponse;
exports.CreateErrorResponse = CreateErrorResponse;
