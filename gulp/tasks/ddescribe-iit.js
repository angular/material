var BUILD_MODE = require('../const').BUILD_MODE;

var gulp = require('gulp');
var PluginError = require('gulp-util').PluginError;
var path = require('path');
var through2 = require('through2');
var series = require('stream-series');
var util = require('../util');
var gulpif = require('gulp-if');
var utils = require('../../scripts/gulp-utils.js');

var kDisallowedFunctions = [
  // Allow xit/xdescribe --- disabling tests is okay
  'fit',
  'iit',
  //'xit',
  'fdescribe',
  'ddescribe',
  //'xdescribe',
  'describe.only',
  'it.only'
];

function disallowedIndex(largeString, disallowedString) {
  var notFunctionName = '[^A-Za-z0-9$_]';
  var regex = new RegExp('(^|' + notFunctionName + ')(' + disallowedString + ')' + notFunctionName + '*\\(', 'gm');
  var match = regex.exec(largeString);
  // Return the match accounting for the first submatch length.
  return match != null ? match.index + match[1].length : -1;
}

function checkFile(fileContents, disallowed) {
  var res = void 0;
  if (Array.isArray(disallowed)) {
    disallowed.forEach(function(str) {
      var index = disallowedIndex(fileContents, str);
      if (index !== -1) {
        res = res || [];
        res.push({
          str: str,
          line: fileContents.substr(0, index).split('\n').length,
          index: index
        });
      }
    });
  }
  return res;
}

exports.task = function() {
  var failures = void 0;
  return gulp.src(['src/**/*.spec.js', 'test/**/*-spec.js' ])
      .pipe(through2.obj(function(file, enc, next) {
        var errors = checkFile(file.contents.toString(), kDisallowedFunctions);
        if (errors) {
          failures = failures || [];
          failures.push({
            file: file,
            contents: file.contents.toString(),
            errors: errors
          });
        }
        next();
      }, function(callback) {
        if (failures) {
          var indented = true;
          this.emit('error', new PluginError('ddescribe-iit', {
            message: '\n' + failures.map(function(failure) {
              var filename = path.relative(process.cwd(), failure.file.path);
              var lines = failure.contents.split('\n');
              var start = 0;
              var starts = lines.map(function(line) { var s = start; start += line.length + 1; return s; });
              return failure.errors.map(function(error) {
                var line = lines[error.line - 1];
                var start = starts[error.line - 1];
                var col = (error.index - start);
                var msg = '  `' + error.str + '` found at ' +filename + ':' + error.line + ':' + (col+1) + '\n' +
                          '      ' + line + '\n' +
                          '      ' + repeat(' ', col) + repeat('^', error.str.length);
                return msg;
                function repeat(c, len) {
                  var s = '';
                  if (len > 0) {
                    for (var i = 0; i < len; ++i) {
                      s += c;
                    }
                  }
                  return s;
                }
              }).join('\n\n');
            }).join('\n\n'),
            showStack: false
          }));
        }
        callback();
      }));
};
