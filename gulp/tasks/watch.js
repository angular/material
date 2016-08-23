var gulp = require('gulp');

exports.dependencies = ['docs'];

exports.task = function() {
  gulp.watch(['docs/**/*', 'src/**/!(*.spec)'], ['docs']);
};
