const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require("path");

const sassLoaders = [
  "css-loader",
  "autoprefixer-loader?browsers=last 2 version",
  "sass-loader?indentedSyntax=sass&includePaths[]=" + path.resolve(__dirname, "./src")
];

const scssLoaders = [
  "css-loader",
  "autoprefixer-loader?browsers=last 2 version",
  "sass-loader?includePaths[]=" + path.resolve(__dirname, "./src")
];

const config = {
  entry: ["./src/js/index"],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: ["babel-loader"]
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract("style-loader", scssLoaders.join("!"))
      },
      {
        test: /\.sass$/,
        loader: ExtractTextPlugin.extract("style-loader", sassLoaders.join("!"))
      },
      { test: /\.png$/, loader: "file-loader" }
    ]
  },
  output: {
    filename: "js/[name]-[hash].js",
    path: path.join(__dirname, "./dist"),
    publicPath: "/"
  },
  plugins: [
    new ExtractTextPlugin("styles/[name]-[hash].css"),
    new HtmlWebpackPlugin({
      inject: true,
      title: 'Books Books Books',
      template: './src/index.html'
    }),
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.DefinePlugin({GA_TRACKING_CODE: JSON.stringify('UA-89920-17')})
  ],
  resolve: {
    extensions: ["", ".jsx", ".js", ".sass", ".scss"],
    modulesDirectories: ["src", "node_modules"]
  }
};

module.exports = config;
