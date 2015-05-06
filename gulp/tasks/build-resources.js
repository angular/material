exports.task = function() {
  return gulp.src(['material-font/*'])
      .pipe(gulp.dest(path.join(config.outputDir, 'material-font')));
};
