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
var series = require('stream-series');
var lazypipe = require('lazypipe');
var glob = require('glob').sync;
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var ngAnnotate = require('gulp-ng-annotate');
var insert = require('gulp-insert');
var gulpif = require('gulp-if');
var nano = require('gulp-cssnano');
var postcss = require('postcss');
var _ = require('lodash');
var constants = require('./const');
var VERSION = constants.VERSION;
var BUILD_MODE = constants.BUILD_MODE;
var IS_DEV = constants.IS_DEV;
var ROOT = constants.ROOT;
var utils = require('../scripts/gulp-utils.js');

exports.buildJs = buildJs;
exports.autoprefix = utils.autoprefix;
exports.buildModule = buildModule;
exports.filterNonCodeFiles = filterNonCodeFiles;
exports.readModuleArg = readModuleArg;
exports.themeBuildStream = themeBuildStream;
exports.minifyCss = minifyCss;
exports.dedupeCss = dedupeCss;
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

function minifyCss(extraOptions) {
  var options = {
    autoprefixer: false,
    reduceTransforms: false,
    svgo: false,
    safe: true
  };

  return nano(_.assign(options, extraOptions));
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
      .pipe(filterLayoutAttrFiles())
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
        .pipe(filter('**/*.js'))
        .pipe(concat('core.js'));

    var css = stream
      .pipe(filter(['**/*.css', '!**/ie_fixes.css']))

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
      },
      {
        // Turns `thing.$inject` into `thing['$inject']` in order to prevent
        // Closure from stripping it from objects with an @constructor
        // annotation.
        pattern: /\.\$inject\b/g,
        replacement: "['$inject']"
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
        .pipe(gulpif, /theme.scss/, rename(name + '-default-theme.scss'), concat(name + '.scss'))
        // Theme files are suffixed with the `default-theme.scss` string.
        // In some cases there are multiple theme SCSS files, which should be concatenated together.
        .pipe(gulpif, /default-theme.scss/, concat(name + '-default-theme.scss'))
        .pipe(sass)
        .pipe(dedupeCss)
        .pipe(utils.autoprefix)
    (); // Invoke the returning lazypipe function to create our new pipe.
  }

}

function readModuleArg() {
  var module = args.c ? 'material.components.' + args.c : (args.module || args.m);
  if (!module) {
    gutil.log('\nProvide a component argument via `-c`:',
        '\nExample: -c toast');
    gutil.log('\nOr provide a module argument via `--module` or `-m`.',
        '\nExample: --module=material.components.toast or -m material.components.dialog');
    process.exit(1);
  }
  return module;
}

/**
 * We are not injecting the layout-attributes selectors into the core module css,
 * otherwise we would have the layout-classes and layout-attributes in there.
 */
function filterLayoutAttrFiles() {
  return filter(function(file) {
    return !/.*layout-attributes\.scss/g.test(file.path);
  });
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
      .pipe(dedupeCss())
      // The PostCSS orderedValues plugin modifies the theme color expressions.
      .pipe(minifyCss({ orderedValues: false }))
      .pipe(utils.cssToNgConstant('material.core', '$MD_THEME_CSS'));
}

// Removes duplicated CSS properties.
function dedupeCss() {
  var prefixRegex = /-(webkit|moz|ms|o)-.+/;

  return insert.transform(function(contents) {
    // Parse the CSS into an AST.
    var parsed = postcss.parse(contents);

    // Walk through all the rules, skipping comments, media queries etc.
    parsed.walk(function(rule) {
      // Skip over any comments, media queries and rules that have less than 2 properties.
      if (rule.type !== 'rule' || !rule.nodes || rule.nodes.length < 2) return;

      // Walk all of the properties within a rule.
      rule.walk(function(prop) {
        // Check if there's a similar property that comes after the current one.
        var hasDuplicate = validateProp(prop) && _.find(rule.nodes, function(otherProp) {
          return prop !== otherProp && prop.prop === otherProp.prop && validateProp(otherProp);
        });

        // Remove the declaration if it's duplicated.
        if (hasDuplicate) {
          prop.remove();

          gutil.log(gutil.colors.yellow(
            'Removed duplicate property: "' +
              prop.prop + ': ' + prop.value + '" from "' + rule.selector + '"...'
          ));
        }
      });
    });

    // Turn the AST back into CSS.
    return parsed.toResult().css;
  });

  // Checks if a property is a style declaration and that it
  // doesn't contain any vendor prefixes.
  function validateProp(prop) {
    return prop && prop.type === 'decl' && ![prop.prop, prop.value].some(function(value) {
      return value.indexOf('-') > -1 && prefixRegex.test(value);
    });
  }
}
