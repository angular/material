global.gulp = require('gulp');
global.gutil = require('gulp-util');
global.fs   = require('fs');
global.argv = require('minimist')(process.argv.slice(2));

global.IS_RELEASE_BUILD = !!argv.release;
global.IS_DEMO_BUILD = (!!argv.module || !!argv.m || !!argv.c);
global.BUILD_MODE = argv.mode;
global.VERSION = argv.version || require('../package.json').version;
