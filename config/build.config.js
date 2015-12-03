var pkg = require('../package.json');
var fs = require('fs');
var versionFile = __dirname + '/../dist/commit';

module.exports = {
  ngVersion: '1.4.8',
  version: pkg.version,
  repository: pkg.repository.url
    .replace(/^git/,'https')
    .replace(/(\.git)?\/?$/,'')
};
