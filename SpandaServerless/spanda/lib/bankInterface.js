'use strict'
/*
 * Generic bank interface, this wraps a region specific implementation
 */
module.exports = (httpClient) => {
  /*
   * Germany
   */
  return require('./region_specific/de/finapi').NewClient(httpClient);
};