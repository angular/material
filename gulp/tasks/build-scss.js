var config = require('../config');
var gulp = require('gulp');
var gutil = require('gulp-util');
var fs = require('fs');
var path = require('path');
var rename = require('gulp-rename');
var filter = require('gulp-filter');
var concat = require('gulp-concat');
var series = require('stream-series');
var util = require('../util');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var insert = require('gulp-insert');
var gulpif = require('gulp-if');
var args = util.args;
var IS_DEV = require('../const').IS_DEV;

exports.task = function() {
  var streams = [];
  var modules   = args['modules'],
      overrides = args['override'],
      dest      = args['output-dir'] || config.outputDir,
      filename  = args['filename'] || 'angular-material',
      baseFiles = config.scssBaseFiles,
      scssPipe  = undefined;

  gutil.log("Building css files...");

  // create SCSS file for distribution
  streams.push(
    scssPipe = gulp.src(getPaths())
      .pipe(util.filterNonCodeFiles())
      .pipe(filter(['**', '!**/*-theme.scss']))
      .pipe(filter(['**', '!**/*-print.scss']))
      .pipe(filter(['**', '!**/*-attributes.scss']))
      .pipe(concat('angular-material.scss'))
      .pipe(gulp.dest(dest))                            // raw uncompiled SCSSS
  );

  streams.push(
    scssPipe
          .pipe(sass())
          .pipe(rename({extname: '.css'}))              // unminified
          .pipe(rename({ basename: filename }))
          .pipe(util.autoprefix())
          .pipe(insert.prepend(config.banner))
          .pipe(gulp.dest(dest))
          .pipe(gulpif(!IS_DEV, minifyCss()))
          .pipe(rename({extname: '.min.css'}))
          .pipe(gulp.dest(dest))                        // minified
  );

  // Layout API using Attribute Selectors
  // TO BE Deprecated...

  streams.push(
      gulp.src(config.scssLayoutAttributeFiles)
          .pipe(concat('layouts.scss'))
          .pipe(sass())
          .pipe(util.autoprefix())
          .pipe(rename({ extname : '.css'}))
          .pipe(rename({ prefix  : 'angular-material.'}))
          .pipe(insert.prepend(config.banner))
          .pipe(gulp.dest(dest))
          .pipe(gulpif(!IS_DEV, minifyCss()))
          .pipe(rename({extname: '.min.css'}))
          .pipe(gulp.dest(dest))
  );

  return series(streams);


  function getPaths () {
    var paths = config.scssBaseFiles.slice();
    if ( modules ) {
      paths.push.apply(paths, modules.split(',').map(function (module) {
        return 'src/components/' + module + '/*.scss';
      }));
    } else {
      paths.push('src/components/**/*.scss');
      paths.push('src/core/services/layout/**/*.scss');
    }
    overrides && paths.unshift(overrides);
    return paths;
  }
};
