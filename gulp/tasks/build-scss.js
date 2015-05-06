exports.task = function() {
  var modules   = argv['modules'],
      overrides = argv['override'],
      dest      = argv['output-dir'] || config.outputDir,
      filename  = argv['filename'] || 'angular-material',
      paths     = getPaths();

  gutil.log("Building css files...");
  var streams = [];
  streams.push(
      gulp.src(paths)
          .pipe(filterNonCodeFiles())
          .pipe(filter(['**', '!**/*-theme.scss']))
          .pipe(concat('angular-material.scss'))
          .pipe(sass())
          .pipe(rename({ basename: filename }))
          .pipe(autoprefix())
          .pipe(insert.prepend(config.banner))
          .pipe(gulp.dest(dest))
          .pipe(gulpif(IS_RELEASE_BUILD, lazypipe()
                  .pipe(minifyCss)
                  .pipe(rename, {extname: '.min.css'})
                  .pipe(gulp.dest, dest)
              ()
          ))
  );
  if (IS_RELEASE_BUILD) {
    var baseVars = fs.readFileSync('src/core/style/variables.scss', 'utf8').toString();
    streams.push(
        gulp.src(config.scssStandaloneFiles)
            .pipe(insert.prepend(baseVars))
            .pipe(sass())
            .pipe(autoprefix())
            .pipe(insert.prepend(config.banner))
            .pipe(rename({prefix: 'angular-material-'}))
            .pipe(gulp.dest(path.join(dest, 'modules', 'css')))
    );
  }
  return series(streams);
  function getPaths () {
    var paths = config.scssBaseFiles.slice();
    if (modules) {
      paths.push.apply(paths, modules.split(',').map(function (module) {
        return 'src/components/' + module + '/*.scss';
      }));
    } else {
      paths.push(path.join(config.paths, '*.scss'));
    }
    overrides && paths.unshift(overrides);
    return paths;
  }
};
