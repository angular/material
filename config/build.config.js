const pkg = require('../package.json');

module.exports = {
  ngVersion: '1.7.9',
  version: pkg.version,
  repository: pkg.repository.url
    .replace(/^git/,'https')
    .replace(/(\.git)?\/?$/,'')
};
