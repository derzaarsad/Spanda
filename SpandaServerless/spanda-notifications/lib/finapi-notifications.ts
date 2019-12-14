export type Notification = {
  notificationRuleId: number;
  callbackHandle: string;
};

export type TransactionDetail = {
  id: number;
  finapiBookingDate: string;
  bankBookingDate: string;
  amount: number;
  counterpartName: string;
  purpose: string;
  isAdjustingEntry: boolean;
};

export type NewTransactions = {
  accountId: number;
  accountName: string;
  accountNumber: string;
  accountIban: string | null;
  bankName: string;
  bankConnectionName: string;
  newTransactionsCount: number;
};

export type EncryptedNewTransactions = NewTransactions & {
  details: string | undefined;
};

export type DecryptedNewTransactions = NewTransactions & {
  details: Array<TransactionDetail> | undefined;
};

export type EncryptedTransactionsNotification = Notification & {
  triggerEvent: "NEW_TRANSACTIONS";
  newTransactions: Array<EncryptedNewTransactions>;
};

export type DecryptedTransactionsNotification = Notification & {
  triggerEvent: "NEW_TRANSACTIONS";
  newTransactions: Array<DecryptedNewTransactions>;
};
