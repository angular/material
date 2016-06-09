var gulp = require('gulp');
var connect = require('gulp-connect');

exports.dependencies = ['docs-js', 'docs-css', 'docs-demo-scripts', 'build-contributors'];

exports.task = function () { gulp.src('.').pipe(connect.reload()); };
