var connect = require('gulp-connect');

exports.task = function () {
  connect.server({
    root: './dist/docs',
    livereload: true,
    port: LR_PORT
  });
};
