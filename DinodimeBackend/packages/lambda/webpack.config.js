const webpack = require("webpack");
const path = require("path");

const SRC_DIR = path.resolve(__dirname, "out/src");
const OUT_DIR = path.resolve(__dirname, "dist");

var config = function(name) {
  return {
    name: name,
    entry: path.resolve(SRC_DIR, name + ".js"),
    output: {
      path: path.resolve(OUT_DIR, "lambda-" + name),
      libraryTarget: "umd",
      filename: "main.js"
    },
    externals: ["aws-sdk"],
    target: "node",
    plugins: [new webpack.IgnorePlugin(/^pg-native$/)]
  };
};

var modules = [
  "api",
  "admin-api",
  "notifications-callback",
  "describe-db-instance",
  "webform-callback",
  "fetch-webform"
];

module.exports = modules.map(moduleName => config(moduleName));
