var fs = require('fs');
var changelog = require('conventional-changelog');
var ROOT = require('../const').ROOT;
var SHA = require('../const').SHA;
var VERSION = require('../const').VERSION;
var addStream = require('add-stream');
var path = require('path');
var spawnSync = require('child_process').spawnSync;
var chalk = require('gulp-util').colors;
var log = require('gulp-util').log;

exports.task = function () {

  var changelogPath = path.join(ROOT, 'CHANGELOG.md');
  var inputStream = fs.createReadStream(changelogPath);
  var previousTag = getLatestTag();
  var currentTag = 'v' + VERSION;

  /* Validate different fork points for the changelog generation */
  if (previousTag.name === currentTag && !SHA) {
    log(chalk.yellow('Warning: You are generating a changelog by comparing the same versions.'));
  } else if (SHA) {
    log('Generating changelog from commit ' + getShortSha(SHA) + '...');
  } else {
    var shortSha = getShortSha(previousTag.sha);
    log('Generating changelog from tag ' + previousTag.name + ' (' + shortSha + ')');
  }

  var contextOptions = {
    version: VERSION,
    previousTag: previousTag.name,
    currentTag: currentTag
  };

  /* Create our changelog and append the current changelog stream. */
  var changelogStream = changelog({ preset: 'angular' }, contextOptions, {
    from: SHA || previousTag.sha
  }).pipe(addStream(inputStream));


  /* Wait for the changelog to be ready and overwrite it. */
  inputStream.on('end', function() {
    changelogStream.pipe(fs.createWriteStream(changelogPath));
  });

};

/**
 * Resolves the latest tag over all branches from the repository metadata.
 * @returns {{sha: string, name: string}}
 */
function getLatestTag() {
  var tagSha = spawnSync('git', ['rev-list', '--tags', '--max-count=1']).stdout.toString().trim();
  var tagName =  spawnSync('git', ['describe', '--tags', tagSha]).stdout.toString().trim();

  return {
    sha: tagSha,
    name: tagName
  }
}

/**
 * Transforms a normal SHA-1 into a 7-digit SHA.
 * @returns {string} shortened SHA
 */
function getShortSha(sha) {
  return sha.substring(0, 7);
}