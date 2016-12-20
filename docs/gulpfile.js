var gulp = require('gulp');
var Dgeni = require('dgeni');
var _ = require('lodash');
var concat = require('gulp-concat');
var fs = require('fs');
var gulpif = require('gulp-if');
var lazypipe = require('lazypipe');
var mkdirp = require('mkdirp');
var ngHtml2js = require('gulp-ng-html2js');
var path = require('path');
var sass = require('gulp-sass');
var through2 = require('through2');
var uglify = require('gulp-uglify');
var utils = require('../scripts/gulp-utils.js');
var karma = require('karma').server;
var argv = require('minimist')(process.argv.slice(2));
var gutil = require('gulp-util');
var series = require('stream-series');

var config = {
  demoFolder: 'demo-partials'
};

gulp.task('demos', function() {
  var demos = [];
  return generateDemos()
    .pipe(through2.obj(function(demo, enc, next) {
      // Don't include file contents into the docs app,
      // it saves space
      demo.css.concat(demo.js).concat(demo.html).concat(demo.index)
        .forEach(function(file) {
          delete file.contents;
        });
      demos.push(demo);
      next();
    }, function(done) {
      var demoIndex = _(demos)
        .groupBy('moduleName')
        .map(function(moduleDemos, moduleName) {
          var componentName = moduleName.split('.').pop();
          return {
            name: componentName,
            moduleName: moduleName,
            label: utils.humanizeCamelCase(componentName),
            demos: moduleDemos,
            url: 'demo/' + componentName
          };
        })
        .value();

      var dest = path.resolve(__dirname, '../dist/docs/js');
      var file = "angular.module('docsApp').constant('DEMOS', " +
        JSON.stringify(demoIndex, null, 2) + ");";
      mkdirp.sync(dest);
      fs.writeFileSync(dest + '/demo-data.js', file);

      done();
    }));
});

function generateDemos() {
  return gulp.src('src/{components,services}/*/')
    .pipe(through2.obj(function(folder, enc, next) {
      var self = this;
      var split = folder.path.split(path.sep);
      var name = split.pop();
      var moduleName = 'material.' + split.pop() + '.' + name;

      utils.copyDemoAssets(name, 'src/components/', 'dist/docs/demo-partials/');

      utils.readModuleDemos(moduleName, function(demoId) {
        return lazypipe()
          .pipe(gulpif, /^(?!.+global\.).*css/, transformCss(demoId))
          .pipe(gulp.dest, 'dist/docs/demo-partials/' + name)
        ();
      })
        .on('data', function(demo) {
          self.push(demo);
        })
        .on('end', next);

      function transformCss(demoId) {
        return lazypipe()
          .pipe(through2.obj, function(file, enc, next) {
            file.contents = new Buffer(
              '.' + demoId + ' {\n' + file.contents.toString() + '\n}'
            );
            next(null, file);
          })
          .pipe(sass)
        ();
      }
    }));
}

gulp.task('docs-generate', ['build'], function() {
  var dgeni = new Dgeni([
    require('./config')
  ]);
  return dgeni.generate();
});

gulp.task('docs-app', ['docs-generate'], function() {
  return gulp.src(['docs/app/**/*', '!docs/app/partials/**/*.html'])
    .pipe(gulp.dest('dist/docs'));
});

gulp.task('docs-demo-scripts', ['demos'], function() {
  return gulp.src('dist/docs/demo-partials/**/*.js')
    .pipe(concat('docs-demo-scripts.js'))
    .pipe(gulp.dest('dist/docs'));
});

gulp.task('docs-js-dependencies', ['build'], function() {
  return gulp.src(['dist/angular-material.js', 'dist/angular-material.min.js', 'docs/app/contributors.json'])
    .pipe(gulp.dest('dist/docs'));
});

gulp.task('docs-js', ['docs-app', 'docs-html2js', 'demos', 'build', 'docs-js-dependencies'], function() {
  var preLoadJs = ['docs/app/js/preload.js'];
  if (process.argv.indexOf('--jquery') != -1) {
    preLoadJs.push('node_modules/jquery/dist/jquery.js');
  }

  return series(
    gulp.src([
      'node_modules/angularytics/dist/angularytics.js',
      'dist/docs/js/app.js', // Load the Angular module initialization at first.
      'dist/docs/js/**/*.js'
    ])
      .pipe(concat('docs.js'))
      .pipe(gulpif(!argv.dev, uglify())),
    gulp.src(preLoadJs)
      .pipe(concat('preload.js'))
      .pipe(gulpif(!argv.dev, uglify()))
  )
  .pipe(gulp.dest('dist/docs'));
});

gulp.task('docs-css-dependencies', ['build'], function() {
  return gulp.src([
    'dist/angular-material.css',
    'dist/angular-material.min.css'
  ])
  .pipe(gulp.dest('dist/docs'));
});

gulp.task('docs-css', ['docs-app', 'build', 'docs-css-dependencies'], function() {
  return gulp.src([
    'dist/themes/*.css',
    'docs/app/css/highlightjs-material.css',
    'docs/app/css/layout-demo.css',
    'docs/app/css/style.css'
  ])
  .pipe(concat('docs.css'))
  .pipe(utils.autoprefix())
  .pipe(gulp.dest('dist/docs'));
});

gulp.task('docs-html2js', function() {
  return gulp.src('docs/app/**/*.tmpl.html')
    .pipe(ngHtml2js({
      moduleName: 'docsApp',
      declareModule: false
    }))
    .pipe(concat('docs-templates.js'))
    .pipe(gulp.dest('dist/docs/js'));
});

gulp.task('docs-karma', ['docs-js'], function(done) {
  var karmaConfig = {
    singleRun: true,
    autoWatch: false,
    browsers: argv.browsers ? argv.browsers.trim().split(',') : ['Chrome'],
    configFile: __dirname + '/../config/karma-docs.conf.js'
  };

  karma.start(karmaConfig, function(exitCode) {
    if (exitCode != 0) {
      gutil.log(gutil.colors.red("Karma exited with the following exit code: " + exitCode));
      process.exit(exitCode);
    }
    done();
  });
});
