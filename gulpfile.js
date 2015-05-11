global.root = __dirname;
require('./gulp/globals');

if (IS_RELEASE_BUILD) {
  console.log(gutil.colors.red('--release:'), 'Building release version (minified)...');
}

require('./docs/gulpfile')(gulp, IS_RELEASE_BUILD);

global.buildModule = function buildModule(module, isRelease) {
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
    files = files.concat(glob(fileGlob, { cwd: __dirname }));
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

// Deploy the `angular-material-mocks.js` file to the `dist` directory
global.deployMaterialMocks = function deployMaterialMocks() {

  return gulp.src(config.mockFiles)
    .pipe(gulp.dest(config.outputDir));

};

// builds the theming related css and provides it as a JS const for angular
global.themeBuildStream = function themeBuildStream() {
  return gulp.src( config.themeBaseFiles.concat(path.join(config.paths, '*-theme.scss')) )
    .pipe(concat('default-theme.scss'))
    .pipe(utils.hoistScssVariables())
    .pipe(sass())
    .pipe(utils.cssToNgConstant('material.core', '$MD_THEME_CSS'));
};

global.readModuleArg = function readModuleArg() {
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

global.filterNonCodeFiles = function filterNonCodeFiles() {
  return filter(function(file) {
    return !/demo|module\.json|\.spec.js|README/.test(file.path);
  });
};

//-- read in all files from gulp/tasks and create tasks for them
fs.readdirSync('./gulp/tasks')
    .filter(function (filename) {
      return filename.match(/\.js$/i);
    })
    .map(function (filename) {
      return {
        name: filename.substr(0, filename.length - 3),
        contents: require('./gulp/tasks/' + filename)
      };
    })
    .filter(function (file) {
      gulp.task(file.name, file.contents.dependencies, file.contents.task);
    });
