
/** Regular npm dependendencies */
var _ = require('lodash');
var argv = require('minimist')(process.argv.slice(2));
var changelog = require('conventional-changelog');
var fs = require('fs');
var glob = require('glob').sync;
var gulp = require('gulp');
var karma = require('karma').server;
var lazypipe = require('lazypipe');
var mergeStream = require('merge-stream');
var path = require('path');
var pkg = require('./package.json');
var series = require('stream-series');
var through2 = require('through2');

/** Gulp dependencies */
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var filter = require('gulp-filter');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var insert = require('gulp-insert');
var jshint = require('gulp-jshint');
var minifyCss = require('gulp-minify-css');
var ngAnnotate = require('gulp-ng-annotate');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var webserver = require('gulp-webserver');

/** Local dependencies */
var buildConfig = require('./config/build.config');
var utils = require('./scripts/gulp-utils.js');

/** Arguments */
var IS_RELEASE_BUILD = !!argv.release;
var IS_DEMO_BUILD = (!!argv.module || !!argv.m || !!argv.c);
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

var LR_PORT = argv.port || argv.p || 8080;

var buildModes = {
  'closure': {
    transform: utils.addClosurePrefixes,
    outputDir: path.join(config.outputDir, 'modules/closure') + path.sep,
    useBower: false
  },
  'demos': {
    transform: gutil.noop,
    outputDir: path.join(config.outputDir, 'demos') + path.sep,
    useBower: false
  },
  'default': {
    transform: gutil.noop,
    outputDir: path.join(config.outputDir, 'modules/js') + path.sep,
    useBower: true
  }
};

IS_DEMO_BUILD && (BUILD_MODE="demos");
BUILD_MODE = buildModes[BUILD_MODE] || buildModes['default'];


if (IS_RELEASE_BUILD) {
  console.log(
    gutil.colors.red('--release:'),
    'Building release version (minified)...'
  );
}

require('./docs/gulpfile')(gulp, IS_RELEASE_BUILD);



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


/** *****************************************
 *
 * Tasks for Karma Test
 *
 ** ***************************************** */

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


/** *****************************************
 *
 * Project-wide Build Tasks
 *
 ** ***************************************** */

gulp.task('build', ['build-scss', 'build-js']);

gulp.task('build-all-modules', function() {
  return gulp.src(['src/components/*', 'src/core/'])
    .pipe(through2.obj(function(folder, enc, next) {
      var moduleId = folder.path.indexOf('components') > -1 ?
        'material.components.' + path.basename(folder.path) :
        'material.' + path.basename(folder.path);

      var stream;
      if (IS_RELEASE_BUILD && BUILD_MODE.useBower) {
        stream = mergeStream(buildModule(moduleId, true), buildModule(moduleId, false));
      } else {
        stream = buildModule(moduleId, false);
      }

      stream.on('end', function() {
        next();
      });
    }));
});

function buildModule(module, isRelease) {
  var name = module.split('.').pop();
  gutil.log('Building ' + module + (isRelease && ' minified' || '') + ' ...');

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
      .pipe(gulpif, /.css$/, minifyCss(), uglify({ preserveComments: 'some' }))
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

gulp.task('watch', ['build'], function() {
  gulp.watch('src/**/*', ['build']);
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

gulp.task('server', function() {
  return gulp.src('.')
    .pipe(webserver({
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
function buildJs(isRelease) {
  gutil.log("building js files...");

  var jsBuildStream = gulp.src(
    config.jsBaseFiles.concat([path.join(config.paths, '*.js')])
  )
    .pipe(filterNonCodeFiles())
    .pipe(utils.buildNgMaterialDefinition())
    .pipe(insert.prepend(config.banner))
    .pipe(plumber())
    .pipe(ngAnnotate());

  var themeBuildStream = gulp.src(
    config.themeBaseFiles.concat(path.join(config.paths, '*-theme.scss'))
  )
    .pipe(concat('default-theme.scss'))
    .pipe(utils.hoistScssVariables())
    .pipe(sass())
    .pipe(gulp.dest('dist'))
    .pipe(utils.cssToNgConstant('material.core', '$MD_THEME_CSS'));

  return series(jsBuildStream, themeBuildStream)
    .pipe(concat('angular-material.js'))
    .pipe(gulp.dest(config.outputDir))
    .pipe(gulpif(isRelease, lazypipe()
      .pipe(uglify, { preserveComments: 'some' })
      .pipe(rename, { extname: '.min.js' })
      .pipe(gulp.dest, config.outputDir)
      ()
    ));
}


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

gulp.task('build-scss', function() {
  // var defaultThemeContents = fs.readFileSync('themes/_default-theme.scss');
  var scssGlob = path.join(config.paths, '*.scss');

  gutil.log("Building css files...");
  return gulp.src(config.scssBaseFiles.concat(scssGlob))
      .pipe(filterNonCodeFiles())
      .pipe(filter(['**', '!**/*-theme.scss'])) // remove once ported
      .pipe(concat('angular-material.scss'))
      // .pipe(insert.append(defaultThemeContents))
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

function filterNonCodeFiles() {
  return filter(function(file) {
    return !/demo|module\.json|\.spec.js|README/.test(file.path);
  });
}

function autoprefix() {
  return autoprefixer({browsers: [
    'last 2 versions', 'last 4 Android versions'
  ]});
}
