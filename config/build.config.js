const pkg = require('../package.json');

module.exports = {
  ngVersion: '1.8.0',
  version: pkg.version,
  repository: pkg.repository.url
    .replace(/^git/,'https')
    .replace(/(\.git)?\/?$/,'')
};
