var util = require('../util');

exports.task = function (done) {
  var errorCount = 0;
  var karmaConfig = {
    logLevel: 'warn',
    singleRun: true,
    autoWatch: false,
    browsers : argv.browsers ? argv.browsers.trim().split(',') : ['Chrome'],
    configFile: root + '/config/karma.conf.js'
  };

  /**
   * For each version of testings (unminified, minified, minified w/ jQuery)
   * capture the exitCode and update the error count...
   *
   * When all versions are done, report any errors that may manifest
   * [e.g. perhaps in the minified tests]
   *
   * NOTE: All versions must pass before the CI server will announce 'success'
   */
  function captureError(next) {
    return function(exitCode) {
      if (exitCode != 0) {
        gutil.log(gutil.colors.red("Karma exited with the following exit code: " + exitCode));
        errorCount++;
      }
      next();
    };
  }


  gutil.log('Running unit tests on unminified source.');
  util.buildJs(true);
  karma.start(karmaConfig, captureError(testMinified));

  function testMinified() {
    gutil.log('Running unit tests on minified source.');
    process.env.KARMA_TEST_COMPRESSED = true;
    karma.start(karmaConfig, captureError(testMinifiedJquery));
  }

  function testMinifiedJquery() {
    gutil.log('Running unit tests on minified source w/ jquery.');
    process.env.KARMA_TEST_COMPRESSED = true;
    process.env.KARMA_TEST_JQUERY = true;
    karma.start(karmaConfig, clearEnv);
  }

  function clearEnv() {
    process.env.KARMA_TEST_COMPRESSED = undefined;
    process.env.KARMA_TEST_JQUERY = undefined;

    if (errorCount > 0) { process.exit(errorCount); }
    done();
  }
};
