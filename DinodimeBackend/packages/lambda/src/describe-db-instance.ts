import winston from "winston";
import { RDS } from "aws-sdk/clients/all";
import { Context } from "aws-lambda";

const env = process.env;

const log = winston.createLogger({
  level: env["LOGGER_LEVEL"] || "debug",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.json()
    })
  ]
});

const rds = new RDS();

interface DatabaseInstanceQuery {
  dbInstanceIdentifier: string;
}

interface DatabaseInstanceDetails {
  dbInstanceIdentifier: string;
  dbInstanceArn: string;
  endpoint: string;
  port: number;
}

export const handler = async (
  event: DatabaseInstanceQuery,
  context: Context
): Promise<DatabaseInstanceDetails> => {
  log.debug("Received event", event);

  const dbInstanceIdentifier = event.dbInstanceIdentifier;

  const description = await rds
    .describeDBInstances({ DBInstanceIdentifier: dbInstanceIdentifier })
    .promise()
    .then();

  const instances = description.DBInstances;

  if (instances.length < 1) {
    throw new Error(`No instances found for id ${dbInstanceIdentifier}`);
  }

  const instance = instances[0];

  if (instance.DBInstanceStatus != "available") {
    throw new Error(
      `Expected the database to be available, but was ${instance.DBInstanceStatus} instead`
    );
  }

  return {
    dbInstanceIdentifier: dbInstanceIdentifier,
    dbInstanceArn: instance.DBInstanceArn,
    endpoint: instance.Endpoint.Address,
    port: instance.Endpoint.Port
  };
};
