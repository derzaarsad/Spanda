import { Authentication, Basic } from "dinodime-lib";
import { BankConnections, Users, Transactions, RecurrentTransactions } from "dinodime-lib";
import { ClientSecretsProvider, Resolved } from "dinodime-lib";
import { Crypto, AesCrypto } from "dinodime-lib";
import { FinAPI } from "dinodime-lib";
import { FirebaseMessaging } from "dinodime-lib";
import winston from "winston";
import axios from "axios";
import { BackendProvider } from "./backend-provider";

import InMemoryBackendProvider from "./in-memory-backend-provider";
import DynamoDBBackendProvider from "./dynamodb-backend-provider";
import PostgresBackendProvider from "./postgres-backend-provider";

export class ServiceProvider {
  readonly clientSecrets: ClientSecretsProvider;
  readonly authentication: Authentication;
  readonly bankInterface: FinAPI;
  readonly firebaseMessaging: FirebaseMessaging;
  readonly users: Users.UsersRepository;
  readonly connections: BankConnections.BankConnectionsRepository;
  readonly recurrentTransactions: RecurrentTransactions.RecurrentTransactionsRepository;
  readonly encryptions: Crypto;
  readonly transactions: Transactions.TransactionsRepository;
  readonly logger: winston.Logger;

  constructor(env: NodeJS.ProcessEnv) {
    console.log("Configuring controllers from environment:");
    console.log(JSON.stringify(env));

    let storageBackend: BackendProvider;
    if (env["STORAGE_BACKEND"] === "IN_MEMORY") {
      storageBackend = new InMemoryBackendProvider();
    } else {
      if (env["STORAGE_BACKEND"] === "DYNAMODB") {
        storageBackend = new DynamoDBBackendProvider(env);
      } else if (env["STORAGE_BACKEND"] === "POSTGRESQL") {
        storageBackend = new PostgresBackendProvider(env);
      } else {
        throw new Error(`unknown storage type: ${env["STORAGE_BACKEND"]}`);
      }
    }

    const baseURL = env["FINAPI_URL"] || "https://sandbox.finapi.io";
    const timeout = env["FINAPI_TIMEOUT"];

    const httpClient = axios.create({
      baseURL: baseURL,
      timeout: timeout !== undefined ? parseInt(timeout) : 3000,
      headers: { Accept: "application/json" },
    });

    const finAPIClientId = env["FINAPI_CLIENT_ID"];
    const finAPIClientSecret = env["FINAPI_CLIENT_SECRET"];
    const finAPIDecryptionKey = env["FINAPI_DECRYPTION_KEY"];

    if (finAPIClientId === undefined || finAPIClientSecret === undefined || finAPIDecryptionKey === undefined) {
      throw new Error("insufficient finAPI credentials given");
    }

    const firebaseUrl = "https://fcm.googleapis.com/fcm/send";
    const firebaseServerKey = env["FIREBASE_SERVER_KEY"];
    const pushClient = axios.create({
      baseURL: firebaseUrl,
      timeout: timeout !== undefined ? parseInt(timeout) : 3000,
      headers: { Accept: "application/json" },
    });

    if (firebaseServerKey === undefined) {
      throw new Error("insufficient firebase credentials given");
    }

    this.encryptions = new AesCrypto(finAPIDecryptionKey);
    const crypto = (this.clientSecrets = new Resolved(finAPIClientId, finAPIClientSecret));
    this.authentication = new Basic(httpClient);
    this.bankInterface = new FinAPI(httpClient);
    this.firebaseMessaging = new FirebaseMessaging(pushClient,firebaseServerKey);
    this.users = storageBackend.users;
    this.connections = storageBackend.connections;
    this.recurrentTransactions = storageBackend.recurrentTransactions;
    this.transactions = storageBackend.transactions;
    this.logger = this.createLogger(env);
  }

  private createLogger(env: NodeJS.ProcessEnv) {
    console.log("Configuring logger from environment:");

    return winston.createLogger({
      level: env["LOGGER_LEVEL"] || "debug",
      format: winston.format.json(),
      transports: [
        new winston.transports.Console({
          format: winston.format.json(),
        }),
      ],
    });
  }
}
