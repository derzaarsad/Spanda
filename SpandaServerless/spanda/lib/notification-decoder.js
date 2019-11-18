'use strict'

/*
 * This module defines the decoder interface, which is responsible for transforming an incoming
 * notification to a target representation.
 */

/*
 * The Pass constructor returns a Decoder that just returns its input.
 */
exports.Pass = () => {
  return {
    map: (notification) => {
      return notification;
    }
  }
}

/*
 * The DecryptNewTransactions constructor returns a Decoder that decrypts the new transactions
 * notification payload as described here:
 * https://finapi.zendesk.com/hc/en-us/articles/232324608-How-to-create-notification-rules-and-receive-notifications
 */
exports.DecryptNewTransactions = (decryptor) => {
  const mapTransactionDetails = encryptedDetail => JSON.parse(decryptor.decrypt(encryptedDetail))

  const mapTransaction = transaction => {
    const result = {
      accountId: transaction.accountId,
      bankName: transaction.bankName,
      newTransactionsCount: transaction.newTransactionsCount,
      accountName: decryptor.decrypt(transaction.accountName),
      accountNumber: decryptor.decrypt(transaction.accountNumber),
      accountIban: (transaction.accountIban) ? decryptor.decrypt(transaction.accountIban) : null,
      bankConnectionName: decryptor.decrypt(transaction.bankConnectionName)
    };

    if (transaction.details) {
      result.details = mapTransactionDetails(transaction.details);
    }

    return result;
  }

  return {
    map: (notification) => {
      const result = {
        notificationRuleId: notification.notificationRuleId,
        triggerEvent: notification.triggerEvent,
        callbackHandle: notification.callbackHandle
      }

      result.newTransactions = notification.newTransactions.map(transaction => mapTransaction(transaction));

      return result;
    }
  }
}
