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

export type TransactionDetails = {
  transactionDetails: Array<TransactionDetail>;
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
  details: TransactionDetails | undefined;
};

export type EncryptedNewTransactionsNotification = Notification & {
  triggerEvent: "NEW_TRANSACTIONS";
  newTransactions: Array<EncryptedNewTransactions>;
};

export type DecryptedNewTransactionsNotification = Notification & {
  triggerEvent: "NEW_TRANSACTIONS";
  newTransactions: Array<DecryptedNewTransactions>;
};
