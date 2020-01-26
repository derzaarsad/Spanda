import crypto from "crypto";
import { AesUtil } from "./aes-util";

export type EncryptedData = {
  iv: string;
  cipherText: string;
};

export interface Encryptions {
  EncryptText(plainText: string): EncryptedData;
  DecryptText(encryptedData: EncryptedData): string;
}

export interface Crypto {
  encrypt(plainText: string): string;
  decrypt(cipherText: string): string;
}

export class AesCrypto implements Crypto {
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

export class CallbackCrypto implements Encryptions {
  key = crypto.randomBytes(32);
  iv = crypto.randomBytes(16);

  EncryptText(plainText: string): EncryptedData {
    let cipher = crypto.createCipheriv("aes-256-cbc", this.key, this.iv);
    let encrypted = cipher.update(plainText);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: this.iv.toString("hex"), cipherText: encrypted.toString("hex") };
  }

  DecryptText(encryptedData: EncryptedData): string {
    let iv = Buffer.from(encryptedData.iv, "hex");
    let encryptedText = Buffer.from(encryptedData.cipherText, "hex");
    let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(this.key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}
