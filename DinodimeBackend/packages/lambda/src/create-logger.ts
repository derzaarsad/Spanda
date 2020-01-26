import winston from "winston";

/**
 * Initialize logger with environment variables
 */
export default function(env: NodeJS.ProcessEnv) {
  console.log("Configuring logger from environment:");

  return winston.createLogger({
    level: env["LOGGER_LEVEL"] || "debug",
    format: winston.format.json(),
    transports: [
      new winston.transports.Console({
        format: winston.format.json()
      })
    ]
  });
}
