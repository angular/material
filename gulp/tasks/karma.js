var gutil = require('gulp-util');
var karma = require('karma').server;
var util = require('../util');
var ROOT = require('../const').ROOT;
var args = util.args;
var Server = require('karma').Server;
var karmaConfig = {
  logLevel: 'warn',
  singleRun: true,
  autoWatch: false,
  configFile: ROOT + '/config/karma.conf.js'
};
var karma;    // karma server instance using `new Server()`

// Make full build of JS and CSS
exports.dependencies = ['build'];

exports.task = function (done) {
  var errorCount = 0;

  /**
   * For each version of testings (unminified, minified, minified w/ jQuery)
   * capture the exitCode and update the error count...
   *
   * When all versions are done, report any errors that may manifest
   * [e.g. perhaps in the minified tests]
   *
   * NOTE: All versions must pass before the CI server will announce 'success'
   */
  function captureError(next,done) {
    return function(exitCode) {
      if (exitCode != 0) {
        gutil.log(gutil.colors.red("Karma exited with the following exit code: " + exitCode));
        errorCount++;
      }
      // Do not process next set of tests if current set had >0 errors.
      (errorCount > 0) && done() || next();
    };
  }


  if ( args.browsers ) {
    karmaConfig.browsers = args.browsers.trim().split(',');
  }

  if ( args.reporters ) {
    karmaConfig.reporters = args.reporters.trim().split(',');
  }

  gutil.log('Running unit tests on unminified source.');
  karma = new Server( karmaConfig, captureError(testMinified,clearEnv));
  karma.start();

  function testMinified() {
    gutil.log('Running unit tests on minified source.');
    process.env.KARMA_TEST_COMPRESSED = true;

    karma = new Server(karmaConfig, captureError(testMinifiedJquery,clearEnv));
    karma.start();
  }

  function testMinifiedJquery() {
    gutil.log('Running unit tests on minified source w/ jquery.');
    process.env.KARMA_TEST_COMPRESSED = true;
    process.env.KARMA_TEST_JQUERY = true;

    karma = new Server(karmaConfig, clearEnv);
    karma.start();
  }

  function clearEnv() {
    process.env.KARMA_TEST_COMPRESSED = undefined;
    process.env.KARMA_TEST_JQUERY = undefined;

    if (errorCount > 0) { process.exit(errorCount); }
    done();
  }
};
