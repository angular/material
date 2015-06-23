var connect = require('gulp-connect');
var LR_PORT = require('../const').LR_PORT;

exports.task = function () {
  connect.server({
    root: './dist/docs',
    livereload: true,
    port: LR_PORT
  });
};
