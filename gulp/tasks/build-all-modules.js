const BUILD_MODE = require('../const').BUILD_MODE;

const gulp = require('gulp');
const path = require('path');
const through2 = require('through2');
const series = require('stream-series');
const util = require('../util');

exports.task = function() {
  const isRelease = process.argv.indexOf('--release') !== -1;
  return gulp.src(['src/core/', 'src/components/*'])
      .pipe(through2.obj(function(folder, enc, next) {
        const moduleId = folder.path.indexOf('components') > -1
            ? 'material.components.' + path.basename(folder.path)
            : 'material.' + path.basename(folder.path);
        const stream = isRelease ?
            series(
              util.buildModule(moduleId, { minify: true, useBower: BUILD_MODE.useBower }),
              util.buildModule(moduleId, {})
            ) : util.buildModule(moduleId, {});
        stream.on('end', function() { next(); });
      }))
      .pipe(BUILD_MODE.transform());
};
