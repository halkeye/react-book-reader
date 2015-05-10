var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var connect = require('gulp-connect');
var plumber = require('gulp-plumber');

var config = require('../config').browserify;

var onError = function (err) {
  console.log(arguments);
  gutil.beep();
  gutil.log(gutil.colors.red(err));
};

watchify.args.debug = config.debug;
var bundler = watchify(browserify(config.src, watchify.args));
config.settings.transform.forEach(function(t) {
  bundler.transform(t);
});

gulp.task('browserify', bundle);
bundler.on('update', bundle);

function bundle() {
  return bundler.bundle()
  // log errors if they happen
  //.on('error', gutil.log.bind(gutil, 'Browserify Error'))
  .on('error', onError)
  /*.on('error', notify.onError({
    message: "Error: <%= error.message %>",
    title: "Failed running browserify"
  }))*/
  .pipe(source(config.outputName))
  .pipe(gulp.dest(config.dest))
  .pipe(connect.reload());
}
