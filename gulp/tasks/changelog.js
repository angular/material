var SHA = argv.sha;
var changelog = require('conventional-changelog');

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
    fs.writeFileSync(root + '/CHANGELOG.md', log);
  });
};
