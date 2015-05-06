global.root = __dirname;
require('./gulp/globals');

if (IS_RELEASE_BUILD) {
  console.log(gutil.colors.red('--release:'), 'Building release version (minified)...');
}

require('./docs/gulpfile')(gulp, IS_RELEASE_BUILD);

gulp.task('build-all-modules', function() {
  return series(gulp.src(['src/components/*', 'src/core/'])
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
          .pipe(gulp.dest(path.join(BUILD_MODE.outputDir, 'core')))
  );
});

function buildModule(module, isRelease) {
  if ( module.indexOf(".") < 0) {
    module = "material.components." + module;
  }

  var name = module.split('.').pop();
  gutil.log('Building ' + module + (isRelease && ' minified' || '') + ' ...');

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

/** *****************************************
 *
 * Tasks for Watch features
 *
 * `gulp watch` - Watch, build and deploy all modules and css
 * `gulp watch-demo -c textfield` - Watch, build and deploy the 'textfield' demos
 * `gulp watch-demo -m material.components.textfield` - Watch, build and deploy the 'textfield' module's demos
 *
 ** ***************************************** */

gulp.task('watch', ['docs'], function() {
  gulp.watch(['docs/**/*', 'src/**/*'], ['build', 'docs']);
});

gulp.task('watch-demo', ['build-demo'], function() {
  var module = readModuleArg();
  var name = module.split('.').pop();
  var dir  = "/dist/demos/"+name.trim();
  gutil.log('\n',
    '-- Rebuilding', dir, 'when source files change...\n',
    '--', gutil.colors.green('Hint:'), 'Run',
    gutil.colors.cyan('`gulp server`'),
    'to start a livereload server in root, then navigate to\n',
    '--', gutil.colors.green('"dist/demos/' + name + '/"'), 'in your browser to develop.'
   );

  return gulp.watch('src/**/*', ['build-demo']);
});

gulp.task('site', function () {
  return gulp.src('dist/docs')
      .pipe(webserver({
        host: '0.0.0.0',
        livereload: true,
        port: LR_PORT,
        directoryListing: false
      }));
});

gulp.task('server', function() {
  return gulp.src('.')
    .pipe(webserver({
      host: '0.0.0.0',
      livereload: true,
      port: LR_PORT,
      directoryListing: true
    }));
});


/** *****************************************
 *
 * Tasks and functions for module Javascript
 *
 ** ***************************************** */

gulp.task('build-js', function() {
  return buildJs(IS_RELEASE_BUILD);
});

gulp.task('build-js-release', function() {
  buildJs(true);
});


/**
 * Builds the entire component library javascript.
 * @param {boolean} isRelease Whether to build in release mode.
 */
global.buildJs = function buildJs(isRelease) {
  gutil.log("building js files...");

  var jsBuildStream = gulp.src(
    config.jsBaseFiles.concat([path.join(config.paths, '*.js')])
  )
    .pipe(filterNonCodeFiles())
    .pipe(utils.buildNgMaterialDefinition())
    .pipe(plumber())
    .pipe(ngAnnotate());

  return series(jsBuildStream, themeBuildStream())
    .pipe(concat('angular-material.js'))
    .pipe(insert.prepend(config.banner))
    .pipe(gulp.dest(config.outputDir))
    .pipe(gulpif(isRelease, lazypipe()
      .pipe(uglify, { preserveComments: 'some' })
      .pipe(rename, { extname: '.min.js' })
      .pipe(gulp.dest, config.outputDir)
      ()
    ));
};

// builds the theming related css and provides it as a JS const for angular
global.themeBuildStream = function themeBuildStream() {
  return gulp.src( config.themeBaseFiles.concat(path.join(config.paths, '*-theme.scss')) )
    .pipe(concat('default-theme.scss'))
    .pipe(utils.hoistScssVariables())
    .pipe(sass())
    .pipe(utils.cssToNgConstant('material.core', '$MD_THEME_CSS'));
};


/** *****************************************
 *
 * Component Demos Tasks and commands
 *
 * Build and deploy demos for a module. This is
 * useful for debugging a specific module independent of
 * the docs build; which has all modules and all demos loaded.
 *
 * To build, watch for changes, and launch web server :
 *
 * ```sh
 *    gulp watch-demo -c button
 *    gulp server
 * ```
 *
 * To build demo files:
 *
 * ```sh
 *    gulp build-demo -c button
 * ```
 *
 ** ***************************************** */

gulp.task('build-demo', ['build', 'build-module-demo'], function() {
  return buildModule(readModuleArg(), false);
});

gulp.task('build-module-demo', function() {
  var mod = readModuleArg();
  var name = mod.split('.').pop();
  var demoIndexTemplate = fs.readFileSync(
    __dirname + '/docs/config/template/demo-index.template.html', 'utf8'
  ).toString();

  gutil.log('Building demos for', mod, '...');

  return utils.readModuleDemos(mod, function() {
    return lazypipe()
        .pipe(gulpif, /.css$/, sass())
        .pipe(gulpif, /.css$/, autoprefix())
        .pipe(gulp.dest, BUILD_MODE.outputDir + name)
        ();
  })
  .pipe(through2.obj(function(demo, enc, next) {
    fs.writeFileSync(
      path.resolve(BUILD_MODE.outputDir, name, demo.name, 'index.html'),
      _.template(demoIndexTemplate, demo)
    );
    next();
  }));

});


/** *****************************************
 *
 * Tasks and functions for Themes and CSS
 *
 ** ***************************************** */


/** *****************************************
 *
 * Internal helper functions
 *
 ** ***************************************** */


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

global.filterNonCodeFiles = function filterNonCodeFiles() {
  return filter(function(file) {
    return !/demo|module\.json|\.spec.js|README/.test(file.path);
  });
};

global.autoprefix = function autoprefix() {
  return autoprefixer({browsers: [
    'last 2 versions', 'last 4 Android versions'
  ]});
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
