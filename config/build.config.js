const pkg = require('../package.json');

module.exports = {
  ngVersion: '1.7.8',
  version: pkg.version,
  repository: pkg.repository.url
    .replace(/^git/,'https')
    .replace(/(\.git)?\/?$/,'')
};
