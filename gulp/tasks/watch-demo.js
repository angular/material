var gulp = require('gulp');
var gutil = require('gulp-util');
var util = require('../util');

exports.dependencies = ['build-demo'];

exports.task = function() {
  var module = util.readModuleArg();
  var name = module.split('.').pop();
  var dir  = "/dist/demos/"+name.trim();
  gutil.log('\n',
      '-- Rebuilding', dir, 'when source files change...\n',
      '--', gutil.colors.green('Hint:'), 'Run',
      gutil.colors.cyan('`gulp server`'),
      'to start a livereload server in root, then navigate to\n',
      '--', gutil.colors.green('"dist/demos/' + name + '/"'), 'in your browser to develop.'
  );

  return gulp.watch('src/**/!(*.spec)', ['build-demo']);
};
