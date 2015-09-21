var gulp = require('gulp');
var webserver = require('gulp-webserver');
var LR_PORT = require('../const').LR_PORT;
var util = require('../util');

exports.task = function() {
    var openUrl = false;
    if (typeof util.args.o === 'string' ||
        typeof util.args.o === 'boolean') {
        openUrl = util.args.o;
    }
    return gulp.src('.')
      .pipe(webserver({
            host: '0.0.0.0',
            livereload: true,
            port: LR_PORT,
            directoryListing: true,
            open: openUrl
        }));
};
