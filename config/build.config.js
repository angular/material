const pkg = require('../package.json');

module.exports = {
  ngVersion: '1.5.5',
  version: pkg.version,
  repository: pkg.repository.url
    .replace(/^git/,'https')
    .replace(/(\.git)?\/?$/,'')
};
