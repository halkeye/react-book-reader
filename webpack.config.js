'use strict';
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');


const sourcePath = path.join(__dirname, './src');
const distPath = path.join(__dirname, './dist');

const sassLoaders = [
  'css-loader',
  'autoprefixer-loader?browsers=last 2 version',
  'sass-loader?indentedSyntax=sass&includePaths[]=' + path.resolve(__dirname, './src')
];

const scssLoaders = [
  'css-loader',
  'autoprefixer-loader?browsers=last 2 version',
  'sass-loader?includePaths[]=' + path.resolve(__dirname, './src')
];

module.exports = function (env) {
  const nodeEnv = env && env.prod ? 'production' : 'development';
  const isProd = nodeEnv === 'production';

  const plugins = [
    // new FaviconsWebpackPlugin('./img/favicon.png'),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: ({ resource }) => /node_modules/.test(resource)
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: nodeEnv
    }),
    new webpack.NamedModulesPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      title: 'Books Books Books',
      template: `!!html-loader!${sourcePath}/index.html`
    }),
    new ExtractTextPlugin({
      disable: !isProd,
      filename: '[name].[contenthash].css',
      allChunks: true
    })
  ];

  if (isProd) {
    plugins.push(
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          screw_ie8: true,
          conditionals: true,
          unused: true,
          comparisons: true,
          sequences: true,
          dead_code: true,
          evaluate: true,
          if_return: true,
          join_vars: true
        },
        output: {
          comments: false
        }
      })
    );
  } else {
    plugins.push(
      new CopyWebpackPlugin([{from: '../books', to: 'books'}]),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    );
  }

  return {
    devtool: isProd ? 'source-map' : 'eval',
    context: sourcePath,
    entry: ['js/index'],
    output: {
      path: distPath,
      filename: !isProd ? '[name].bundle.js' : '[name].[chunkhash].bundle.js',
      publicPath: '/'
    },
    module: {
      rules: [
        {
          test: /\.(html)$/,
          exclude: /node_modules/,
          use: ['file-loader']
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          loaders: [
            {
              loader: 'file-loader',
              options: {
                hash: 'sha512',
                digest: 'hex',
                name: '[hash].[ext]',
                useRelativePath: false,
                outputPath: 'images/'
              }
            },
            {
              loader: 'image-webpack-loader',
              options: {
                gifsicle: {
                  interlaced: false
                },
                optipng: {
                  optimizationLevel: 7
                },
                pngquant: {
                  quality: '65-90',
                  speed: 4
                },
                mozjpeg: {
                  progressive: true,
                  quality: 65
                }
              }
            }
          ]
        },
        {
          test: /\.scss$/,
          loader: ExtractTextPlugin.extract({
            use: scssLoaders,
            fallback: 'style-loader'
          })
        },
        {
          test: /\.sass$/,
          loader: ExtractTextPlugin.extract({
            use: sassLoaders,
            fallback: 'style-loader'
          })
        },
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            use: [
              {
                loader: 'css-loader',
                options: {
                  modules: true,
                  localIdentName: '[name]__[local]___[hash:base64:5]'
                }
              }
            ],
            fallback: 'style-loader'
          })
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /(node_modules|bower_components)/,
          use: ['babel-loader']
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx', '.scss', '.css'],
      modules: [path.resolve(__dirname, 'node_modules'), sourcePath]
    },

    plugins,

    performance: isProd && {
      maxAssetSize: 100,
      maxEntrypointSize: 300,
      hints: 'warning'
    },

    stats: {
      colors: {
        green: '\u001b[32m'
      }
    },

    devServer: {
      disableHostCheck: true,
      contentBase: sourcePath,
      publicPath: '/',
      historyApiFallback: true,
      port: 3000,
      compress: isProd,
      inline: !isProd,
      hot: !isProd,
      stats: {
        assets: true,
        children: false,
        chunks: false,
        hash: false,
        modules: false,
        publicPath: false,
        timings: true,
        version: false,
        warnings: true,
        colors: {
          green: '\u001b[32m'
        }
      }
    }
  };
};
