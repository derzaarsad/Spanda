import { Mutex } from "./mutex";
import SSM from "aws-sdk/clients/ssm";

export type ClientSecrets = { clientId: string; clientSecret: string };

export interface ClientSecretsProvider {
  getSecrets(): Promise<ClientSecrets>;
}

export class Resolved implements ClientSecretsProvider {
  private clientId: string;
  private clientSecret: string;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async getSecrets() {
    return { clientId: this.clientId, clientSecret: this.clientSecret };
  }
}

export class FromSSM implements ClientSecretsProvider {
  private mutex = new Mutex();

  private resolved = false;
  private credentials: ClientSecrets | undefined = undefined;
  private error: any | undefined = undefined;

  private ssm: SSM;
  private clientIdParam: string;
  private clientSecretParam: string;

  constructor(ssm: SSM, clientIdParam: string, clientSecretParam: string) {
    this.ssm = ssm;
    this.clientIdParam = clientIdParam;
    this.clientSecretParam = clientSecretParam;
  }

  async getSecrets() {
    await this.mutex.synchronize(this.resolveCredentials);

    if (this.error) {
      throw this.error;
    } else {
      if (this.credentials === undefined) {
        throw `invalid state: the secrets haven't been resolved`;
      }
      return this.credentials;
    }
  }

  private async requestParam(paramName: string, encrypted: boolean): Promise<string> {
    const parameterRequest = {
      Name: paramName,
      WithDecryption: encrypted
    };

    return this.ssm
      .getParameter(parameterRequest)
      .promise()
      .then(data => {
        if (data.Parameter === undefined || data.Parameter.Value === undefined) {
          throw `no value for parameter ${paramName} defined`;
        }
        return data.Parameter.Value;
      });
  }

  private async resolveCredentials() {
    if (!this.resolved) {
      try {
        const results = await Promise.all([
          this.requestParam(this.clientIdParam, false),
          this.requestParam(this.clientSecretParam, true)
        ]);
        this.credentials = { clientId: results[0], clientSecret: results[1] };
      } catch (err) {
        this.error = err;
      } finally {
        // note that the mutex should prevent race conditions
        this.resolved = true; // eslint-disable-line require-atomic-updates
      }
    }
  }
}
