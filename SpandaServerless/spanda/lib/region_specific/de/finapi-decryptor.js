'use strict'

const CryptoJS = require("crypto-js");

const DEFAULT_KEY_SIZE = 128;
const DEFAULT_ITERATION_COUNT = 1000;

const AesUtil = function (keySize, iterationCount) {
  this.keySize = keySize / 32;
  this.iterationCount = iterationCount;
};

AesUtil.prototype.generateKey = function (dataDecryptionKey) {
  var salt = dataDecryptionKey;
  return CryptoJS.PBKDF2(
    dataDecryptionKey,
    CryptoJS.enc.Hex.parse(salt),
    {
      keySize: this.keySize,
      iterations: this.iterationCount
    });
};

AesUtil.prototype.encrypt = function (dataDecryptionKey, plainText) {
  var key = this.generateKey(dataDecryptionKey);
  var initialVector = dataDecryptionKey;
  var encrypted = CryptoJS.AES.encrypt(
    plainText,
    key,
    {
      iv: CryptoJS.enc.Hex.parse(initialVector)
    });
  return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
};

AesUtil.prototype.decrypt = function (dataDecryptionKey, cipherText) {
  var key = this.generateKey(dataDecryptionKey);
  var cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: CryptoJS.enc.Base64.parse(cipherText)
  });
  var initialVector = dataDecryptionKey;
  var decrypted = CryptoJS.AES.decrypt(
    cipherParams,
    key,
    {
      iv: CryptoJS.enc.Hex.parse(initialVector)
    });
  return decrypted.toString(CryptoJS.enc.Utf8);
};

const create = (aesUtil, decryptionKey) => {
  return {
    encrypt: (plainText) => aesUtil.encrypt(decryptionKey, plainText),
    decrypt: (cipherText) => aesUtil.decrypt(decryptionKey, cipherText)
  }
}

module.exports = {
  new: (decryptionKey) => {
    const aesUtil = new AesUtil(DEFAULT_KEY_SIZE, DEFAULT_ITERATION_COUNT);
    return create(aesUtil, decryptionKey);
  }
}

