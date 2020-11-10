const Server = require('karma').Server;
const ROOT = require('../const').ROOT;

exports.task = function(done) {
  const srv = new Server({
    logLevel: 'warn',
    configFile: ROOT + '/config/karma-sauce.conf.js'
  }, done);
  srv.start();
};
