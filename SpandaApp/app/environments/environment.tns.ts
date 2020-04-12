declare var process: any;

export const environment = (() => {
  let envVars;

  if (
    typeof process !== 'undefined' && process &&
    Object.prototype.hasOwnProperty.call(process, 'env') && process.env &&
    Object.prototype.hasOwnProperty.call(process.env, 'environmentJson') && process.env.environmentJson
  ) {
    envVars = JSON.parse(process.env.environmentJson);
  } else {
    // a dummy value is filled for test
    envVars = JSON.parse("{\"APIEndpointURL\":\"onlyfortest\"}");
  }

  return envVars;
})();