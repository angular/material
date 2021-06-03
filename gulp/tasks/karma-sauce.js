const ROOT = require('../const').ROOT;
const karma = require('karma');
const parseConfig = karma.config.parseConfig;
const Server = karma.Server;
const karmaOptions = {
  logLevel: 'warn'
};

exports.task = function(done) {
  parseConfig(ROOT + '/config/karma-sauce.conf.js', karmaOptions, {
    promiseConfig: true,
    throwErrors: true
  }).then(parsedKarmaConfig => {
    const server = new Server(parsedKarmaConfig, function(exitCode) {
      // Immediately exit the process if Karma reported errors, because due to
      // potential still running tunnel-browsers gulp won't exit properly.
      // eslint-disable-next-line no-process-exit
      exitCode === 0 ? done() : process.exit(exitCode);
    });
    server.start();
  });
};
