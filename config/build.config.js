var pkg = require('../package.json');
var fs = require('fs');
var versionFile = __dirname + '/../dist/commit';

module.exports = {
  ngVersion: '1.3.15',
  version: pkg.version,
  repository: pkg.repository.url
    .replace(/^git/,'https')
    .replace(/(\.git)?\/?$/,'')
};
