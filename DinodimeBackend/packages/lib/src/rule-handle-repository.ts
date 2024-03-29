import DynamoDB, { DeleteItemInput } from "aws-sdk/clients/dynamodb";
import { RuleHandle } from "./rule-handle";

export interface RuleHandleRepository {
  findById(id: string): Promise<RuleHandle | null>;
  save(ruleHandle: RuleHandle): Promise<RuleHandle>;
  delete(ruleHandle: RuleHandle): Promise<void>;
}

export class DynamoDBRuleHandleRepository implements RuleHandleRepository {
  private client: DynamoDB;
  private tableName: string;

  constructor(client: DynamoDB, tableName: string) {
    this.client = client;
    this.tableName = tableName;
  }

  async findById(id: string): Promise<RuleHandle | null> {
    const params = {
      Key: {
        id: {
          S: id
        }
      },
      TableName: this.tableName
    };

    const data = await this.client.getItem(params).promise();

    if (data.Item) {
      return this.decodeRule(data.Item);
    } else {
      return null;
    }
  }

  async save(ruleHandle: RuleHandle): Promise<RuleHandle> {
    const params = {
      ReturnConsumedCapacity: "TOTAL",
      TableName: this.tableName,
      Item: this.encodeRule(ruleHandle)
    };

    await this.client.putItem(params).promise();
    return ruleHandle;
  }

  async delete(ruleHandle: RuleHandle): Promise<void> {
    const deleteItemInput: DeleteItemInput = {
      Key: {
        id: {
          S: ruleHandle.id
        }
      },
      TableName: this.tableName
    };

    await this.client.deleteItem(deleteItemInput).promise();
  }

  private decodeRule(data: DynamoDB.AttributeMap): RuleHandle {
    return {
      id: data["id"]["S"]!,
      finApiId: parseInt(data["finApiId"]["N"]!),
      userId: data["userId"]["S"]!,
      type: data["type"]["S"]!,
      args: data["args"] ? JSON.parse(data["type"]["S"]!) : undefined
    };
  }

  private encodeRule(rule: RuleHandle): DynamoDB.PutItemInputAttributeMap {
    const result: DynamoDB.PutItemInputAttributeMap = {
      id: {
        S: rule.id
      },
      finApiId: {
        N: rule.finApiId.toString()
      },
      userId: {
        S: rule.userId.toString()
      },
      type: {
        S: rule.type
      }
    };

    if (rule.args) {
      result["args"] = {
        S: JSON.stringify(rule.args)
      };
    }

    return result;
  }
}

export class InMemoryRuleHandleRepository implements RuleHandleRepository {
  private repository: { [index: string]: RuleHandle } = {};

  findById(id: string): Promise<RuleHandle | null> {
    const result = this.repository[id];
    return Promise.resolve(result || null);
  }

  save(ruleHandle: RuleHandle): Promise<RuleHandle> {
    this.repository[ruleHandle.id] = ruleHandle;
    return Promise.resolve(ruleHandle);
  }

  delete(ruleHandle: RuleHandle): Promise<void> {
    delete this.repository[ruleHandle.id];
    return Promise.resolve();
  }
}
