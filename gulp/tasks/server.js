const gulp = require('gulp');
const webserver = require('gulp-webserver');
const LR_PORT = require('../const').LR_PORT;
const util = require('../util');

exports.task = function() {
  let openUrl = false;

  if (typeof util.args.o === 'string' ||
    typeof util.args.o === 'boolean') {
    openUrl = util.args.o;
  }

  return gulp.src('.')
    .pipe(webserver({
      host: '0.0.0.0',
      livereload: true,
      port: LR_PORT,
      directoryListing: false,
      open: openUrl
    }));
};
