const config = require('../config');
const gulp = require('gulp');
const jshint = require('gulp-jshint');

exports.task = function() {
  return gulp.src(config.jsHintFiles)
      .pipe(jshint('.jshintrc'))
      .pipe(jshint.reporter('jshint-summary', {
        fileColCol: ',bold',
        positionCol: ',bold',
        codeCol: 'green,bold',
        reasonCol: 'cyan'
      }))
      .pipe(jshint.reporter('fail'));
};
