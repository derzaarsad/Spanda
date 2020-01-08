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
    purpose: row[5],
    counterPartName: row[6],
    counterPartAccountNumber: row[7],
    counterPartIban: row[8],
    counterPartBlz: row[9],
    counterPartBic: row[10],
    counterPartBankName: row[11]
  };
};

export class TransactionsSchema implements Schema<Transaction> {
  tableName: string;

  constructor(tableName: string = "transactions") {
    this.tableName = tableName;
  }

  attributes = attributes.join(",");

  columns = asObject(attributes);

  asRow(transaction: Transaction) {
    return [
      transaction.id,
      transaction.accountId,
      transaction.absAmount,
      transaction.isExpense,
      transaction.bookingDate.toISOString(),
      transaction.purpose,
      transaction.counterPartName,
      transaction.counterPartAccountNumber,
      transaction.counterPartIban,
      transaction.counterPartBlz,
      transaction.counterPartBic,
      transaction.counterPartBankName
    ];
  }

  asObject(row: Array<any>) {
    return asObject(row);
  }
}
