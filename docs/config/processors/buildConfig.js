var buildConfig = require('../../../config/build.config');
var q = require('q');
var exec = require('child_process').exec;

module.exports = function buildConfigProcessor(log) {
  return {
    $runBefore: ['rendering-docs'],
    $unAfter: ['indexPageProcessor'],
    $process: process
  };

  function process(docs) {

    var deferred = q.defer();
    exec('git rev-parse HEAD', function(error, stdout, stderr) {
      buildConfig.commit = stdout && stdout.toString().trim();

      docs.push({
        template: 'build-config.js',
        outputPath: 'js/build-config.js',
        buildConfig: buildConfig
      });
      deferred.resolve(docs);
    });

    return deferred.promise;
  }
};
