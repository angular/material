exports.dependencies = ['build', 'build-module-demo'];

exports.task = function() {
  return buildModule(readModuleArg(), false);
};
