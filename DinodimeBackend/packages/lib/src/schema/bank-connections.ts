import { Schema } from "./schema";
import { BankConnection } from "../bank-connections";

const attributes = ["id", "bankid", "bankaccountids"];

const asObject = (row: Array<any>) => {
  return {
    id: row[0],
    bankId: row[1],
    bankAccountIds: row[2] ? row[2] : []
  };
};

export class BankConnectionsSchema implements Schema<BankConnection> {
  tableName: string;
  attributes = attributes.join(",");
  columns = asObject(attributes);

  constructor(tableName: string = "bankconnections") {
    this.tableName = tableName;
  }

  asRow(bankConnection: BankConnection) {
    return [
      bankConnection.id,
      bankConnection.bankId,
      bankConnection.bankAccountIds.length === 0
        ? null
        : "{" + bankConnection.bankAccountIds.join(",") + "}"
    ];
  }

  asObject(row: Array<any>) {
    return asObject(row);
  }
}
