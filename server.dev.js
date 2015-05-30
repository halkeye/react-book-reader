var WebpackDevServer = require('webpack-dev-server');
var webpack = require('webpack');
var config = require('./webpack.config');

var PORT = 3000;

config.devtool = '#eval';
var compiler = webpack(config);

var server = new WebpackDevServer(compiler, {
  contentBase: config.output.path,
  quiet: false,
  noInfo: false,
  //publicPath: '/books/',
  hot: true,
  stats: { colors: true },
  cache: false
});

server.listen(PORT, '0.0.0.0', function () {
  console.log("Listening on " + PORT);
});
