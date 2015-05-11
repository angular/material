/**
 * Builds the entire component library javascript.
 * @param {boolean} isRelease Whether to build in release mode.
 */
exports.buildJs = function buildJs(isRelease) {
  var jsFiles = config.jsBaseFiles.concat([path.join(config.paths, '*.js')]);

  gutil.log("building js files...");

  var jsBuildStream = gulp.src( jsFiles )
      .pipe(filterNonCodeFiles())
      .pipe(utils.buildNgMaterialDefinition())
      .pipe(plumber())
      .pipe(ngAnnotate())
      .pipe(utils.addJsWrapper(true));

  var jsProcess = series(jsBuildStream, themeBuildStream() )
      .pipe(concat('angular-material.js'))
      .pipe(BUILD_MODE.transform())
      .pipe(insert.prepend(config.banner))
      .pipe(gulp.dest(config.outputDir))
      .pipe(gulpif(isRelease, lazypipe()
              .pipe(uglify, { preserveComments: 'some' })
              .pipe(rename, { extname: '.min.js' })
              .pipe(gulp.dest, config.outputDir)
          ()
      ));

  return series(jsProcess, deployMaterialMocks())
};
