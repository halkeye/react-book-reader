'use strict';
var gulp = require('gulp');
var browserify = require('browserify');
var sass = require('gulp-sass');
var source = require('vinyl-source-stream');

var config = require('../config');

var html = function() {
  return gulp.src(config.html.src)
    .pipe(gulp.dest(config.html.dest));
};

var styles = function() {
  gulp.src(config.sass.src)
    .pipe(sass(config.sass.settings))
    .pipe(gulp.dest(config.sass.dest));
};

var bundler = browserify(config.browserify.src);
config.browserify.settings.transform.forEach(function(t) {
  bundler.transform(t);
});

function bundle() {
  return bundler.bundle()
    .pipe(source(config.browserify.outputName))
    .pipe(gulp.dest(config.browserify.dest));
}

gulp.task('dist:bundle', bundle);
gulp.task('dist:styles', styles);
gulp.task('dist:html', html);
gulp.task('dist', ['dist:bundle', 'dist:styles', 'dist:html']);
