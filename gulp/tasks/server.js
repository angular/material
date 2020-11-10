const connect = require('gulp-connect');
const LR_PORT = require('../const').LR_PORT;

exports.task = function () {
  connect.server({
    root: './',
    livereload: true,
    port: LR_PORT
  });
};
