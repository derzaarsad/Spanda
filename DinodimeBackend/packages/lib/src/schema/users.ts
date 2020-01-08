import { Schema } from "./schema";
import { User } from "../users";

const attributes = [
  "username",
  "creationdate",
  "allowance",
  "isallowanceready",
  "email",
  "phone",
  "isautoupdateenabled",
  "bankconnectionids",
  "activewebformid",
  "activewebformauth"
];

const asObject = (row: Array<any>) => {
  return {
    username: row[0],
    creationDate: row[1],
    allowance: row[2],
    isAllowanceReady: row[3],
    email: row[4],
    phone: row[5],
    isAutoUpdateEnabled: row[6],
    bankConnectionIds: row[7] ? row[7] : [],
    activeWebFormId: row[8],
    activeWebFormAuth: row[9]
  };
};

export class UsersSchema implements Schema<User> {
  tableName: string;

  constructor(tableName: string = "users") {
    this.tableName = tableName;
  }

  attributes = attributes.join(",");

  columns = asObject(attributes);

  asRow(user: User) {
    return [
      user.username,
      user.creationDate,
      user.allowance,
      user.isAllowanceReady,
      user.email,
      user.phone,
      user.isAutoUpdateEnabled,
      user.bankConnectionIds.length === 0 ? null : "{" + user.bankConnectionIds.join(",") + "}",
      user.activeWebFormId,
      user.activeWebFormAuth
    ];
  }

  asObject(row: Array<any>) {
    return asObject(row);
  }
}
