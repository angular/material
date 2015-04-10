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

var config = {
  demoFolder: 'demo-partials'
};

module.exports = function(gulp, IS_RELEASE_BUILD) {
  gulp.task('docs', ['docs-js', 'docs-css', 'docs-demo-scripts']);

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
            return {
              name: moduleName,
              label: utils.humanizeCamelCase( moduleName.split('.').pop() ),
              demos: moduleDemos,
              url: '/demo/' + moduleName
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
            .pipe(gulpif, /.css$/, transformCss(demoId))
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

  gulp.task('docs-js', ['docs-app', 'docs-html2js', 'demos', 'build'], function() {
    return gulp.src([
      'node_modules/angularytics/dist/angularytics.js',
      'dist/angular-material.js',
      'dist/docs/js/**/*.js'
    ])
      .pipe(concat('docs.js'))
      .pipe(gulpif(IS_RELEASE_BUILD, uglify()))
      .pipe(gulp.dest('dist/docs'));
  });

  gulp.task('docs-css', ['docs-app', 'build'], function() {
    return gulp.src([
      'dist/angular-material.css',
      'dist/themes/*.css',
      'docs/app/css/highlightjs-material.css',
      'docs/app/css/layout-demo.css',
      'docs/app/css/style.css'
    ])
      .pipe(concat('docs.css'))
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

};
