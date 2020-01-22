import axios from "axios";
import { User, FinAPI } from "dynodime-lib";
import { Authentication, Basic } from "dynodime-lib";
import { ClientSecretsProvider, Resolved } from "dynodime-lib";

export const CreateUnittestInterfaces = () => {
  // Create Authentications
  let authentication: Authentication = {
    getClientCredentialsToken: async (clientSecrets: ClientSecretsProvider) => {
      return {
        access_token: "yyz",
        token_type: "bearer",
        expires_in: 3600,
        scope: "test",
        refresh_token: "xyz"
      };
    },

    getPasswordToken: async (clientSecrets: ClientSecretsProvider) => {
      return {
        access_token: "yyz",
        token_type: "bearer",
        expires_in: 3600,
        scope: "test",
        refresh_token: "xyz"
      };
    },

    getRefreshToken: async (clientSecrets: ClientSecretsProvider, refresh_token: string) => {
      return {
        refresh_token: "xyz",
        token_type: "bearer",
        expires_in: 3600,
        scope: "test",
        access_token: "yyz"
      };
    }
  };

  // Create ClientSecrets
  let clientSecrets = new Resolved("client-id", "client-secret");

  // Create bank interface
  let bankInterface = {
    userInfo: async (authorization: string) => {
      return {
        id: "chapu"
      };
    },

    registerUser: async (authorization: string, user: User) => {
      return {};
    },

    importConnection: async (authorization: string, bankId: number) => {
      return {
        // example from
        location: "testlocation",
        webFormId: "2934"
      };
    }
  };

  const finAPI = (bankInterface as unknown) as FinAPI;

  return {
    authentication: authentication,
    clientSecrets: clientSecrets,
    bankInterface: finAPI
  };
};

export const CreateFinApiTestInterfaces = (clientId: string, clientSecret: string) => {
  // Create Authentications
  const httpClient = axios.create({
    baseURL: "https://sandbox.finapi.io",
    timeout: 3000,
    headers: { Accept: "application/json" }
  });

  let authentication = new Basic(httpClient);

  // Create ClientSecrets
  let clientSecrets = new Resolved(clientId, clientSecret);

  // Create bank interface
  let bankInterface = new FinAPI(httpClient);

  return {
    authentication,
    clientSecrets,
    bankInterface
  };
};
