var config = require('../config');
var gulp = require('gulp');
var jshint = require('gulp-jshint');

exports.task = function() {
  return gulp.src(config.jsFiles)
      .pipe(jshint('.jshintrc'))
      .pipe(jshint.reporter('jshint-summary', {
        fileColCol: ',bold',
        positionCol: ',bold',
        codeCol: 'green,bold',
        reasonCol: 'cyan'
      }))
      .pipe(jshint.reporter('fail'));
};
