const pkg = require('../package.json');

module.exports = {
  ngVersion: '1.7.2',
  version: pkg.version,
  repository: pkg.repository.url
    .replace(/^git/,'https')
    .replace(/(\.git)?\/?$/,'')
};
