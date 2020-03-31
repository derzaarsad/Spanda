import { DynamoDB } from "aws-sdk/clients/all";
import { Repository } from "./repository";

export type BankAccount = {
  id: number;
  bankConnectionId: number;
  accountName: string;
  iban: string;
  accountCurrency: string;
};

export namespace BankAccounts {
  interface BankAccountsRepository extends Repository<number, BankAccount> {}

  export class InMemoryRepository implements BankAccountsRepository {
    private repository: { [key: number]: BankAccount };

    constructor() {
      this.repository = [];
    }

    async findById(id: number) {
      return this.repository[id];
    }

    async save(bankAccount: BankAccount) {
      this.repository[bankAccount.id] = bankAccount;
      return bankAccount;
    }

    async delete(bankAccount: BankAccount) {
      delete this.repository[bankAccount.id];
    }

    async deleteAll() {
      for (let key in this.repository) {
        delete this.repository[key];
      }
    }
  }

  export class DynamoDbRepository implements BankAccountsRepository {
    private client: DynamoDB;
    private tableName: string;

    constructor(client: DynamoDB, tableName: string) {
      this.client = client;
      this.tableName = tableName;
    }

    private decodeBankAccount(data: DynamoDB.AttributeMap): BankAccount {
      return {
        id: parseInt(data["id"]!["N"]!),
        bankConnectionId: parseInt(data["bankConnectionId"]!["N"]!),
        accountName: data["accountName"]!["S"]!,
        iban: data["iban"]!["S"]!,
        accountCurrency: data["accountCurrency"]!["S"]!
      };
    }

    private encodeBankAccount(bankAccount: BankAccount, returnValues: string): DynamoDB.UpdateItemInput {
      let expression = "SET #BC = :bc, #A = :a, #I = :i, #C = :c";

      const attributes = {
        "#BC": "bankConnectionId",
        "#A": "accountName",
        "#I": "iban",
        "#C": "accountCurrency"
      };

      const values = {
        ":bc": { N: bankAccount.bankConnectionId.toString() },
        ":a": { S: bankAccount.accountName },
        ":i": { S: bankAccount.iban },
        ":c": { S: bankAccount.accountCurrency }
      };

      return {
        Key: {
          id: { N: bankAccount.id.toString() }
        },
        TableName: this.tableName,
        ExpressionAttributeNames: attributes,
        ExpressionAttributeValues: values,
        UpdateExpression: expression,
        ReturnValues: returnValues
      };
    }

    async findById(id: number) {
      const params: DynamoDB.GetItemInput = {
        Key: {
          id: {
            N: id.toString()
          }
        },
        TableName: this.tableName
      };

      return this.client
        .getItem(params)
        .promise()
        .then(data => {
          if (data.Item) {
            return this.decodeBankAccount(data.Item);
          } else {
            return null;
          }
        });
    }

    async save(bankAccount: BankAccount) {
      const params = this.encodeBankAccount(bankAccount, "NONE");
      return this.client
        .updateItem(params)
        .promise()
        .then(() => bankAccount);
    }

    deleteAll(): Promise<void> {
      throw new Error("Method not implemented.");
    }

    delete(bankAccount: BankAccount): Promise<void> {
      throw new Error("Method not implemented.");
    }
  }
}
