var BUILD_MODE = require('../const').BUILD_MODE;
var ROOT = require('../const').ROOT;

var gulp = require('gulp');
var gutil = require('gulp-util');
var fs = require('fs');
var path = require('path');
var through2 = require('through2');
var lazypipe = require('lazypipe');
var sass = require('gulp-sass');
var gulpif = require('gulp-if');
var _ = require('lodash');

var util = require('../util');
var utils = require('../../scripts/gulp-utils.js');

exports.task = function() {
  var mod = util.readModuleArg();
  var name = mod.split('.').pop();
  var demoIndexTemplate = fs.readFileSync(
      ROOT + '/docs/config/template/demo-index.template.html', 'utf8'
  ).toString();

  gutil.log('Building demos for', mod, '...');

  return utils.readModuleDemos(mod, function() {
    return lazypipe()
        .pipe(gulpif, /.css$/, sass())
        .pipe(gulpif, /.css$/, util.autoprefix())
        .pipe(gulp.dest, BUILD_MODE.outputDir + name)
    ();
  })
      .pipe(through2.obj(function(demo, enc, next) {
        fs.writeFileSync(
            path.resolve(BUILD_MODE.outputDir, name, demo.name, 'index.html'),
            _.template(demoIndexTemplate)(demo)
        );
        next();
      }));

};
