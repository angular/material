const gutil = require('gulp-util');
const util = require('../util');
const ROOT = require('../const').ROOT;
const karma = require('karma');
const parseConfig = karma.config.parseConfig;
const Server = karma.Server;
const karmaOptions = {
  logLevel: 'warn',
  singleRun: true,
  autoWatch: false
};

const args = util.args;

/**
 * NOTE: `karma-fast` does NOT pre-make a full build of JS and CSS
 */
exports.task = function(done) {
  // NOTE: `karma-fast` does NOT test Firefox by default.
  if (args.browsers) {
    karmaOptions.browsers = args.browsers.trim().split(',');
  }

  if (args.reporters) {
    karmaOptions.reporters = args.reporters.trim().split(',');
  }

  gutil.log('Running unit tests on unminified source.');

  parseConfig(ROOT + '/config/karma.conf.js', karmaOptions, {
    promiseConfig: true,
    throwErrors: true
  }).then(parsedKarmaConfig => {
    const server = new Server(parsedKarmaConfig, function(exitCode) {
      if (exitCode !== 0) {
        gutil.log(gutil.colors.red('Karma exited with the following exit code: ' + exitCode));
      }
      process.env.KARMA_TEST_COMPRESSED = undefined;
      process.env.KARMA_TEST_JQUERY = undefined;
      // eslint-disable-next-line no-process-exit
      process.exit(exitCode);
    });
    gutil.log('Starting Karma Server...');
    server.start();
  });
};
