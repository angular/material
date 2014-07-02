
var _ = require('lodash');
var changelog = require('conventional-changelog');
var dgeni = require('dgeni');
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

gulp.task('docs-assets', ['build'], function() {
  return gulp.src([
    'bower_components/jquery/dist/jquery.js',
    'bower_components/angular/angular.js',
    'bower_components/angular-animate/angular-animate.js',
    'bower_components/angular-route/angular-route.js',
    'bower_components/angularytics/dist/angularytics.js',
    'config/lib/angular-animate-sequence/angular-animate-sequence.js',
    'config/lib/angular-animate-sequence/angular-animate-stylers.js',
    buildConfig.dist + '/material-design.js',
    buildConfig.dist + '/material-design.css'
  ])
    .pipe(gulp.dest(buildConfig.docsDist + '/lib'));
});

gulp.task('docs-app', function() {
  return gulp.src(['docs/app/**/*', '!docs/app/**/*.{png,jpeg,jpg,gif,svg}'], { base: 'docs/app' })
    .pipe(gulpif(IS_RELEASE_BUILD,
        replace(/material-design\.(js|css)/g, 'material-design.min.$1')))
    .pipe(gulp.dest(buildConfig.docsDist));
});

gulp.task('docs-img', function() {
  return gulp.src('docs/app/**/*.{png,jpeg,jpg,gif,svg}', { base: 'docs/app' })
    .pipe(gulp.dest(buildConfig.docsDist));
});

gulp.task('docs', ['docs-assets', 'docs-app', 'docs-img'], function() {
  return dgeni.generator(__dirname + '/docs/index.js')();
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

argv.browsers && (karmaConf.browsers = argv.browsers.trim().split(','));
gulp.task('karma', function(done) {
  karma.start(_.assign({}, karmaConf, {singleRun: true}), done);
});

gulp.task('karma-watch', function(done) {
  karma.start(_.assign({}, karmaConf, {singleRun: false}), done);
});

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
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(gulp.dest(buildConfig.docsDist + '/lib'));
});

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
