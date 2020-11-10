const ROOT = require('../const').ROOT;
const args = require('../util').args;
const Server = require('karma').Server;
const config = {
      singleRun: false,
      autoWatch: true,
      configFile: ROOT + '/config/karma.conf.js',
      browsers : args.browsers ? args.browsers.trim().split(',') : ['Chrome']
    };

// Make full build of JS and CSS
exports.dependencies = ['build'];

exports.task = function(done) {
  const server = new Server(config, done);
  server.start();
};
