(function () {
  'use strict';

  const child_process = require('child_process');
  const defaultOptions = { encoding: 'utf-8' };

  exec([
      'git checkout master',
      'rm -rf /tmp/ngcode',
      'git clone https://github.com/angular/code.material.angularjs.org.git --depth=1 /tmp/ngcode'
  ]);

  const docs = require('/tmp/ngcode/docs.json');

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
      `cp -r ${docs.latest} latest`,
      'git add -A',
      'git commit -m "updating version picker for old releases"',
      'git push'
  ], { cwd: '/tmp/ngcode' });

  //-- utility methods

  function exec (cmd, userOptions) {
    if (cmd instanceof Array) {
      return cmd.map(function (cmd) { return exec(cmd, userOptions); });
    }
    try {
      const options = Object.create(defaultOptions);
      for (const key in userOptions) options[key] = userOptions[key];
      console.log(`\n--------\n ${cmd}`);
      return console.log(child_process.execSync(cmd, options).trim());
    } catch (err) {
      return err;
    }
  }
})();
