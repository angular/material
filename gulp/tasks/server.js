var connect = require('gulp-connect');

exports.task = function() {
  connect.server({
    root: '.',
    livereload: true,
    port: LR_PORT
  });
};
