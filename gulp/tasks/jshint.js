var jshint = require('gulp-jshint');
var config = require('../config');

exports.task = function() {
  return gulp.src(config.jsFiles)
      .pipe(jshint('.jshintrc'))
      .pipe(jshint.reporter(require('jshint-summary')({
        fileColCol: ',bold',
        positionCol: ',bold',
        codeCol: 'green,bold',
        reasonCol: 'cyan'
      })))
      .pipe(jshint.reporter('fail'));
};
