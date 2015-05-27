var util = require('../util');
var gulpif = require('gulp-if');

exports.task = function() {
  var stream = series(
      gulp.src(['src/core/', 'src/components/*' ])
          .pipe(through2.obj(function(folder, enc, next) {
            var moduleId = folder.path.indexOf('components') > -1
                ? 'material.components.' + path.basename(folder.path)
                : 'material.' + path.basename(folder.path);
            var stream = BUILD_MODE.useBower
                ? series(util.buildModule(moduleId, true), util.buildModule(moduleId, false))
                : util.buildModule(moduleId, false);
            stream.on('end', function() { next(); });
          })),
      util.themeBuildStream()
          .pipe(
            gulpif(BUILD_MODE.name != 'closure',
              BUILD_MODE.transform()
                .pipe(gulp.dest(path.join(BUILD_MODE.outputDir, 'core')))
            )
          )
  );
  if (BUILD_MODE.name == 'closure') {
    stream.pipe(
      utils.appendToFile(path.join(BUILD_MODE.outputDir, 'core', 'core.js'))
    )
    .pipe(BUILD_MODE.transform())
    .pipe(gulp.dest(path.join(BUILD_MODE.outputDir, 'core')))
  }

  return stream;

};
