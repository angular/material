var buildConfig = require('../../../config/build.config');

module.exports = function buildConfigProcessor(log) {
  return {
    $runAfter: ['componentsGenerateProcessor'],
    $runBefore: ['rendering-docs'],
    $process: process
  };

  function process(docs) {
    docs.push({
      template: 'build-config.js',
      outputPath: 'js/build-config.js',
      buildConfig: buildConfig
    });
  }
};
