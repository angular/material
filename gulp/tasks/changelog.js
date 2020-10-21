const fs = require('fs');
const changelog = require('conventional-changelog');
const ROOT = require('../const').ROOT;
const SHA = require('../const').SHA;
const VERSION = require('../const').VERSION;
const addStream = require('add-stream');
const path = require('path');
const spawnSync = require('child_process').spawnSync;
const chalk = require('gulp-util').colors;
const log = require('gulp-util').log;

exports.task = function () {

  const changelogPath = path.join(ROOT, 'CHANGELOG.md');
  const inputStream = fs.createReadStream(changelogPath);
  const previousTag = getLatestTag();
  const currentTag = 'v' + VERSION;

  /* Validate different fork points for the changelog generation */
  if (previousTag.name === currentTag && !SHA) {
    log(chalk.yellow('Warning: You are generating a changelog by comparing the same versions.'));
  } else if (SHA) {
    log('Generating changelog from commit ' + getShortSha(SHA) + '...');
  } else {
    const shortSha = getShortSha(previousTag.sha);
    log('Generating changelog from tag ' + previousTag.name + ' (' + shortSha + ')');
  }

  const contextOptions = {
    version: VERSION,
    previousTag: previousTag.name,
    currentTag: currentTag
  };

  /* Create our changelog and append the current changelog stream. */
  const changelogStream = changelog({ preset: 'angular' }, contextOptions, {
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
  const tagSha = spawnSync('git', ['rev-list', '--tags', '--max-count=1']).stdout.toString().trim();
  const tagName =  spawnSync('git', ['describe', '--tags', tagSha]).stdout.toString().trim();

  return {
    sha: tagSha,
    name: tagName
  };
}

/**
 * Transforms a normal SHA-1 into a 7-digit SHA.
 * @returns {string} shortened SHA
 */
function getShortSha(sha) {
  return sha.substring(0, 7);
}
