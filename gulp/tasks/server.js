exports.task = function() {
  return gulp.src('.')
      .pipe(webserver({
        host: '0.0.0.0',
        livereload: true,
        port: LR_PORT,
        directoryListing: true
      }));
};
