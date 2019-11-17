'use strict';

const util = require('./util');
const crypto = require('crypto');
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

exports.EncryptText = (text) => {
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
 };
 
 exports.DecryptText = (text) => {
  let iv = Buffer.from(text.iv, 'hex');
  let encryptedText = Buffer.from(text.encryptedData, 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
 }

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
