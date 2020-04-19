import { TransactionFrequency } from "./TransactionFrequency";

export type SharedRecurrentTransaction = {
    id: number;
    accountId: number;
    absAmount: number;
    isExpense: boolean;
    isConfirmed: boolean;
    frequency: TransactionFrequency;
    counterPartName: string;
  };