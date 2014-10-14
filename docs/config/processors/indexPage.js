var buildConfig = require('../../../config/build.config');

module.exports = function indexPageProcessor(log) {
  return {
    $runAfter: ['componentsGenerateProcessor'],
    $runBefore: ['rendering-docs'],
    $process: process
  };

  function process(docs) {
    docs.push({
      template: 'index.template.html',
      outputPath: 'index.html',
      path: 'index.html',
      buildConfig: buildConfig
    });
  }
};
