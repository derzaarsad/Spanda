/*
 * Generic bank interface, this wraps a region specific implementation
 */
import { AxiosInstance } from "axios";
import { FinAPI } from "./region-specific/de/finapi";

export default (http: AxiosInstance) => {
  /*
   * Germany
   */
  return new FinAPI(http);
};
