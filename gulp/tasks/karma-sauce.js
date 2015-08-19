var karma = require('karma').server;
var ROOT = require('../const').ROOT;

exports.task = function(done) {
  karma.start(require(ROOT + '/config/karma-sauce.conf.js'), done);
};
