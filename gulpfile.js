var gulp = require('gulp');
var fs = require('fs');

//-- include docs gulpfile (should eventually be factored out)
require('./docs/gulpfile');

//-- read in all files from gulp/tasks and create tasks for them
fs.readdirSync('./gulp/tasks')
    .filter(function (filename) {
      return filename.match(/\.js$/i);
    })
    .map(function (filename) {
      return {
        name: filename.substr(0, filename.length - 3),
        contents: require('./gulp/tasks/' + filename)
      };
    })
    .forEach(function (file) {
      gulp.task(file.name, file.contents.dependencies, file.contents.task);
    });
