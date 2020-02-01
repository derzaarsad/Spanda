import winston from "winston";
import { RDS } from "aws-sdk/clients/all";
import { Context } from "aws-lambda";

interface DatabaseInstanceQuery {
  dbInstanceIdentifier: string;
}

interface DatabaseInstanceDetails {
  dbInstanceIdentifier: string;
  dbInstanceArn: string;
  dbInstanceEndpoint: string;
  dbInstancePort: number;
  postgresJdbcUrl: string;
}

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

const databaseName = env["DATABASE_NAME"];
const rds = new RDS();

/**
 * Describes a database instance given a database instance identifier.
 *
 * @param event a database instance query.
 * @param context the execution context.
 */
export const handler = async (
  event: DatabaseInstanceQuery,
  context: Context
): Promise<DatabaseInstanceDetails> => {
  const dbInstanceIdentifier = event.dbInstanceIdentifier;
  log.debug("Invoking describe instance", { dbInstanceIdentifier: dbInstanceIdentifier });

  const description = await rds
    .describeDBInstances({ DBInstanceIdentifier: dbInstanceIdentifier })
    .promise();

  const instances = description.DBInstances;

  if (instances === undefined || instances.length < 1) {
    throw new Error(`No instances found for id ${dbInstanceIdentifier}`);
  }

  const instance = instances[0];

  if (instance.DBInstanceStatus != "available") {
    throw new Error(
      `Expected the database to be available, but was ${instance.DBInstanceStatus} instead`
    );
  }

  const endpoint = instance.Endpoint!.Address!;
  const port = instance.Endpoint!.Port!;

  let url = `jdbc:postgresql://${endpoint}:${port}`;
  if (databaseName) {
    url = url + "/" + databaseName;
  }

  const result = {
    dbInstanceIdentifier: dbInstanceIdentifier,
    dbInstanceArn: instance.DBInstanceArn!,
    dbInstanceEndpoint: endpoint,
    dbInstancePort: port,
    postgresJdbcUrl: url
  };

  log.debug("Returning database instance details", { details: result });
  return result;
};
