var gutil = require('gulp-util');
var karma = require('karma').server;
var util = require('../util');
var ROOT = require('../const').ROOT;
var args = util.args;
var Server = require('karma').Server;

var karma;    // karma server instance using `new Server()`
var karmaConfig = {
  logLevel: 'warn',
  configFile: ROOT + '/config/karma.conf.js'
};

// Make full build of JS and CSS
exports.dependencies = ['build'];

exports.task = function (done) {
  var errorCount = 0;

  if ( args.browsers )  karmaConfig.browsers = args.browsers.trim().split(',');
  if ( args.reporters ) karmaConfig.reporters = args.reporters.trim().split(',');
  if ( args.config )    karmaConfig.configFile = ROOT + '/' + args.config.trim();


  gutil.log(gutil.colors.blue('Running unit tests on unminified source.'));

  karma = new Server( karmaConfig, captureError(testMinified,clearEnv));
  karma.start();

  function testMinified() {
    gutil.log(gutil.colors.blue('Running unit tests on minified source.'));
    process.env.KARMA_TEST_COMPRESSED = true;

    karma = new Server(karmaConfig, captureError(testMinifiedJquery,clearEnv));
    karma.start();
  }

  function testMinifiedJquery() {
    gutil.log(gutil.colors.blue('Running unit tests on minified source w/ jquery.'));
    process.env.KARMA_TEST_COMPRESSED = true;
    process.env.KARMA_TEST_JQUERY = true;

    karma = new Server(karmaConfig, done);
    karma.start();
  }

  function clearEnv() {
    process.env.KARMA_TEST_COMPRESSED = false;
    process.env.KARMA_TEST_JQUERY = false;
  }

  /**
   * For each version of testings (unminified, minified, minified w/ jQuery)
   * capture the exitCode and update the error count...
   *
   * When all versions are done, report any errors that may manifest
   * [e.g. perhaps in the minified tests]
   *
   * NOTE: All versions must pass before the CI server will announce 'success'
   */
  function captureError(next,abort) {
    return function(exitCode, errorCode) {
      if (exitCode != 0) {
        errorCount++;
        gutil.log(gutil.colors.red("Karma exited with the following exit code: " + exitCode));
        if ( errorCode ) gutil.log(gutil.colors.red("Karma error code: " + errorCode));
      }

      if( errorCount > 0) process.exit(errorCount);
      else                next();
    };
  }

};
