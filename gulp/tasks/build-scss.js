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
  var modules   = args['modules'],
      overrides = args['override'],
      dest      = args['output-dir'] || config.outputDir,
      filename  = args['filename'] || 'angular-material',
      paths     = getPaths();
  var streams = [];
  var baseVars = fs.readFileSync('src/core/style/variables.scss', 'utf8').toString();
  gutil.log("Building css files...");
  
  // create SCSS file for distribution
  streams.push(
    gulp.src(paths)
      .pipe(util.filterNonCodeFiles())
      .pipe(filter(['**', '!**/*-theme.scss']))
      .pipe(filter(['**', '!**/*.attributes.scss']))    // no layout attribute selectors
      .pipe(filter(['**', '!**/*.print.scss']))         // no print styles
      .pipe(concat('angular-material.scss'))
      .pipe(gulp.dest(dest))                            // raw uncompiled SCSSS
  );
  
  streams.push(
      gulp.src(dest)
          .pipe(sass())
          .pipe(rename({ basename: filename }))
          .pipe(util.autoprefix())
          .pipe(insert.prepend(config.banner))
          .pipe(gulp.dest(dest))                        // unminified
          .pipe(gulpif(!IS_DEV, minifyCss()))
          .pipe(rename({extname: '.min.css'}))
          .pipe(gulp.dest(dest))                        // minified
  );
  streams.push(
      gulp.src(config.scssPrintFiles.slice())           // Layout API for Printing
          .pipe(sass())
          .pipe(util.autoprefix())
          .pipe(rename({ basename: "print" }))
          .pipe(rename({ prefix: 'angular-material.'}))
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
      paths.push(path.join(config.paths, '*.scss'));
    }
    overrides && paths.unshift(overrides);
    return paths;
  }
};
