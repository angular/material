(function () {
  'use strict';

  var colors         = require('colors');
  var child_process  = require('child_process');


  /**
   * Note 'githubcontrib' may require a application-scoped access token: GITHUB_API_TOKEN
   */
  exports.task = function () {
    var appPath = 'dist/docs';

    exec([
      'rm -f '+ appPath + '/contributors.json',
      'githubcontrib --owner=angular --repository=material --cols=6 --format=json --showlogin=true --sortBy=login --sha=master > ' + appPath + '/contributors.json'
      ]);
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
