var fs = require('fs');
var changelog = require('conventional-changelog');
var util = require('../util');
var ROOT = require('../const').ROOT;
var SHA = require('../const').SHA;
var VERSION = require('../const').VERSION;

exports.task = function () {
  var options = {
    repository: 'https://github.com/angular/material',
    version: VERSION,
    file: 'CHANGELOG.md'
  };
  if (SHA) {
    options.from = SHA;
  }
  changelog(options, function(err, log) {
    fs.writeFileSync(ROOT + '/CHANGELOG.md', log);
  });
};
