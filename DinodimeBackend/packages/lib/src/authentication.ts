import qs = require("querystring");
import { AxiosInstance } from "axios";
import { ClientSecretsProvider, ClientSecrets } from "./client-secrets";
import { Token } from "dinodime-sharedmodel";

type RequestParams = {
  client_id: string;
  client_secret: string;
};

type ClientCredentialsGrantRequestParams = RequestParams & {
  grant_type: "client_credentials";
};

type PasswordGrantRequestParams = RequestParams & {
  grant_type: "password";
  username: string;
  password: string;
};

type RefreshTokenGrantRequestParams = RequestParams & {
  grant_type: "refresh_token";
  refresh_token: string;
};

export interface Authentication {
  getClientCredentialsToken(clientSecrets: ClientSecretsProvider): Promise<Token>;
  getPasswordToken(
    clientSecrets: ClientSecretsProvider,
    user: string,
    pass: string
  ): Promise<Token>;
  getRefreshToken(clientSecrets: ClientSecretsProvider, refreshToken: string): Promise<Token>;
}

export class Basic implements Authentication {
  private http: AxiosInstance;

  constructor(http: AxiosInstance) {
    this.http = http;
  }

  async getClientCredentialsToken(clientSecrets: ClientSecretsProvider) {
    return clientSecrets
      .getSecrets()
      .then(secrets => this.http.post("/oauth/token", this.ccRequest(secrets)))
      .then(response => response.data);
  }

  async getPasswordToken(clientSecrets: ClientSecretsProvider, user: string, pass: string) {
    return clientSecrets
      .getSecrets()
      .then(secrets => this.http.post("/oauth/token", this.passwordRequest(secrets, user, pass)))
      .then(response => response.data);
  }

  async getRefreshToken(clientSecrets: ClientSecretsProvider, refreshToken: string) {
    return clientSecrets
      .getSecrets()
      .then(secrets =>
        this.http.post("/oauth/token", this.refresthTokenRequest(secrets, refreshToken))
      )
      .then(response => response.data);
  }

  private requestParams(secrets: ClientSecrets): RequestParams {
    return {
      client_id: secrets.clientId,
      client_secret: secrets.clientSecret
    };
  }

  private ccRequest(secrets: ClientSecrets) {
    const formData: ClientCredentialsGrantRequestParams = {
      ...this.requestParams(secrets),
      grant_type: "client_credentials"
    };

    return qs.stringify(formData);
  }

  private passwordRequest(clientSecrets: ClientSecrets, user: string, pass: string) {
    const formData: PasswordGrantRequestParams = {
      ...this.requestParams(clientSecrets),
      grant_type: "password",
      username: user,
      password: pass
    };

    return qs.stringify(formData);
  }

  private refresthTokenRequest(clientSecrets: ClientSecrets, refreshToken: string) {
    const formData: RefreshTokenGrantRequestParams = {
      ...this.requestParams(clientSecrets),
      grant_type: "refresh_token",
      refresh_token: refreshToken
    };

    return qs.stringify(formData);
  }
}

exports.Basic = Basic;
