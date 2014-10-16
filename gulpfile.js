
var _ = require('lodash');
var changelog = require('conventional-changelog');
var dgeni = require('dgeni');
var fs = require('fs');
var path = require('path');
var glob = require('glob').sync;
var gulp = require('gulp');
var karma = require('karma').server;
var pkg = require('./package.json');
var exec = require('child_process').exec;

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
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var through2 = require('through2');
var uglify = require('gulp-uglify');
var webserver = require('gulp-webserver');

var buildConfig = require('./config/build.config');
var karmaConf = require('./config/karma.conf.js');
var utils = require('./scripts/gulp-utils.js');

var IS_RELEASE_BUILD = !!argv.release;

if (IS_RELEASE_BUILD) {
  console.log(
    gutil.colors.red('--release:'),
    'Building release version (minified, debugs stripped)...'
  );
}
function readModuleArg() {
  var module = argv.module || argv.m;
  if (!module) {
    gutil.log('\nProvide a module argument via `--module` or `-m`.',
      '\nExample: --module=material.components.toast or -m material.components.dialog');
    process.exit(1);
  }
  return module;
}

require('./docs/gulpfile')(gulp, IS_RELEASE_BUILD);

gulp.task('default', ['build']);
//gulp.task('build', ['scripts', 'sass', 'sass-src']);
gulp.task('validate', ['jshint', 'karma']);

gulp.task('changelog', function(done) {
  changelog({
    repository: 'https://github.com/angular/material',
    version: pkg.version,
    file: 'CHANGELOG.md'
  }, function(err, log) {
    fs.writeFileSync(__dirname + '/CHANGELOG.md', log);
  });
});

/**
 * JSHint
 */
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

/**
 * Karma Tests
 */
argv.browsers && (karmaConf.browsers = argv.browsers.trim().split(','));
gulp.task('karma', function(done) {
  karmaConf.singleRun = true;
  karma.start(karmaConf, done);
});

gulp.task('karma-watch', function(done) {
  karma.start(karmaConf, done);
});

gulp.task('karma-sauce', function(done) {
  karma.start(require('./config/karma-sauce.conf.js'), done);
});


var config = {
  banner:
    '/*!\n' +
    ' * Angular Material Design\n' +
    ' * https://github.com/angular/material\n' +
    ' * @license MIT\n' +
    ' * v' + pkg.version + '\n' +
    ' */\n',
  jsBaseFiles: ['src/core/core.js', 'src/core/util/*.js'],
  themeBaseFiles: ['src/core/style/variables.scss', 'src/core/style/mixins.scss'],
  scssBaseFiles: ['src/core/style/variables.scss', 'src/core/style/mixins.scss', 'src/core/style/{structure,layout,table}.scss'],
  paths: 'src/{components,services}/**',
  outputDir: 'dist/'
};



/**
 * Project wide build related tasks
 */

gulp.task('build', ['build-theme', 'build-scss', 'build-js'], function() {
});

gulp.task('watch', ['build'], function() {
  gulp.watch('src/**/*', ['build']);
});

var LR_PORT = argv.port || argv.p || 8080;
gulp.task('watch-module', ['build', 'build-demo'], function() {
  var module = readModuleArg();
  var name = module.split('.').pop();
  gutil.log('\n',
    '-- Rebuilding', module, 'when source files change...\n',
    '--', gutil.colors.green('Hint:'), 'Run',
    gutil.colors.cyan('`gulp server`'),
    'to start a livereload server in root, then navigate to\n',
    '--', gutil.colors.green('"dist/' + name + '/"'), 'in your browser to develop.'
   );

  return gulp.watch('src/**/*', ['build', 'build-demo']);
});

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
    .pipe(concat('default-theme.scss'))
    .pipe(utils.hoistScssVariables())
    .pipe(gulp.dest('themes/'));
});

gulp.task('build-theme', ['build-default-theme'], function() {
  var theme = argv.theme || argv.t || 'default';
  theme = theme.replace(/-theme$/, '');
  gutil.log("Building theme " + theme + "...");
  return gulp.src(['themes/default-theme.scss', 'themes/' + theme + '-theme.scss'])
    .pipe(concat(theme + '-theme.scss'))
    .pipe(utils.hoistScssVariables())
    .pipe(sass())
    .pipe(gulp.dest(config.outputDir + 'themes/'));
});

gulp.task('build-scss', function() {
  var scssGlob = path.join(config.paths, '*.scss');
  gutil.log("Building css files...");
  return gulp.src(config.scssBaseFiles.concat(scssGlob))
    .pipe(filterNonCodeFiles())
    .pipe(filter(['**', '!**/*-theme.scss'])) // remove once ported
    .pipe(concat('angular-material.scss'))
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
  var jsGlob = path.join(config.paths, '*.js');
  gutil.log("Building js files...");
  return gulp.src(config.jsBaseFiles.concat([jsGlob]))
    .pipe(filterNonCodeFiles())
    .pipe(utils.buildNgMaterialDefinition())
    .pipe(insert.wrap('(function() {\n', '})();\n'))
    .pipe(concat('angular-material.js'))
    .pipe(insert.prepend(config.banner))
    .pipe(gulp.dest(config.outputDir))
    .pipe(gulpif(IS_RELEASE_BUILD, lazypipe()
      .pipe(uglify)
      .pipe(rename, {extname: '.min.js'})
      .pipe(gulp.dest, config.outputDir)
      ()
    ));
});

/**
 * Module specific build tasks
 */

gulp.task('build-module', function() {
  var mod = readModuleArg();
  var name = mod.split('.').pop();

  gutil.log('Building module', mod, '...');
  return utils.filesForModule(mod)
    .pipe(filterNonCodeFiles())
    .pipe(gulpif('*.scss', buildModuleStyles(name)))
    .pipe(gulpif('*.js', buildModuleJs(name)))
    .pipe(insert.prepend(config.banner))
    .pipe(gulpif(IS_RELEASE_BUILD, utils.buildModuleBower(name, pkg.version)))
    .pipe(gulp.dest(config.outputDir + name));
});

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
      .pipe(gulp.dest, config.outputDir + name)
      ();
  })
    .pipe(through2.obj(function(demo, enc, next) {
      fs.writeFileSync(
        path.resolve(config.outputDir, name, demo.name, 'index.html'),
        _.template(demoIndexTemplate, demo)
      );
      next();
    }));
});

function buildModuleStyles(name) {
  var baseStyles = glob(config.themeBaseFiles, { cwd: __dirname }).map(function(fileName) {
    return fs.readFileSync(fileName, 'utf8').toString();
  }).join('\n');
  return lazypipe()
  .pipe(insert.prepend, baseStyles)
  .pipe(gulpif, /theme.scss/,
      rename(name + '-default-theme.scss'), concat(name + '-core.scss')
  )
  .pipe(sass)
  .pipe(autoprefix)
  .pipe(gulpif, IS_RELEASE_BUILD, minifyCss())
  (); // invoke the returning fn to create our pipe
}

function buildModuleJs(name) {
  return lazypipe()
  .pipe(insert.wrap, '(function() {\n', '})();\n')
  .pipe(concat, name + '.js')
  .pipe(gulpif, IS_RELEASE_BUILD, uglify({preserveComments: 'some'}))
  ();
}


/**
 * Preconfigured gulp plugin invocations
 */

function filterNonCodeFiles() {
  return filter(function(file) {
    if (/demo/.test(file.path)) return false;
    if (/README/.test(file.path)) return false;
    if (/module\.json/.test(file.path)) return false;
    if (/\.spec\.js/.test(file.path)) return false;
    return true;
  });
}

function autoprefix() {
  return autoprefixer([
    'Chrome Android', 'iOS', 'last 2 Safari versions',
    'last 2 Chrome versions'
  ]);
}
