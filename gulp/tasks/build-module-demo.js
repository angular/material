const BUILD_MODE = require('../const').BUILD_MODE;
const ROOT = require('../const').ROOT;

const gulp = require('gulp');
const gutil = require('gulp-util');
const fs = require('fs');
const path = require('path');
const through2 = require('through2');
const lazypipe = require('lazypipe');
const sass = require('gulp-sass');
const gulpif = require('gulp-if');
const _ = require('lodash');

const util = require('../util');
const utils = require('../../scripts/gulp-utils.js');

exports.task = function() {
  const mod = util.readModuleArg();
  const name = mod.split('.').pop();
  const demoIndexTemplate = fs.readFileSync(
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
