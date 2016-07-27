var Server = require('karma').Server;
var ROOT = require('../const').ROOT;

exports.task = function(done) {
  var srv = new Server({
    logLevel: 'warn',
    configFile: ROOT + '/config/karma-sauce.conf.js'
  }, done);
  srv.start();
};
