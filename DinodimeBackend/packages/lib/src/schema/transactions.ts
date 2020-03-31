import { Transaction } from "../transactions";
import { Schema } from "./schema";

const attributes = [
  "id",
  "accountid",
  "absamount",
  "isexpense",
  "bookingdate",
  "purpose",
  "counterpartname",
  "counterpartaccountnumber",
  "counterpartiban",
  "counterpartblz",
  "counterpartbic",
  "counterpartbankname"
];

const asObject = (row: Array<any>) => {
  return {
    id: row[0],
    accountId: row[1],
    absAmount: row[2],
    isExpense: row[3],
    bookingDate: row[4],
    purpose: row[5] !== null ? row[5] : undefined,
    counterPartName: row[6] !== null ? row[6] : undefined,
    counterPartAccountNumber: row[7] !== null ? row[7] : undefined,
    counterPartIban: row[8] !== null ? row[8] : undefined,
    counterPartBlz: row[9] !== null ? row[9] : undefined,
    counterPartBic: row[10] !== null ? row[10] : undefined,
    counterPartBankName: row[11] !== null ? row[11] : undefined
  };
};

export class TransactionsSchema implements Schema<Transaction> {
  tableName: string;

  constructor(tableName: string = "transactions") {
    this.tableName = tableName;
  }

  attributes = attributes;

  columns = asObject(attributes);

  asRow(transaction: Transaction) {
    return [
      transaction.id,
      transaction.accountId,
      transaction.absAmount,
      transaction.isExpense,
      transaction.bookingDate.toISOString(),
      transaction.purpose !== undefined ? transaction.purpose : null,
      transaction.counterPartName !== undefined ? transaction.counterPartName : null,
      transaction.counterPartAccountNumber !== undefined ? transaction.counterPartAccountNumber : null,
      transaction.counterPartIban !== undefined ? transaction.counterPartIban : null,
      transaction.counterPartBlz !== undefined ? transaction.counterPartBlz : null,
      transaction.counterPartBic !== undefined ? transaction.counterPartBic : null,
      transaction.counterPartBankName !== undefined ? transaction.counterPartBankName : null
    ];
  }

  asObject(row: Array<any>) {
    return asObject(row);
  }

  mapColumns(el: any) {
    return {
      id: el[this.columns.id],
      accountId: el[this.columns.accountId],
      absAmount: el[this.columns.absAmount],
      isExpense: el[this.columns.isExpense],
      bookingDate: el[this.columns.bookingDate],
      purpose: el[this.columns.purpose],
      counterPartName: el[this.columns.counterPartName],
      counterPartAccountNumber: el[this.columns.counterPartAccountNumber],
      counterPartIban: el[this.columns.counterPartIban],
      counterPartBlz: el[this.columns.counterPartBlz],
      counterPartBic: el[this.columns.counterPartBic],
      counterPartBankName: el[this.columns.counterPartBankName]
    };
  }
}
