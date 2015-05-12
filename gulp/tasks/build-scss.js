var util = require('../util');

exports.task = function() {
  var modules   = argv['modules'],
      overrides = argv['override'],
      dest      = argv['output-dir'] || config.outputDir,
      filename  = argv['filename'] || 'angular-material',
      paths     = getPaths();
  var streams = [];
  var baseVars = fs.readFileSync('src/core/style/variables.scss', 'utf8').toString();
  gutil.log("Building css files...");
  streams.push(
      gulp.src(paths)
          .pipe(util.filterNonCodeFiles())
          .pipe(filter(['**', '!**/*-theme.scss']))
          .pipe(concat('angular-material.scss'))
          .pipe(sass())
          .pipe(rename({ basename: filename }))
          .pipe(util.autoprefix())
          .pipe(insert.prepend(config.banner))
          .pipe(gulp.dest(dest))
          .pipe(gulpif(!IS_DEV, minifyCss()))
          .pipe(rename({extname: '.min.css'}))
          .pipe(gulp.dest(dest))
  );
  streams.push(
      gulp.src(config.scssStandaloneFiles)
          .pipe(insert.prepend(baseVars))
          .pipe(sass())
          .pipe(util.autoprefix())
          .pipe(insert.prepend(config.banner))
          .pipe(rename({prefix: 'angular-material-'}))
          .pipe(gulp.dest(path.join(dest, 'modules', 'css')))
  );
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
