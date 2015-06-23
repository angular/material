var util = require('../util');

exports.dependencies = ['build', 'build-module-demo'];

exports.task = function() {
  return util.buildModule(util.readModuleArg(), false);
};
