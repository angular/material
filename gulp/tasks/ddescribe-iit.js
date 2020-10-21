const gulp = require('gulp');
const PluginError = require('gulp-util').PluginError;
const path = require('path');
const through2 = require('through2');

const kDisallowedFunctions = [
  // Allow xit/xdescribe --- disabling tests is okay
  'fit',
  'iit',
  'fdescribe',
  'ddescribe',
  'describe.only',
  'it.only'
];

function disallowedIndex(largeString, disallowedString) {
  const notFunctionName = '[^A-Za-z0-9$_]';
  const regex = new RegExp('(^|' + notFunctionName + ')(' + disallowedString + ')' + notFunctionName + '*\\(', 'gm');
  const match = regex.exec(largeString);
  // Return the match accounting for the first submatch length.
  return match != null ? match.index + match[1].length : -1;
}

function checkFile(fileContents, disallowed) {
  let res = void 0;
  if (Array.isArray(disallowed)) {
    disallowed.forEach(function(str) {
      const index = disallowedIndex(fileContents, str);
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
  let failures = void 0;
  return gulp.src(['src/**/*.spec.js', 'test/**/*-spec.js'])
      .pipe(through2.obj(function(file, enc, next) {
        const errors = checkFile(file.contents.toString(), kDisallowedFunctions);
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
          this.emit('error', new PluginError('ddescribe-iit', {
            message: '\n' + failures.map(function(failure) {
              const filename = path.relative(process.cwd(), failure.file.path);
              const lines = failure.contents.split('\n');
              let start = 0;
              const starts = lines.map(function(line) { const s = start; start += line.length + 1; return s; });
              return failure.errors.map(function(error) {
                const line = lines[error.line - 1];
                const start = starts[error.line - 1];
                const col = (error.index - start);
                return '  `' + error.str + '` found at ' +filename + ':' + error.line + ':' + (col+1) + '\n' +
                       '      ' + line + '\n' +
                       '      ' + repeat(' ', col) + repeat('^', error.str.length);
                function repeat(c, len) {
                  let s = '';
                  if (len > 0) {
                    for (let i = 0; i < len; ++i) {
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
