var gulp = require('gulp');
var webserver = require('gulp-webserver');
var LR_PORT = require('../const').LR_PORT;

exports.task = function() {
  return gulp.src('.')
      .pipe(webserver({
        host: '0.0.0.0',
        livereload: true,
        port: LR_PORT,
        directoryListing: true
      }));
};
