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
var sassUtils = require('../../scripts/gulp-utils');
var sass = require('gulp-sass');
var insert = require('gulp-insert');
var addsrc = require('gulp-add-src');
var gulpif = require('gulp-if');
var minifyCss = util.minifyCss;
var args = util.args;
var IS_DEV = require('../const').IS_DEV;

exports.task = function() {
  var streams = [];
  var modules   = args['modules'],
      overrides = args['override'],
      dest      = args['output-dir'] || config.outputDir,
      filename  = args['filename'] || 'angular-material',
      baseFiles = config.scssBaseFiles,
      layoutDest= dest + 'layouts/',
      scssPipe  = null;

  gutil.log("Building css files...");

  // create SCSS file for distribution
  streams.push(
    scssPipe = gulp.src(getPaths())
      .pipe(util.filterNonCodeFiles())
      .pipe(filter(['**', '!**/*.css']))
      .pipe(filter(['**', '!**/*-theme.scss']))
      .pipe(filter(['**', '!**/*-attributes.scss']))
      .pipe(concat('angular-material.scss'))
      .pipe(gulp.dest(dest))            // raw uncompiled SCSS
      .pipe(sass())
      .pipe(util.dedupeCss())
      .pipe(util.autoprefix())
      .pipe(insert.prepend(config.banner))
      .pipe(gulp.dest(dest))                        // unminified
      .pipe(gulpif(!IS_DEV, minifyCss()))
      .pipe(gulpif(!IS_DEV, util.dedupeCss()))
      .pipe(rename({extname: '.min.css'}))
      .pipe(gulp.dest(dest))                        // minified
  );

  streams.push(
      gulp.src( config.cssIEPaths.slice() )         // append raw CSS for IE Fixes
        .pipe( concat('angular-material.layouts.ie_fixes.css') )
        .pipe( gulp.dest(layoutDest) )
  );

  // Generate standalone SCSS (and CSS) file for Layouts API
  // The use of these classnames is automated but requires
  // the Javascript module module `material.core.layout`
  //  > (see src/core/services/layout.js)
  // NOTE: this generated css is ALSO appended to the published
  //       angular-material.css file

  streams.push(
    gulp.src(config.scssLayoutFiles)
        .pipe(concat('angular-material.layouts.scss'))
        .pipe(sassUtils.hoistScssVariables())
        .pipe(insert.prepend(config.banner))
        .pipe(gulp.dest(layoutDest))      // raw uncompiled SCSS
        .pipe(sass())
        .pipe(util.dedupeCss())
        .pipe(util.autoprefix())
        .pipe(rename({ extname : '.css'}))
        .pipe(gulp.dest(layoutDest))
        .pipe(gulpif(!IS_DEV, minifyCss()))
        .pipe(gulpif(!IS_DEV, util.dedupeCss()))
        .pipe(rename({extname: '.min.css'}))
        .pipe(gulp.dest(layoutDest))
  );

  // Generate the Layout-Attributes SCSS and CSS files
  // These are intended to allow usages of the Layout styles
  // without:
  //  * use of the Layout directives and classnames, and
  //  * Layout module `material.core.layout

  streams.push(
      gulp.src(config.scssLayoutAttributeFiles)
          .pipe(concat('angular-material.layout-attributes.scss'))
          .pipe(sassUtils.hoistScssVariables())
          .pipe(gulp.dest(layoutDest))     // raw uncompiled SCSS
          .pipe(sass())
          .pipe(util.dedupeCss())
          .pipe(util.autoprefix())
          .pipe(rename({ extname : '.css'}))
          .pipe(insert.prepend(config.banner))
          .pipe(gulp.dest(layoutDest))
          .pipe(gulpif(!IS_DEV, minifyCss()))
          .pipe(gulpif(!IS_DEV, util.dedupeCss()))
          .pipe(rename({extname: '.min.css'}))
          .pipe(gulp.dest(layoutDest))
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
