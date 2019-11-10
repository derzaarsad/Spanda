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
    throw new Error("No environment variable defined");
  }

  return envVars;
})();