import { RecurrentTransaction } from "../recurrent-transactions";
import { Schema } from "./schema";

const attributes = ["id", "accountid", "transactionids", "absamount", "isexpense", "isconfirmed", "frequency", "counterpartname"];

const asObject = (row: Array<any>) => {
  return {
    id: row[0],
    accountId: row[1],
    transactionIds: row[2] ? row[2] : [],
    absAmount: row[3],
    isExpense: row[4],
    isConfirmed: row[5],
    frequency: row[6],
    counterPartName: row[7]
  };
};

export class RecurrentTransactionsSchema implements Schema<RecurrentTransaction> {
  tableName: string;

  constructor(tableName: string = "recurrenttransactions") {
    this.tableName = tableName;
  }

  attributes = attributes;

  columns = asObject(attributes);

  asRow(transaction: RecurrentTransaction) {
    return [
      transaction.id,
      transaction.accountId,
      transaction.transactionIds.length === 0 ? null : "{" + transaction.transactionIds.join(",") + "}",
      transaction.absAmount,
      transaction.isExpense,
      transaction.isConfirmed,
      transaction.frequency,
      transaction.counterPartName
    ];
  }

  asObject(row: Array<any>) {
    return asObject(row);
  }

  mapColumns(el: any) {
    return {
      id: el[this.columns.id],
      accountId: el[this.columns.accountId],
      transactionIds: el[this.columns.transactionIds],
      absAmount: el[this.columns.absAmount],
      isExpense: el[this.columns.isExpense],
      isConfirmed: el[this.columns.isConfirmed],
      frequency: el[this.columns.frequency],
      counterPartName: el[this.columns.counterPartName]
    };
  }
}
