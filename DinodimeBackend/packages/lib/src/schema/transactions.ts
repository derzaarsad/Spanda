import { Transaction } from "../transactions";
import { Schema } from "./schema";

const attributes = [
  "id",
  "accountid",
  "amount",
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
    amount: row[2],
    bookingDate: row[3],
    purpose: row[4],
    counterPartName: row[5],
    counterPartAccountNumber: row[6],
    counterPartIban: row[7],
    counterPartBlz: row[8],
    counterPartBic: row[9],
    counterPartBankName: row[10]
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
      transaction.amount,
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
