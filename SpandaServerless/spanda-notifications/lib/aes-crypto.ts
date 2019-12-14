import Crypto from "./crypto";
import { AesUtil } from "./js/aes-util";

export class AesCrypto implements Crypto {
  private aesUtil: AesUtil;
  private decryptionKey: string;

  constructor(decryptionKey: string, keySize: number = 128, iterationCount: number = 1000) {
    this.decryptionKey = decryptionKey;
    this.aesUtil = new AesUtil(keySize, iterationCount);
  }

  decrypt(cipherText: string) {
    return this.aesUtil.decrypt(this.decryptionKey, cipherText);
  }

  encrypt(plainText: string) {
    return this.aesUtil.encrypt(this.decryptionKey, plainText);
  }
}
