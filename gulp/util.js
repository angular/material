exports.buildJs = buildJs;
exports.autoprefix = autoprefix;
exports.buildModule = buildModule;
exports.filterNonCodeFiles = filterNonCodeFiles;
exports.readModuleArg = readModuleArg;
exports.themeBuildStream = themeBuildStream;

/**
 * Builds the entire component library javascript.
 * @param {boolean} isRelease Whether to build in release mode.
 */
function buildJs (isRelease) {
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
      .pipe(gulpif(!IS_DEV, uglify({ preserveComments: 'some' })))
      .pipe(rename({ extname: '.min.js' }))
      .pipe(gulp.dest(config.outputDir));

  return series(jsProcess, deployMaterialMocks());

  // Deploy the `angular-material-mocks.js` file to the `dist` directory
  function deployMaterialMocks() {
    return gulp.src(config.mockFiles)
        .pipe(gulp.dest(config.outputDir));
  }
}

function autoprefix () {
  return autoprefixer({browsers: [
    'last 2 versions', 'last 4 Android versions'
  ]});
}

function buildModule(module, isRelease) {
  if ( module.indexOf(".") < 0) {
    module = "material.components." + module;
  }
  gutil.log('Building ' + module + (isRelease && ' minified' || '') + ' ...');

  var name = module.split('.').pop();
  utils.copyDemoAssets(name, 'src/components/', 'dist/demos/');

  return utils.filesForModule(module)
      .pipe(filterNonCodeFiles())
      .pipe(gulpif('*.scss', buildModuleStyles(name)))
      .pipe(gulpif('*.js', buildModuleJs(name)))
      .pipe(BUILD_MODE.transform())
      .pipe(insert.prepend(config.banner))
      .pipe(gulpif(isRelease, buildMin()))
      .pipe(gulp.dest(BUILD_MODE.outputDir + name));

  function buildMin() {
    return lazypipe()
        .pipe(gulpif, /.css$/, minifyCss(),
        uglify({ preserveComments: 'some' })
            .on('error', function(e) {
              console.log('\x07',e.message);
              return this.end();
            }
        )
    )
        .pipe(rename, function(path) {
          path.extname = path.extname
              .replace(/.js$/, '.min.js')
              .replace(/.css$/, '.min.css');
        })
        .pipe(utils.buildModuleBower, name, VERSION)
    ();
  }

  function buildModuleJs(name) {
    return lazypipe()
        .pipe(plumber)
        .pipe(ngAnnotate)
        .pipe(concat, name + '.js')
    ();
  }

  function buildModuleStyles(name) {
    var files = [];
    config.themeBaseFiles.forEach(function(fileGlob) {
      files = files.concat(glob(fileGlob, { cwd: root }));
    });
    var baseStyles = files.map(function(fileName) {
      return fs.readFileSync(fileName, 'utf8').toString();
    }).join('\n');

    return lazypipe()
        .pipe(insert.prepend, baseStyles)
        .pipe(gulpif, /theme.scss/,
        rename(name + '-default-theme.scss'), concat(name + '.scss')
    )
        .pipe(sass)
        .pipe(autoprefix)
    (); // invoke the returning fn to create our pipe
  }

}

function readModuleArg() {
  var module = argv.c ? 'material.components.' + argv.c : (argv.module || argv.m);
  if (!module) {
    gutil.log('\nProvide a compnent argument via `-c`:',
        '\nExample: -c toast');
    gutil.log('\nOr provide a module argument via `--module` or `-m`.',
        '\nExample: --module=material.components.toast or -m material.components.dialog');
    process.exit(1);
  }
  return module;
}

function filterNonCodeFiles() {
  return filter(function(file) {
    return !/demo|module\.json|\.spec.js|README/.test(file.path);
  });
}

// builds the theming related css and provides it as a JS const for angular
function themeBuildStream() {
  return gulp.src( config.themeBaseFiles.concat(path.join(config.paths, '*-theme.scss')) )
      .pipe(concat('default-theme.scss'))
      .pipe(utils.hoistScssVariables())
      .pipe(sass())
      .pipe(utils.cssToNgConstant('material.core', '$MD_THEME_CSS'));
}

