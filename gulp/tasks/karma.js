const gutil = require('gulp-util');
const util = require('../util');
const ROOT = require('../const').ROOT;
const args = util.args;
const Server = require('karma').Server;

const karmaConfig = {
  logLevel: 'warn',
  configFile: ROOT + '/config/karma.conf.js'
};

// Make full build of JS and CSS
exports.dependencies = ['build'];

exports.task = function (done) {
  if ( args.browsers )  karmaConfig.browsers = args.browsers.trim().split(',');
  if ( args.reporters ) karmaConfig.reporters = args.reporters.trim().split(',');
  if ( args.config )    karmaConfig.configFile = ROOT + '/' + args.config.trim();

  gutil.log(gutil.colors.blue('Running unit tests on unminified source.'));

  const karma = new Server(karmaConfig, function(exitCode){
    // Immediately exit the process if Karma reported errors, because due to
    // potential still running tunnel-browsers gulp won't exit properly.
    // eslint-disable-next-line no-process-exit
    exitCode === 0 ? done() : process.exit(exitCode);
  });
  karma.start();
};
