var versionConfig = require("../../../config/version-info")
module.exports = function versionConfigProcessor(log) {
  return {
    $runBefore: ['rendering-docs'],
    $runAfter: ['indexPageProcessor'],
    $process: process
  };

  function process(docs) {
    docs.push({
      template: 'version-config.js',
      outputPath: 'js/version-config.js',
      versionConfig: versionConfig
    });
  }
}
