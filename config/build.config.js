var pkg = require('../package.json');
var bower = require('../bower.json');

module.exports = {
  ngVersion: '1.3.0-rc.4',
  repository: pkg.repository.url
    .replace(/^git/,'https')
    .replace(/(\.git)?\/?$/,'')
};
