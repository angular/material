//-- include global variables
require('./gulp/globals');

//-- announce release build if necessary
IS_RELEASE_BUILD && console.log(gutil.colors.red('--release:'),
    'Building release version (minified)...');

//-- include docs gulpfile (should eventually be factored out)
require('./docs/gulpfile')(gulp, true);

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
    .filter(function (file) {
      gulp.task(file.name, file.contents.dependencies, file.contents.task);
    });
