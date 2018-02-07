const buildConfig = require('../../../config/build.config');
const q = require('q');
const exec = require('child_process').exec;

module.exports = function buildConfigProcessor() {
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
   * @returns {*}
   */
  function getSHA() {
    const deferred = q.defer();

    exec('git rev-parse HEAD', function(error, stdout) {
      buildConfig.commit = stdout && stdout.toString().trim();
      deferred.resolve(buildConfig.commit);
    });

    return deferred.promise;
  }

  /**
   * Get the commit date for the most recent commit on origin/master
   * @returns {*}
   */
  function getCommitDate() {
    const deferred = q.defer();

    exec('git show -s --format=%ci HEAD', function(error, stdout) {
      buildConfig.date = stdout && stdout.toString().trim();
      deferred.resolve(buildConfig.date);
    });

    return deferred.promise;
  }


};
