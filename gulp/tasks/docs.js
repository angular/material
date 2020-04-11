const gulp = require('gulp');
const connect = require('gulp-connect');
const constants = require('../const');
const IS_DEV = constants.IS_DEV;

if (IS_DEV) {
  exports.dependencies = ['docs-js', 'docs-css', 'docs-demo-scripts'];
} else {
  exports.dependencies = ['docs-js', 'docs-css', 'docs-demo-scripts', 'build-contributors'];
}

exports.task = function () { gulp.src('.').pipe(connect.reload()); };
