var BUILD_MODE = require('../const').BUILD_MODE;

var gulp = require('gulp');
var path = require('path');
var through2 = require('through2');
var series = require('stream-series');
var util = require('../util');
var gulpif = require('gulp-if');
var utils = require('../../scripts/gulp-utils.js');

exports.task = function() {
  return gulp.src(['src/core/', 'src/components/*' ])
      .pipe(through2.obj(function(folder, enc, next) {
        var moduleId = folder.path.indexOf('components') > -1
            ? 'material.components.' + path.basename(folder.path)
            : 'material.' + path.basename(folder.path);
        var stream = BUILD_MODE.useBower
            ? series(util.buildModule(moduleId, true), util.buildModule(moduleId, false))
            : util.buildModule(moduleId, false);
        stream.on('end', function() { next(); });
      }))
      .pipe(BUILD_MODE.transform());

};
