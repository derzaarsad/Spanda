const webpack = require("webpack");
const path = require("path");

const SRC_DIR = path.resolve(__dirname, "out/src");
const OUT_DIR = path.resolve(__dirname, "dist");

const config = {
  entry: {
    api: path.resolve(SRC_DIR, "api.js"),
    "notifications-callback": path.resolve(SRC_DIR, "notifications-callback.js")
  },
  externals: ["aws-sdk"],
  output: {
    path: OUT_DIR,
    filename: "[name].js",
    libraryTarget: "umd"
  },
  target: "node",
  plugins: [new webpack.IgnorePlugin(/^pg-native$/)]
};

module.exports = config;
