import {
  Notification,
  EncryptedNewTransactions,
  DecryptedNewTransactionsNotification,
  EncryptedNewTransactionsNotification,
  DecryptedNewTransactions,
  TransactionDetails
} from "./finapi-notifications";
import Crypto from "./crypto";
import NotificationDecoder from "./notification-decoder";

/*
 * The Pass decoder returns its input.
 */
export class Pass<I extends Notification> implements NotificationDecoder<I, I> {
  map(notification: I): I {
    return notification;
  }
}

/*
 * A Decoder that decrypts the new transactions notification payload as described here:
 * https://finapi.zendesk.com/hc/en-us/articles/232324608-How-to-create-notification-rules-and-receive-notifications
 */
export class NewTransactionsDecryptor
  implements
    NotificationDecoder<
      EncryptedNewTransactionsNotification,
      DecryptedNewTransactionsNotification
    > {
  private crypto: Crypto;

  constructor(crypto: Crypto) {
    this.crypto = crypto;
  }

  map(notification: EncryptedNewTransactionsNotification): DecryptedNewTransactionsNotification {
    return {
      notificationRuleId: notification.notificationRuleId,
      triggerEvent: notification.triggerEvent,
      callbackHandle: notification.callbackHandle,
      newTransactions: notification.newTransactions.map((transaction: EncryptedNewTransactions) =>
        this.mapNewTransactions(transaction)
      )
    };
  }

  private mapNewTransactions(transaction: EncryptedNewTransactions): DecryptedNewTransactions {
    return {
      accountId: transaction.accountId,
      bankName: transaction.bankName,
      newTransactionsCount: transaction.newTransactionsCount,
      accountName: this.crypto.decrypt(transaction.accountName),
      accountNumber: this.crypto.decrypt(transaction.accountNumber),
      accountIban: transaction.accountIban ? this.crypto.decrypt(transaction.accountIban) : null,
      bankConnectionName: this.crypto.decrypt(transaction.bankConnectionName),
      details: transaction.details ? this.mapTransactionDetails(transaction.details) : undefined
    };
  }

  private mapTransactionDetails(encryptedDetail: string): TransactionDetails {
    const decryptedDetail = this.crypto.decrypt(encryptedDetail);
    return JSON.parse(decryptedDetail) as TransactionDetails;
  }
}
