import { Authentication, Basic } from "dynodime-lib";
import { BankConnections, Users, Transactions } from "dynodime-lib";
import { ClientSecretsProvider, Resolved } from "dynodime-lib";
import { Encryptions, CallbackCrypto } from "dynodime-lib";
import { FinAPI } from "dynodime-lib";

import axios from "axios";
import { BackendProvider } from "./backend-provider";

import InMemoryBackendProvider from "./in-memory-backend-provider";
import DynamoDBBackendProvider from "./dynamodb-backend-provider";
import PostgresBackendProvider from "./dynamodb-backend-provider";

export class ServiceProvider {
  readonly clientSecrets: ClientSecretsProvider;
  readonly authentication: Authentication;
  readonly bankInterface: FinAPI;
  readonly users: Users.UsersRepository;
  readonly connections: BankConnections.BankConnectionsRepository;
  readonly encryptions: Encryptions;
  transactions: Transactions.TransactionsRepository;

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
        throw new Error("unknown storage type");
      }
    }

    const baseURL = env["FINAPI_URL"] || "https://sandbox.finapi.io";
    const timeout = env["FINAPI_TIMEOUT"];

    const httpClient = axios.create({
      baseURL: baseURL,
      timeout: timeout !== undefined ? parseInt(timeout) : 3000,
      headers: { Accept: "application/json" }
    });

    const finAPIClientId = env["FINAPI_CLIENT_ID"];
    const finAPIClientSecret = env["FINAPI_CLIENT_SECRET"];

    if (finAPIClientId === undefined || finAPIClientSecret === undefined) {
      throw new Error("no finAPI credentials given");
    }

    this.clientSecrets = new Resolved(finAPIClientId, finAPIClientSecret);
    this.authentication = new Basic(httpClient);
    this.bankInterface = new FinAPI(httpClient);
    this.users = storageBackend.users;
    this.connections = storageBackend.connections;
    this.transactions = storageBackend.transactions;
    this.encryptions = new CallbackCrypto();
  }
}
