import axios, { AxiosInstance } from "axios";

export default class NotificationRulesController {
  private http: AxiosInstance;

  constructor(http: AxiosInstance) {
    this.http = http;
  }
}
