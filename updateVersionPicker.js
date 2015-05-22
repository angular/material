(function () {
  'use strict';

  var strip          = require('cli-color/strip');
  var fs             = require('fs');
  var prompt         = require('prompt-sync');
  var child_process  = require('child_process');
  var defaultOptions = { encoding: 'utf-8' };

  exec(
      'rm -rf /tmp/ngcode',
      'git clone https://github.com/angular/code.material.angularjs.org.git /tmp/ngcode --depth=1'
  );

  var docs           = require('./code.material.angularjs.org/docs.json');

  docs.versions.forEach(function (version) {
    exec([
      'git checkout master',
      'rm -rf dist',
      'git checkout v{{version}}',
      'git checkout origin/master -- docs/app/js/app.js',
      'git checkout origin/master -- docs/app/css/style.css',
      'git checkout origin/master -- docs/app/img/icons/github-icon.svg',
      'git checkout origin/master -- docs/config/template/index.template.html',
      'gulp docs --release',
      'cp -r dist/docs/docs.js /tmp/ngcode/{{version}}/',
      'cp -r dist/docs/docs.css /tmp/ngcode/{{version}}/',
      'cp -r dist/docs/index.html /tmp/ngcode/{{version}}/',
      'cp -r dist/docs/img/icons/github-icon.svg /tmp/ngcode/{{version}}/img/icons/'
    ]);
    function fill(str) {
      return str.replace(/\{\{[^\}]+\}\}/g, function (match) {
        return eval(match.substr(2, match.length - 4));
      });
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
  });
  exec([
      'cd code.material.angularjs.org',
      'ls',
      'rm -rf latest',
      'cp -r {{docs.latest}} latest',
      'git add -A',
      //'git commit -m "updating version picker for old releases"',
      //'git push',
      //'cd ..',
      //'rm -rf code.material.angularjs.org'
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
      log('\n--------\n' + fill(cmd));
      return log(child_process.execSync(fill(cmd), options).trim());
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
