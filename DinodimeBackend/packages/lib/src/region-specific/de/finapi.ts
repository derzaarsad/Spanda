import qs from "querystring";
import { Model as FinAPIModel } from "./model";

import { AxiosInstance, AxiosRequestConfig } from "axios";
import { WebFormHandle } from "./finapi-webform-handle";

export class FinAPI {
  private http: AxiosInstance;

  constructor(http: AxiosInstance) {
    this.http = http;
  }

  async userInfo(authorization: string): Promise<FinAPIModel.User> {
    const params = {
      headers: {
        Authorization: authorization
      }
    };
    return this.http.get("/api/v1/users", params).then(response => response.data);
  }

  async registerUser(authorization: string, user: FinAPIModel.User) {
    const config = {
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json"
      }
    };

    return this.http.post("/api/v1/users", user, config).then(response => response.data);
  }

  async fetchWebForm(authorization: string, formId: number) {
    const req = {
      headers: {
        Authorization: authorization
      }
    };

    const resource = "/api/v1/webForms/" + formId;
    return this.http.get(resource, req).then(response => response.data);
  }

  async listBanksByBLZ(
    authorization: string,
    blz: string,
    pagination = { page: 1, itemsPerPage: 2 }
  ) {
    const req = {
      params: {
        search: blz,
        page: pagination.page,
        perPage: pagination.itemsPerPage
      },
      headers: {
        Authorization: authorization
      }
    };

    return this.http.get("/api/v1/banks", req).then(response => response.data);
  }

  async importConnection(authorization: string, bankId: number) {
    return this.requestWebForm(authorization, bankId);
  }

  async getAllTransactions(
    authorization: string,
    accountIds: number[],
    bankPerPage: number = 400
  ): Promise<FinAPIModel.Transaction[]> {
    const firstPageResponseJson = await this.getTransactionPerPage(
      authorization,
      accountIds,
      1,
      bankPerPage
    );
    let transactions = firstPageResponseJson.transactions;

    for (var i = 2; i <= firstPageResponseJson.paging.pageCount; ++i) {
      const pageResponseJson = await this.getTransactionPerPage(
        authorization,
        accountIds,
        i,
        bankPerPage
      );
      transactions = transactions.concat(pageResponseJson.transactions);
    }

    return transactions;
  }

  private async requestWebForm(authorization: string, bankId: number): Promise<WebFormHandle> {
    const data = {
      bankId: bankId
    };

    const config = {
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json"
      },
      validateStatus: (status: number) => status === 451
    };

    return this.http.post("/api/v1/bankConnections/import", data, config).then(response => {
      const body = response.data;
      const headers = response.headers;

      return {
        location: headers.location,
        webFormId: body.errors[0].message
      };
    });
  }

  private async getTransactionPerPage(
    authorization: string,
    accountIds: number[],
    page: number,
    bankPerPage: number
  ): Promise<FinAPIModel.PageableTransactionList> {
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json"
      },
      params: {
        view: "bankView",
        accountIds: accountIds.join(","),
        direction: "all",
        includeChildCategories: "true",
        page: page.toString(),
        perPage: bankPerPage.toString(),
        order: "finapiBookingDate,asc"
      }
    };

    const query = {
      view: "bankView",
      accountIds: accountIds.join(","),
      direction: "all",
      includeChildCategories: "true",
      page: page.toString(),
      perPage: bankPerPage.toString(),
      order: "finapiBookingDate,asc"
    };

    return this.http
      .get("/api/v1/transactions?" + qs.stringify(query), config)
      .then(response => response.data);
  }

  async registerNewTransactionsNotificationRule(
    authorization: string,
    ruleHandle: string,
    accountIds: Array<Number>,
    includeDetails: boolean
  ): Promise<FinAPIModel.NotificationRule> {
    const resource = "/api/v1/notificationRules";

    const config = {
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json"
      }
    };

    const rule: FinAPIModel.NotificationRuleParams = {
      triggerEvent: FinAPIModel.NotificationRuleParams.TriggerEventEnum.NEWTRANSACTIONS,
      params: {
        accountIds: accountIds.join(",")
      },
      callbackHandle: ruleHandle,
      includeDetails: includeDetails
    };

    return this.http.post(resource, rule, config).then(response => response.data);
  }

  async deleteNotificationRule(authorization: string, ruleId: Number): Promise<void> {
    const resource = "/api/v1/notificationRules/" + ruleId;

    const config = {
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json"
      }
    };

    await this.http.delete(resource, config);
  }
}
