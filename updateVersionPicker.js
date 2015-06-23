(function () {
  'use strict';

  var strip          = require('cli-color/strip');
  var fs             = require('fs');
  var prompt         = require('prompt-sync');
  var child_process  = require('child_process');
  var defaultOptions = { encoding: 'utf-8' };

  exec([
      'git checkout master',
      'rm -rf /tmp/ngcode',
      'git clone https://github.com/angular/code.material.angularjs.org.git --depth=1 /tmp/ngcode'
  ]);

  var docs           = require('/tmp/ngcode/docs.json');

  docs.versions.forEach(function (version) {
    exec([
      'rm -rf dist',
      'git checkout v' + version,
      'npm install',
      checkout('app/js/app.js'),
      checkout('app/css/style.css'),
      checkout('app/img/icons'),
      checkout('app/partials'),
      checkout('config/template/index.template.html'),
      'gulp docs --release',
      'cp -r dist/docs/docs.js /tmp/ngcode/' + version,
      'cp -r dist/docs/docs.css /tmp/ngcode/' + version,
      'cp -r dist/docs/index.html /tmp/ngcode/' + version,
      'cp -r dist/docs/img/icons/* /tmp/ngcode/' + version + '/img/icons',
      'git checkout master'
    ]);
    function checkout (filename) {
      return 'git checkout origin/master -- docs/' + filename;
    }
  });
  exec([
      'ls',
      'rm -rf latest',
      'cp -r {{docs.latest}} latest',
      'git add -A',
      'git commit -m "updating version picker for old releases"',
      'git push'
  ], { cwd: '/tmp/ngcode' });

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
