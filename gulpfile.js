
var _ = require('lodash');
var changelog = require('conventional-changelog');
var fs = require('fs');
var path = require('path');
var glob = require('glob').sync;
var gulp = require('gulp');
var karma = require('karma').server;
var pkg = require('./package.json');
var mergeStream = require('merge-stream');

var argv = require('minimist')(process.argv.slice(2));

var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var filter = require('gulp-filter');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var insert = require('gulp-insert');
var jshint = require('gulp-jshint');
var lazypipe = require('lazypipe');
var minifyCss = require('gulp-minify-css');
var ngAnnotate = require('gulp-ng-annotate');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var through2 = require('through2');
var closureCompiler = require('gulp-closure-compiler');
var webserver = require('gulp-webserver');

var karma = require('karma').server;

var buildConfig = require('./config/build.config');
var utils = require('./scripts/gulp-utils.js');

var IS_RELEASE_BUILD = !!argv.release;
var IS_MODULE_BUILD = (!!argv.module || !!argv.m);
var BUILD_MODE = argv.mode;
var VERSION = argv.version || pkg.version;

/** Grab-bag of build configuration. */
var config = {
  banner:
    '/*!\n' +
    ' * Angular Material Design\n' +
    ' * https://github.com/angular/material\n' +
    ' * @license MIT\n' +
    ' * v' + VERSION + '\n' +
    ' */\n',
  jsBaseFiles: [
    'src/core/**/*.js',
    '!src/core/**/*.spec.js'
  ],
  themeBaseFiles: [
    'src/core/style/color-palette.scss',
    'src/core/style/variables.scss',
    'src/core/style/mixins.scss'
  ],
  scssBaseFiles: [
    'src/core/style/color-palette.scss',
    'src/core/style/variables.scss',
    'src/core/style/mixins.scss',
    'src/core/style/structure.scss',
    'src/core/style/layout.scss'
  ],
  paths: 'src/{components,services}/**',
  outputDir: 'dist/'
};

var buildModes = {
  'closure': {
    transform: utils.addClosurePrefixes,
    outputDir: path.join(config.outputDir, 'closure') + path.sep,
    useBower: false
  },
  'module': {
    transform: gutil.noop,
    outputDir: path.join(config.outputDir, 'module') + path.sep,
    useBower: false
  },
  'default': {
    transform: gutil.noop,
    outputDir: path.join(config.outputDir, 'js') + path.sep,
    useBower: true
  }
};

IS_MODULE_BUILD && (BUILD_MODE="module");
BUILD_MODE = buildModes[BUILD_MODE] || buildModes['default'];


if (IS_RELEASE_BUILD) {
  console.log(
    gutil.colors.red('--release:'),
    'Building release version (minified)...'
  );
}

require('./docs/gulpfile')(gulp, IS_RELEASE_BUILD);


function readModuleArg() {
  var module = argv.module || argv.m;
  if (!module) {
    gutil.log('\nProvide a module argument via `--module` or `-m`.',
      '\nExample: --module=material.components.toast or -m material.components.dialog');
    process.exit(1);
  }
  return module;
}


gulp.task('default', ['build']);
gulp.task('validate', ['jshint', 'karma']);


gulp.task('changelog', function(done) {
  changelog({
    repository: 'https://github.com/angular/material',
    version: VERSION,
    file: 'CHANGELOG.md'
  }, function(err, log) {
    fs.writeFileSync(__dirname + '/CHANGELOG.md', log);
  });
});


/** JSHint */
gulp.task('jshint', function() {
  return gulp.src(
    buildConfig.paths.js.concat(buildConfig.paths.test)
  )
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter(require('jshint-summary')({
      fileColCol: ',bold',
      positionCol: ',bold',
      codeCol: 'green,bold',
      reasonCol: 'cyan'
    })))
    .pipe(jshint.reporter('fail'));
});


/** Karma Tests */
gulp.task('karma', function(done) {
  var karmaConfig = {
    singleRun: true,
    autoWatch: false,
    browsers : argv.browsers ? argv.browsers.trim().split(',') : ['Chrome'],
    configFile: __dirname + '/config/karma.conf.js'
  };

  gutil.log('Running unit tests on unminified source.');
  karma.start(karmaConfig, testMinified);

  function testMinified() {
    gutil.log('Running unit tests on minified source.');
    buildJs(true);
    karmaConfig.releaseMode = true;
    karma.start(karmaConfig, done);
  }
});


gulp.task('karma-watch', function(done) {
  karma.start({
    singleRun:false,
    autoWatch:true,
    configFile: __dirname + '/config/karma.conf.js'
  },done);
});


gulp.task('karma-sauce', function(done) {
  karma.start(require('./config/karma-sauce.conf.js'), done);
});


/******* Project-wide build tasks *******/

gulp.task('build', ['build-themes', 'build-scss', 'build-js']);


gulp.task('build-all-modules', function() {
  var addedCore = false;
  return gulp.src(['src/components/*', 'src/core/',])
    .pipe(through2.obj(function(folder, enc, next) {
      var moduleId = folder.path.indexOf('components') > -1 ?
        'material.components.' + path.basename(folder.path) :
        'material.' + path.basename(folder.path);
      buildModule(moduleId).on('end', function() {
        next();
      });
    }));
});

gulp.task('watch', ['build'], function() {
  gulp.watch('src/**/*', ['build']);
});


gulp.task('watch-module', ['build', 'build-module'], function() {
  var module = readModuleArg();
  var name = module.split('.').pop();
  gutil.log('\n',
    '-- Rebuilding', module, 'when source files change...\n',
    '--', gutil.colors.green('Hint:'), 'Run',
    gutil.colors.cyan('`gulp server`'),
    'to start a livereload server in root, then navigate to\n',
    '--', gutil.colors.green('"dist/module/' + name + '/"'), 'in your browser to develop.'
   );

  return gulp.watch('src/**/*', ['build', 'build-demo']);
});


var LR_PORT = argv.port || argv.p || 8080;
gulp.task('server', function() {
  return gulp.src('.')
    .pipe(webserver({
      livereload: true,
      port: LR_PORT,
      directoryListing: true
    }));
});


gulp.task('build-default-theme', function() {
  return gulp.src(config.themeBaseFiles.concat(path.join(config.paths, '*-theme.scss')))
    .pipe(concat('_default-theme.scss'))
    .pipe(utils.hoistScssVariables())
    .pipe(gulp.dest('themes/'));
});


gulp.task('build-theme', ['build-default-theme'], function() {
  var theme = argv.theme || argv.t || 'default';
  theme = theme.replace(/-theme$/, '');
  return buildTheme(theme);
});


gulp.task('build-themes', ['build-default-theme'], function() {
  var stream = mergeStream();
  var themes = glob('themes/**.scss', { cwd: __dirname })
    .filter(function(themeName) {
      return themeName.split('/')[1].charAt(0) != '_';
    });
  themes.forEach(function(themeFile) {
    var name = themeFile.match(/((\w|-)+)-theme\.scss/)[1];
    stream.add(buildTheme(name));
  });
  return stream;
});


gulp.task('build-scss', ['build-default-theme'], function() {
  var defaultThemeContents = fs.readFileSync('themes/_default-theme.scss');
  var scssGlob = path.join(config.paths, '*.scss');

  gutil.log("Building css files...");
  return gulp.src(config.scssBaseFiles.concat(scssGlob))
    .pipe(filterNonCodeFiles())
    .pipe(filter(['**', '!**/*-theme.scss'])) // remove once ported
    .pipe(concat('angular-material.scss'))
    .pipe(insert.append(defaultThemeContents))
    .pipe(sass())
    .pipe(autoprefix())
    .pipe(insert.prepend(config.banner))
    .pipe(gulp.dest(config.outputDir))
    .pipe(gulpif(IS_RELEASE_BUILD, lazypipe()
      .pipe(minifyCss)
      .pipe(rename, {extname: '.min.css'})
      .pipe(gulp.dest, config.outputDir)
      ()
    ));
});


gulp.task('build-js', function() {
  return buildJs(IS_RELEASE_BUILD);
});


gulp.task('build-js-release', function() {
  buildJs(true);
});


/**
 * Gets a function to stream javascript minification.
 * @param {string} fileName The name of the minified file.
 * @return {function(): Stream}
 */
function minifyJs(fileName) {
  // Return a function instead of the stream itself in order to work with
  // lazypipe.
  return closureCompiler({
    compilerPath: 'bower_components/closure-compiler/lib/vendor/compiler.jar',
    fileName: fileName,
    compilerFlags: {
      language_in: 'ECMASCRIPT5',
      warning_level: 'QUIET'
    }
  });
}


/**
 * Builds the entire component library javascript.
 * @param {boolean} isRelease Whether to build in release mode.
 */
function buildJs(isRelease) {
  var jsGlob = path.join(config.paths, '*.js');
  gutil.log("Building js files...");
  return gulp.src(config.jsBaseFiles.concat([jsGlob]))
    .pipe(filterNonCodeFiles())
    .pipe(utils.buildNgMaterialDefinition())
    .pipe(concat('angular-material.js'))
    .pipe(insert.prepend(config.banner))
    .pipe(ngAnnotate())
    .pipe(gulp.dest(config.outputDir))
    .pipe(gulpif(isRelease, lazypipe()
      .pipe(minifyJs, 'angular-material.min.js')
      .pipe(gulp.dest, config.outputDir)
      ()
    ));
}


function buildTheme(theme) {
  gutil.log("Building theme " + theme + "...");
  return gulp.src([
    'src/core/style/color-palette.scss',
    'themes/' + theme + '-theme.scss',
    'themes/_default-theme.scss'
  ])
    .pipe(concat(theme + '-theme.scss'))
    .pipe(utils.hoistScssVariables())
    .pipe(sass())
    .pipe(gulp.dest(config.outputDir + 'themes/'));
}


/******* Module-specific build tasks *******/
/**
 * Examples:
 * ```sh
 *    gulp build-module -m material.components.button
 *    gulp watch-module -m material.components.button
 *    gulp server
 * ```
 */


gulp.task('build-module', ['build-demo'], function() {
  return buildModule(readModuleArg());
});

function buildModule(module) {
  var name = module.split('.').pop();
  gutil.log('Building module', module, '...');
  return utils.filesForModule(module)
    .pipe(filterNonCodeFiles())
    .pipe(gulpif('*.scss', buildModuleStyles(name)))
    .pipe(gulpif('*.js', buildModuleJs(name)))
    .pipe(BUILD_MODE.transform())
    .pipe(insert.prepend(config.banner))
    .pipe(gulp.dest(BUILD_MODE.outputDir + name))
    .pipe(gulpif(IS_RELEASE_BUILD, lazypipe()
      .pipe(gulpif, BUILD_MODE.useBower, lazypipe()
        .pipe(gulpif, /.css$/, minifyCss(), through2.obj(function(file, enc, next) {
          var name = path.basename(file.path);
          minifyJs(name).on('data', this.push.bind(this));
          next();
        }))
        .pipe(rename, function(path) {
          path.extname = path.extname
            .replace(/.js$/, '.min.js')
            .replace(/.css$/, '.min.css');
        })
        .pipe(utils.buildModuleBower, name, VERSION)
        ()
      )
      .pipe(gulp.dest, BUILD_MODE.outputDir + name)
      ()
    ));
}


gulp.task('build-demo', function() {
  var mod = readModuleArg();
  var name = mod.split('.').pop();
  var demoIndexTemplate = fs.readFileSync(
    __dirname + '/docs/demos/demo-index.template.html', 'utf8'
  ).toString();
	
  gutil.log('Building demos for', mod, '...');
  return utils.readModuleDemos(mod, function() {
    return lazypipe()
      .pipe(gulpif, /.css$/, sass())
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


function buildModuleJs(name) {
  return lazypipe()
  .pipe(ngAnnotate)
  .pipe(concat, name + '.js')
  .pipe(gulpif(IS_RELEASE_BUILD, minifyJs.bind(null, name + '.min.js'), gutil.noop))
  ();
}


/******* Preconfigured gulp plugin invocations *******/

function filterNonCodeFiles() {
  return filter(function(file) {
    return !/demo|module\.json|\.spec.js|README/.test(file.path);
  });
}


function autoprefix() {
  return autoprefixer({browsers: [
    'last 2 versions', 'last 3 Android versions'
  ]});
}
