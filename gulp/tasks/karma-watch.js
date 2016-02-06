var karma = require('karma').server;
var ROOT = require('../const').ROOT;
var args = require('../util').args;
var Server = require('karma').Server;
var config = {
      singleRun: false,
      autoWatch: true,
      configFile: ROOT + '/config/karma.conf.js',
      browsers : args.browsers ? args.browsers.trim().split(',') : ['Chrome']
    };

// Make full build of JS and CSS
exports.dependencies = ['build'];

exports.task = function(done) {
  var server = new Server(config, done);
  server. start();
};
