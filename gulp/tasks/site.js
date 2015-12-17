var connect = require('gulp-connect');
var LR_PORT = require('../const').LR_PORT;

exports.task = function () {
  connect.server({
    root: './dist/docs',
    livereload: true,
    port: LR_PORT,

    // For any 404, respond with index.html. This enables html5Mode routing.
    // In a production environment, this would be done with much more
    // fine-grained URL rewriting rules.
    fallback: './dist/docs/index.html'
  });
};
