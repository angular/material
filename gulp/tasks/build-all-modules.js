exports.task = function() {
  return series(
      gulp.src(['src/core/', 'src/components/*' ])
          .pipe(through2.obj(function(folder, enc, next) {
            var moduleId = folder.path.indexOf('components') > -1
                ? 'material.components.' + path.basename(folder.path)
                : 'material.' + path.basename(folder.path);
            var stream = (IS_RELEASE_BUILD && BUILD_MODE.useBower)
                ? series(buildModule(moduleId, true), buildModule(moduleId, false))
                : buildModule(moduleId, false);
            stream.on('end', function() { next(); });
          })),
      themeBuildStream()
          .pipe(BUILD_MODE.transform())
          .pipe(gulp.dest(path.join(BUILD_MODE.outputDir, 'core'))
      )).pipe(BUILD_MODE.transform());
};
