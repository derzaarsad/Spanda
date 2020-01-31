import { RDS } from "aws-sdk/clients/all";
import { Context } from "aws-lambda";

const rds = new RDS();

interface DatabaseInstanceQuery {
  dbInstanceIdentifier: string;
}

interface DatabaseInstanceDetails {
  dbInstanceIdentifier: string;
  endpoint: string;
  port: number;
}

export const handler = async (
  event: DatabaseInstanceQuery,
  context: Context
): Promise<DatabaseInstanceDetails> => {
  rds.describeDBInstances({ DBInstanceIdentifier: event.dbInstanceIdentifier });
  return { dbInstanceIdentifier: "test", endpoint: "test", port: 666 };
};
