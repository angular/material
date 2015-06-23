var karma = require('karma').server;
var ROOT = require('../const').ROOT;
var args = require('../util').args;

// Make full build of JS and CSS
exports.dependencies = ['build'];

exports.task = function(done) {
  karma.start({
    singleRun: false,
    autoWatch: true,
    configFile: ROOT + '/config/karma.conf.js',
    browsers : args.browsers ? args.browsers.trim().split(',') : ['Chrome']
  },done);
};
