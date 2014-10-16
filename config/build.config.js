var pkg = require('../package.json');
var bower = require('../bower.json');
var fs = require('fs');
var versionFile = __dirname + '/../dist/commit';

module.exports = {
  ngVersion: '1.3.0',
  commit: fs.existsSync(versionFile) ?
    fs.readFileSync(versionFile).toString() :
    'develop',
  repository: pkg.repository.url
    .replace(/^git/,'https')
    .replace(/(\.git)?\/?$/,''),
};
