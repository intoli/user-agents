const path = require("path");

const ESLintPlugin = require("eslint-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");

const mode = process.env.NODE_ENV || "development";

module.exports = {
  entry: {
    index: path.resolve(__dirname, "src", "index.js"),
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    library: "user-agents",
    libraryTarget: "umd",
    umdNamedDefine: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, "src"),
        loader: "babel-loader",
      },
      {
        test: /\.(gif|jpg|jpeg|png|svg)$/,
        loader: "url-loader",
      },
    ],
  },
  plugins: [],
  target: "node",
  devtool: "source-map",
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  mode,
};
