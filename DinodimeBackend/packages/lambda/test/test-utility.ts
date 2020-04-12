import axios from "axios";
import { User, FinAPI } from "dinodime-lib";
import { Authentication, Basic } from "dinodime-lib";
import { ClientSecretsProvider, Resolved } from "dinodime-lib";
import { PushMessaging } from "dinodime-lib/src";

export class TestMessaging implements PushMessaging {
  async sendMessage(registrationToken: string, body: any, title: string): Promise<any> {
    return {};
  }
}

export const CreateUnittestInterfaces = () => {
  // Create Authentications
  let authentication: Authentication = {
    getClientCredentialsToken: async (clientSecrets: ClientSecretsProvider) => {
      return {
        access_token: "yyz_clientcredentials",
        token_type: "bearer_clientcredentials",
        expires_in: 3600,
        scope: "test_clientcredentials",
        refresh_token: "xyz_clientcredentials"
      };
    },

    getPasswordToken: async (clientSecrets: ClientSecretsProvider) => {
      return {
        access_token: "yyz_password",
        token_type: "bearer_password",
        expires_in: 3600,
        scope: "test_password",
        refresh_token: "xyz_password"
      };
    },

    getRefreshToken: async (clientSecrets: ClientSecretsProvider, refresh_token: string) => {
      return {
        refresh_token: "xyz_refreshtoken",
        token_type: "bearer_refreshtoken",
        expires_in: 3600,
        scope: "test_refreshtoken",
        access_token: "yyz_refreshtoken"
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
