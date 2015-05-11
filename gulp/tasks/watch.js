exports.dependencies = ['docs'];

exports.task = function() {
  gulp.watch(['docs/**/*', 'src/**/*'], ['build', 'docs']);
};
