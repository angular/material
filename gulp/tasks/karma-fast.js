const gutil = require('gulp-util');
const util = require('../util');
const ROOT = require('../const').ROOT;
const Server = require('karma').Server;
const karmaConfig = {
  logLevel: 'warn',
  singleRun: true,
  autoWatch: false,
  configFile: ROOT + '/config/karma.conf.js'
};

const args = util.args;

// NOTE: `karma-fast` does NOT pre-make a full build of JS and CSS
// exports.dependencies = ['build'];

exports.task = function (done) {
  let errorCount = 0;

  if (args.browsers) {
    karmaConfig.browsers = args.browsers.trim().split(',');
  }
  // NOTE: `karma-fast` does NOT test Firefox by default.

  if (args.reporters) {
    karmaConfig.reporters = args.reporters.trim().split(',');
  }


  gutil.log('Running unit tests on unminified source.');

  const karma = new Server(karmaConfig, captureError(clearEnv,clearEnv));
  karma.start();


  function clearEnv() {
    process.env.KARMA_TEST_COMPRESSED = undefined;
    process.env.KARMA_TEST_JQUERY = undefined;

    // eslint-disable-next-line no-process-exit
    if (errorCount > 0) { process.exit(errorCount); }
    done();
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
  function captureError(next,done) {
    return function(exitCode) {
      if (exitCode !== 0) {
        gutil.log(gutil.colors.red("Karma exited with the following exit code: " + exitCode));
        errorCount++;
      }
      // Do not process next set of tests if current set had >0 errors.
      (errorCount > 0) && done() || next();
    };
  }


};
