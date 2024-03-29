"use strict";

const CryptoJS = require("crypto-js");

class AesUtil {
  constructor(keySize, iterationCount) {
    this.keySize = keySize / 32;
    this.iterationCount = iterationCount;
  }

  generateKey(dataDecryptionKey) {
    const salt = dataDecryptionKey;
    return CryptoJS.PBKDF2(dataDecryptionKey, CryptoJS.enc.Hex.parse(salt), {
      keySize: this.keySize,
      iterations: this.iterationCount
    });
  }

  encrypt(dataDecryptionKey, plainText) {
    const key = this.generateKey(dataDecryptionKey);
    const initialVector = dataDecryptionKey;
    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
      iv: CryptoJS.enc.Hex.parse(initialVector)
    });
    return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
  }

  decrypt(dataDecryptionKey, cipherText) {
    const key = this.generateKey(dataDecryptionKey);
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(cipherText)
    });
    const initialVector = dataDecryptionKey;
    const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
      iv: CryptoJS.enc.Hex.parse(initialVector)
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}

exports.AesUtil = AesUtil;
