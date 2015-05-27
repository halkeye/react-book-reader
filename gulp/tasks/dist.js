'use strict';
var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('browserify');
var buffer = require( 'vinyl-buffer' );
var rev = require( 'gulp-rev' );
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

function bundle() {
  var bundler = browserify(config.browserify.src);

  bundler.transform( 'reactify' );
  bundler.transform( 'babelify' );
  bundler.transform({ global: true }, 'uglifyify' );

  bundler.on( 'log', gutil.log ); // Help bundler log to the terminal

  function bundle( dest, filename ) {
    return bundler.bundle()
      .on( 'error', gutil.log.bind( gutil, 'Browserify error' )) // Log errors during build
      .pipe( source( filename ))
      .pipe( buffer() )
      //.pipe( rev() )
      .pipe( gulp.dest( dest ))
      //.pipe( rev.manifest() )
      .pipe( gulp.dest( dest ));
  }
  return bundle( './dist/js', 'index.js' );
}

gulp.task('dist:bundle', bundle);
gulp.task('dist:styles', styles);
gulp.task('dist:html', html);
gulp.task('dist', ['dist:bundle', 'dist:styles', 'dist:html']);
