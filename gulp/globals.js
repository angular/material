global.gulp             = require('gulp');
global.gutil            = require('gulp-util');
global.fs               = require('fs');
global.argv             = require('minimist')(process.argv.slice(2));
global.karma            = require('karma').server;
global.path             = require('path');
global.rename           = require('gulp-rename');
global.filter           = require('gulp-filter');
global._                = require('lodash');
global.glob             = require('glob').sync;
global.lazypipe         = require('lazypipe');
global.series           = require('stream-series');
global.through2         = require('through2');
global.autoprefixer     = require('gulp-autoprefixer');
global.concat           = require('gulp-concat');
global.filter           = require('gulp-filter');
global.gulpif           = require('gulp-if');
global.insert           = require('gulp-insert');
global.jshint           = require('gulp-jshint');
global.minifyCss        = require('gulp-minify-css');
global.ngAnnotate       = require('gulp-ng-annotate');
global.plumber          = require('gulp-plumber');
global.sass             = require('gulp-sass');
global.uglify           = require('gulp-uglify');
global.webserver        = require('gulp-webserver');

global.IS_RELEASE_BUILD = !!argv.release;
global.IS_DEMO_BUILD    = (!!argv.module || !!argv.m || !!argv.c);
global.VERSION          = argv.version || require('../package.json').version;
global.LR_PORT          = argv.port || argv.p || 8080;

global.config           = require('./config');
global.utils            = require(root + '/scripts/gulp-utils.js');

global.BUILD_MODE       = getBuildMode(global.IS_DEMO_BUILD ? 'demos' : argv.mode);

function getBuildMode (mode) {
  switch (mode) {
    case 'closure': return {
      transform: utils.addClosurePrefixes,
      outputDir: path.join(config.outputDir, 'modules/closure') + path.sep,
      useBower: false
    };
    case 'demos': return {
      transform: utils.addJsWrapper,
      outputDir: path.join(config.outputDir, 'demos') + path.sep,
      useBower: false
    };
    default: return {
      transform: utils.addJsWrapper,
      outputDir: path.join(config.outputDir, 'modules/js') + path.sep,
      useBower: true
    };
  }
}
