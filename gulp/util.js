var config = require('./config');
var gulp = require('gulp');
var gutil = require('gulp-util');
var frep = require('gulp-frep');
var fs = require('fs');
var args = require('minimist')(process.argv.slice(2));
var path = require('path');
var rename = require('gulp-rename');
var filter = require('gulp-filter');
var concat = require('gulp-concat');
var autoprefixer = require('gulp-autoprefixer');
var series = require('stream-series');
var lazypipe = require('lazypipe');
var glob = require('glob').sync;
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var ngAnnotate = require('gulp-ng-annotate');
var minifyCss = require('gulp-minify-css');
var insert = require('gulp-insert');
var gulpif = require('gulp-if');
var constants = require('./const');
var VERSION = constants.VERSION;
var BUILD_MODE = constants.BUILD_MODE;
var IS_DEV = constants.IS_DEV;
var ROOT = constants.ROOT;
var utils = require('../scripts/gulp-utils.js');

exports.buildJs = buildJs;
exports.autoprefix = autoprefix;
exports.buildModule = buildModule;
exports.filterNonCodeFiles = filterNonCodeFiles;
exports.readModuleArg = readModuleArg;
exports.themeBuildStream = themeBuildStream;
exports.args = args;

/**
 * Builds the entire component library javascript.
 * @param {boolean} isRelease Whether to build in release mode.
 */
function buildJs () {
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
      .pipe(insert.append(';window.ngMaterial={version:{full: "' + VERSION +'"}};'))
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

function buildModule(module, opts) {
  opts = opts || {};
  if ( module.indexOf(".") < 0) {
    module = "material.components." + module;
  }
  gutil.log('Building ' + module + (opts.isRelease && ' minified' || '') + ' ...');

  var name = module.split('.').pop();
  utils.copyDemoAssets(name, 'src/components/', 'dist/demos/');

  var stream = utils.filesForModule(module)
      .pipe(filterNonCodeFiles())
      .pipe(gulpif('*.scss', buildModuleStyles(name)))
      .pipe(gulpif('*.js', buildModuleJs(name)));
  if (module === 'material.core') {
    stream = splitStream(stream);
  }
  return stream
      .pipe(BUILD_MODE.transform())
      .pipe(insert.prepend(config.banner))
      .pipe(gulpif(opts.minify, buildMin()))
      .pipe(gulpif(opts.useBower, buildBower()))
      .pipe(gulp.dest(BUILD_MODE.outputDir + name));

  function splitStream (stream) {
    var js = series(stream, themeBuildStream())
        .pipe(filter('*.js'))
        .pipe(concat('core.js'));
    var css = stream.pipe(filter('*.css'));
    return series(js, css);
  }

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
    ();
  }

  function buildBower() {
    return lazypipe()
      .pipe(utils.buildModuleBower, name, VERSION)();
  }

  function buildModuleJs(name) {
    var patterns = [
      {
        pattern: /\@ngInject/g,
        replacement: 'ngInject'
      }
    ];
    return lazypipe()
        .pipe(plumber)
        .pipe(ngAnnotate)
        .pipe(frep, patterns)
        .pipe(concat, name + '.js')
    ();
  }

  function buildModuleStyles(name) {
    var files = [];
    config.themeBaseFiles.forEach(function(fileGlob) {
      files = files.concat(glob(fileGlob, { cwd: ROOT }));
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
  var module = args.c ? 'material.components.' + args.c : (args.module || args.m);
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
    return !/demo|module\.json|script\.js|\.spec.js|README/.test(file.path);
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
