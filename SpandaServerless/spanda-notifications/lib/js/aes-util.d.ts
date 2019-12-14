export declare class AesUtil {
  constructor(keySize: number, iterationCount: number);
  encrypt(dataDecryptionKey: string, plainText: string): string;
  decrypt(dataDecryptionKey: string, cipherText: string): string;
}
