var config = require('../config');
var gulp = require('gulp');
var path = require('path');

exports.task = function() {
  return gulp.src(['material-font/*'])
      .pipe(gulp.dest(path.join(config.outputDir, 'material-font')));
};
