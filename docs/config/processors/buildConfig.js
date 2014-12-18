var buildConfig = require('../../../config/build.config');
var q = require('q');
var exec = require('child_process').exec;

module.exports = function buildConfigProcessor(log) {
  return {
    $runBefore: ['rendering-docs'],
    $runAfter: ['indexPageProcessor'],
    $process: process
  };

  function process(docs) {

    docs.push({
      template: 'build-config.js',
      outputPath: 'js/build-config.js',
      buildConfig: buildConfig
    });

    return q.all([ getSHA(), getCommitDate() ])
            .then( function(){
              return docs;
          });
  }

  /**
   * Git the SHA associated with the most recent commit on origin/master
   * @param deferred
   * @returns {*}
   */
  function getSHA() {
    var deferred = q.defer();

    exec('git rev-parse HEAD', function(error, stdout, stderr) {
      buildConfig.commit = stdout && stdout.toString().trim();
      deferred.resolve(buildConfig.commit);
    });

    return deferred.promise;
  }

  /**
   * Get the commit date for the most recent commit on origin/master
   * @param deferred
   * @returns {*}
   */
  function getCommitDate() {
    var deferred = q.defer();

    exec('git show -s --format=%ci HEAD', function(error, stdout, stderr) {
      buildConfig.date = stdout && stdout.toString().trim();
      deferred.resolve(buildConfig.date);
    });

    return deferred.promise;
  }


};
