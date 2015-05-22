(function () {
  'use strict';

  var strip          = require('cli-color/strip');
  var fs             = require('fs');
  var prompt         = require('prompt-sync');
  var child_process  = require('child_process');
  var defaultOptions = { encoding: 'utf-8' };

  exec('git clone https://github.com/angular/code.material.angularjs.org.git');

  var docs           = require('./code.material.angularjs.org/docs.json');

  docs.versions.forEach(function (version) {
    exec([
      'git co master',
      'git co v{{version}}',
      'git co origin/master -- docs/app/js/app.js',
      'git co origin/master -- docs/app/css/style.css',
      'git co origin/master -- docs/app/img/icons/github-icon.svg',
      'git co origin/master -- docs/config/template/index.template.html',
      'gulp docs --release',
      'cp -r dist/docs/docs.js ../code.material.angularjs.org/{{version}}/',
      'cp -r dist/docs/docs.css ../code.material.angularjs.org/{{version}}/',
      'cp -r dist/docs/index.html ../code.material.angularjs.org/{{version}}/'
    ]);
  });
  exec([
      'cd code.material.angularjs.org',
      'rm -rf latest',
      'cp -r {{docs.latest}} latest',
      'git add -A',
      'git commit -m "updating version picker for old releases"',
      'cd ..',
      'rm -rf code.material.angularjs.org'
  ]);

  //-- utility methods

  function fill(str) {
    return str.replace(/\{\{[^\}]+\}\}/g, function (match) {
      return eval(match.substr(2, match.length - 4));
    });
  }

  function done () {
    log('done'.green);
  }

  function exec (cmd, userOptions) {
    if (cmd instanceof Array) {
      return cmd.map(function (cmd) { return exec(cmd, userOptions); });
    }
    try {
      var options = Object.create(defaultOptions);
      for (var key in userOptions) options[key] = userOptions[key];
      return child_process.execSync(fill(cmd), options).trim();
    } catch (err) {
      return err;
    }
  }

  function log (msg) {
    console.log(fill(msg));
  }

  function write (msg) {
    process.stdout.write(fill(msg));
  }
})();
