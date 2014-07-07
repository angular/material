
var _ = require('lodash');
var changelog = require('conventional-changelog');
var dgeni = require('dgeni');
var glob = require('glob').sync;
var gulp = require('gulp');
var karma = require('karma').server;
var pkg = require('./package.json');

var argv = require('minimist')(process.argv.slice(2));

var concat = require('gulp-concat');
var footer = require('gulp-footer');
var gulpif = require('gulp-if');
var header = require('gulp-header');
var jshint = require('gulp-jshint');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var stripDebug = require('gulp-strip-debug');
var template = require('gulp-template');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var replace = require('gulp-replace');
var uncss = require('gulp-uncss');

var buildConfig = require('./config/build.config');
var karmaConf = require('./config/karma.conf.js');

var IS_RELEASE_BUILD = !!argv.release;
if (IS_RELEASE_BUILD) {
  gutil.log(
    gutil.colors.red('--release:'),
    'Building release version (minified, debugs stripped)...'
  );
}

gulp.task('default', ['build']);
gulp.task('build', ['scripts', 'sass']);
gulp.task('validate', ['jshint', 'karma']);

gulp.task('watch', ['build'], function() {
  gulp.watch(['src/**/*.{scss,js,html}'], ['build']);
});


/**
 * Docs
 */
gulp.task('docs', ['docs-assets', 'docs-html', 'docs-generate', 'docs-app'], function() {
  return gulp.src('dist/docs/lib/material-design.{min.css,css}')
    .pipe(gulpif(IS_RELEASE_BUILD, uncss({
      html: glob(__dirname + '/dist/docs/**/*.html')
    })))
    .pipe(gulp.dest('dist/docs/lib'));
});

gulp.task('docs-assets', ['build'], function() {
  return gulp.src(buildConfig.docsAssets)
    .pipe(gulp.dest(buildConfig.docsLib));
});

gulp.task('docs-html', function() {
  return gulp.src('docs/app/**/*.html', { base: 'docs/app' })
    .pipe(gulpif(IS_RELEASE_BUILD,
        replace(/material-design\.(js|css)/g, 'material-design.min.$1')))
    .pipe(gulp.dest(buildConfig.docsDist));
});

gulp.task('docs-generate', function() {
  return dgeni.generator(__dirname + '/docs/index.js')();
});

gulp.task('docs-app', function() {
  return gulp.src(['docs/app/**/*', '!docs/app/**/*.html'], { base: 'docs/app' })
    .pipe(gulp.dest(buildConfig.docsDist));
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
  karma.start(_.assign({}, karmaConf, {singleRun: true}), done);
});

gulp.task('karma-watch', function(done) {
  karma.start(_.assign({}, karmaConf, {singleRun: false}), done);
});

/**
 * Build material-design.js
 */
//TODO build components individually
//Factor scripts and scss out into a task that works on either
//an individual component or the whole bundle
gulp.task('scripts', function() {
  return gulp.src(buildConfig.paths.js)
    .pipe(concat('material-design.js'))
    .pipe(header(_.template(buildConfig.componentsModule, {
      components: buildConfig.components.map(enquote)
    })))
    .pipe(header(buildConfig.closureStart))
    .pipe(footer(buildConfig.closureEnd))
    .pipe(header(buildConfig.banner))
    .pipe(gulp.dest(buildConfig.dist))
    .pipe(gulpif(IS_RELEASE_BUILD, uglify({
      preserveComments: 'some' //preverse banner
    })))
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest(buildConfig.docsDist + '/lib'));
});

/**
 * Build material-design.css
 */
gulp.task('sass', function() {
  return gulp.src(buildConfig.paths.scss)
    .pipe(header(buildConfig.banner))
    .pipe(sass({
      // Normally, gulp-sass exits on error. This is good during normal builds.
      // During watch builds, we only want to log the error.
      errLogToConsole: argv._.indexOf('watch') > -1
    }))
    .pipe(concat('material-design.css'))
    .pipe(gulp.dest(buildConfig.dist))
    .pipe(gulpif(IS_RELEASE_BUILD, minifyCss()))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest(buildConfig.docsDist + '/lib'));
});

function enquote(str) {
  return '"' + str + '"';
}
