(function () {
  'use strict';

  var colors         = require('colors');
  var child_process  = require('child_process');
  var os = require('os');

  /**
   * Note 'githubcontrib' may require an application-scoped access token defined as
   * GITHUB_API_TOKEN in your ENV.
   */
  exports.task = function () {
    var appPath = 'dist/docs';

    child_process.execSync('rm -f ' + appPath + '/contributors.json');

    if (os.platform() === 'win32') {
      process.chdir('./node_modules/.bin');
      child_process.execSync('githubcontrib.cmd --owner angular --repo material --cols 6' +
        ' --format json --showlogin true --sha master --sortOrder desc > '
        + '../../' + appPath + '/contributors.json');
      process.chdir('../..');
    } else {
      exec([
        './node_modules/.bin/githubcontrib --owner angular --repo material --cols 6 --format json' +
        ' --showlogin true --sha master --sortOrder desc > ' + appPath + '/contributors.json'
      ]);
    }
  };
  exports.dependencies = ['docs-js'];

  /** utility method for executing terminal commands */
  function exec (cmd, userOptions) {
    if (cmd instanceof Array) {
      return cmd.map(function (cmd) { return exec(cmd, userOptions); });
    }
    try {
      var options = { } ;
      for (var key in userOptions) options[ key ] = userOptions[ key ];
      return child_process.execSync(cmd + ' 2> /dev/null', options).toString().trim();
    } catch (err) {
      return err;
    }
  }

  /** outputs done text when a task is completed */
  function done () {
    log('done'.green);
  }

  /** outputs to the terminal with string variable replacement */
  function log (msg) {
    console.log(msg || '');
  }

})();
