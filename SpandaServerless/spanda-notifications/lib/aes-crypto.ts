import Crypto from "./crypto";
import { AesUtil } from "./aes-util";

export default class AesCrypto implements Crypto {
  private aesUtil: AesUtil;
  private decryptionKey: string;

  constructor(decryptionKey: string, keySize = 128, iterationCount = 1000) {
    this.decryptionKey = decryptionKey;
    this.aesUtil = new AesUtil(keySize, iterationCount);
  }

  decrypt(cipherText: string): string {
    return this.aesUtil.decrypt(this.decryptionKey, cipherText);
  }

  encrypt(plainText: string): string {
    return this.aesUtil.encrypt(this.decryptionKey, plainText);
  }
}
