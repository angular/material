const ROOT = require('../const').ROOT;
const args = require('../util').args;
const karma = require('karma');
const parseConfig = karma.config.parseConfig;
const Server = karma.Server;
const karmaOptions = {
  singleRun: false,
  autoWatch: true,
  browsers: args.browsers ? args.browsers.trim().split(',') : ['Chrome']
};

// Make full build of JS and CSS
exports.dependencies = ['build'];

exports.task = function(done) {
  let karmaConfigPath = ROOT + '/config/karma.conf.js';
  if (args.config)
    karmaConfigPath = ROOT + '/' + args.config.trim();
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
