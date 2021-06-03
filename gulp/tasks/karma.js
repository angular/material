const gutil = require('gulp-util');
const util = require('../util');
const ROOT = require('../const').ROOT;
const args = util.args;
const karma = require('karma');
const parseConfig = karma.config.parseConfig;
const Server = karma.Server;

const karmaOptions = {
  logLevel: 'warn'
};

// Make full build of JS and CSS
exports.dependencies = ['build'];

exports.task = function(done) {
  let karmaConfigPath = ROOT + '/config/karma.conf.js';
  if (args.browsers)
    karmaOptions.browsers = args.browsers.trim().split(',');
  if (args.reporters)
    karmaOptions.reporters = args.reporters.trim().split(',');
  if (args.config)
    karmaConfigPath = ROOT + '/' + args.config.trim();

  gutil.log(gutil.colors.blue('Running unit tests on unminified source.'));

  parseConfig(karmaConfigPath, karmaOptions, {promiseConfig: true, throwErrors: true})
      .then(parsedKarmaConfig => {
        const server = new Server(parsedKarmaConfig, function(exitCode) {
          // Immediately exit the process if Karma reported errors, because due to
          // potential still running tunnel-browsers gulp won't exit properly.
          // eslint-disable-next-line no-process-exit
          exitCode === 0 ? done() : process.exit(exitCode);
        });
        server.start();
      });
};
