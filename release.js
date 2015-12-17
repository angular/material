(function () {
  'use strict';

  var colors         = require('colors');
  var strip          = require('cli-color/strip');
  var fs             = require('fs');
  var prompt         = require('prompt-sync');
  var child_process  = require('child_process');
  var pkg            = require('./package.json');
  var oldVersion     = pkg.version;
  var abortCmds      = [ 'git reset --hard', 'git checkout staging', 'rm abort push' ];
  var pushCmds       = [ 'rm abort push' ];
  var cleanupCmds    = [];
  var defaultOptions = { encoding: 'utf-8' };
  var origin         = 'https://github.com/angular/material.git';
  var lineWidth      = 80;
  var lastMajorVer   = JSON.parse(exec('curl https://material.angularjs.org/docs.json')).latest;
  var newVersion;
  var dryRun;

  header();
  write('Is this a dry-run? {{"[yes/no]".cyan}} ');
  dryRun = prompt() !== 'no';

  if (dryRun) {
    write('What would you like the old version to be? (default: {{oldVersion.cyan}}) ');
    oldVersion = prompt() || oldVersion;
    build();
  } else if (validate()) {
    build();
  }

  function build () {
    newVersion = getNewVersion();

    line();

    checkoutVersionBranch();
    updateVersion();
    createChangelog();
    commitChanges();
    tagRelease();
    cloneRepo('bower-material');
    updateBowerVersion();
    cloneRepo('code.material.angularjs.org');
    updateSite();
    updateMaster();
    writeScript('abort', abortCmds.concat(cleanupCmds));
    if (!dryRun) writeScript('push', pushCmds.concat(cleanupCmds));

    line();
    log('Your repo is ready to be pushed.');
    log('Please look over {{"CHANGELOG.md".cyan}} and make any changes.');
    log('When you are ready, please run "{{"./push".cyan}}" to finish the process.');
    log('If you would like to cancel this release, please run "./abort"');
  }

  //-- utility methods

  function validate () {
    if (exec('npm whoami') !== 'angularcore') {
      err('You must be authenticated with npm as "angularcore" to perform a release.');
    } else if (exec('git rev-parse --abbrev-ref HEAD') !== 'staging') {
      err('Releases can only performed from "staging" at this time.');
    } else {
      return true;
    }
    function err (msg) {
      var str = 'Error: ' + msg;
      log(str.red);
    }
  }

  function checkoutVersionBranch () {
    exec('git checkout -q -b release/{{newVersion}}');
    abortCmds.push('git branch -D release/{{newVersion}}');
  }

  function updateVersion () {
    start('Updating {{"package.json".cyan}} version from {{oldVersion.cyan}} to {{newVersion.cyan}}...');
    pkg.version = newVersion;
    fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
    done();
    abortCmds.push('git checkout package.json');
    pushCmds.push('git add package.json');
  }

  function createChangelog () {
    start('Generating changelog from {{oldVersion.cyan}} to {{newVersion.cyan}}...');
    exec([
           'git fetch --tags',
           'git checkout v{{lastMajorVer}} -- CHANGELOG.md',
           'gulp changelog --sha=$(git merge-base v{{lastMajorVer}} HEAD)'
         ]);
    done();
    abortCmds.push('git checkout CHANGELOG.md');
    pushCmds.push('git add CHANGELOG.md');
  }

  function clear () {
    write("\u001b[2J\u001b[0;0H");
  }

  function getNewVersion () {
    header();
    var options = getVersionOptions(oldVersion), key, type, version;
    log('The current version is {{oldVersion.cyan}}.');
    log('');
    log('What should the next version be?');
    for (key in options) { log((+key + 1) + ') ' + options[ key ].cyan); }
    log('');
    write('Please select a new version: ');
    type = prompt();

    if (options[ type - 1 ]) version = options[ type - 1 ];
    else if (type.match(/^\d+\.\d+\.\d+(-rc\d+)?$/)) version = type;
    else throw new Error('Your entry was invalid.');

    log('');
    log('The new version will be ' + version.cyan + '.');
    write('Is this correct? {{"[yes/no]".cyan}} ');
    return prompt() === 'yes' ? version : getNewVersion();

    function getVersionOptions (version) {
      return version.match(/-rc\d+$/)
          ? [ increment(version, 'rc'),
        increment(version, 'minor') ]
          : [ increment(version, 'patch'),
        increment(version, 'minor'),
        increment(version, 'major') ].map(addRC);

      function increment (versionString, type) {
        var version = parseVersion(versionString);
        if (version.rc) {
          switch (type) {
            case 'minor':
              version.rc = 0;
              break;
            case 'rc':
              version.rc++;
              break;
          }
        } else {
          version[ type ]++;
          //-- reset any version numbers lower than the one changed
          switch (type) {
            case 'major':
              version.minor = 0;
            case 'minor':
              version.patch = 0;
            case 'patch':
              version.rc = 0;
          }
        }
        return getVersionString(version);

        function parseVersion (version) {
          var parts = version.split(/\.|\-rc/g);
          return {
            string: version,
            major:  parts[ 0 ],
            minor:  parts[ 1 ],
            patch:  parts[ 2 ],
            rc:     parts[ 3 ] || 0
          };
        }

        function getVersionString (version) {
          var str = version.major + '.' + version.minor + '.' + version.patch;
          if (version.rc) str += '-rc' + version.rc;
          return str;
        }
      }

      function addRC (str) {
        return str + '-rc1';
      }
    }
  }

  function tagRelease () {
    pushCmds.push(
        'git tag v{{newVersion}}',
        'git push {{origin}} HEAD',
        'git push --tags'
    );
  }

  function commitChanges () {
    start('Committing changes...');
    exec('git commit -am "release: version {{newVersion}}"');
    done();
    pushCmds.push('git commit --amend --no-edit');
  }

  function cloneRepo (repo) {
    start('Cloning ' + repo.cyan + ' from Github...');
    exec('rm -rf ' + repo);
    exec('git clone https://github.com/angular/' + repo + '.git --depth=1');
    done();
    cleanupCmds.push('rm -rf ' + repo);
  }

  function fill (str) {
    return str.replace(/\{\{[^\}]+\}\}/g, function (match) {
      return eval(match.substr(2, match.length - 4));
    });
  }

  function writeScript (name, cmds) {
    fs.writeFileSync(name, '#!/usr/bin/env bash\n\n' + fill(cmds.join('\n')));
    exec('chmod +x ' + name);
  }

  function updateBowerVersion () {
    start('Updating bower version...');
    var options = { cwd: './bower-material' },
        bower   = require(options.cwd + '/bower.json'),
        pkg     = require(options.cwd + '/package.json');
    //-- update versions in config files
    bower.version = pkg.version = newVersion;
    fs.writeFileSync(options.cwd + '/package.json', JSON.stringify(pkg, null, 2));
    fs.writeFileSync(options.cwd + '/bower.json', JSON.stringify(bower, null, 2));
    done();
    start('Building bower files...');
    //-- build files for bower
    exec([
           'rm -rf dist',
           'gulp build',
           'gulp build-all-modules --mode=default',
           'gulp build-all-modules --mode=closure',
           'rm -rf dist/demos',
         ]);
    done();
    start('Copy files into bower repo...');
    //-- copy files over to bower repo
    exec([
           'cp -Rf ../dist/* ./',
           'git add -A',
           'git commit -m "release: version {{newVersion}}"',
           'rm -rf ../dist'
         ], options);
    done();
    //-- add steps to push script
    pushCmds.push(
        comment('push to bower (master and tag) and publish to npm'),
        'cd ' + options.cwd,
        'cp ../CHANGELOG.md .',
        'git add CHANGELOG.md',
        'git commit --amend --no-edit',
        'git tag -f v{{newVersion}}',
        'git pull --rebase',
        'git push',
        'git push --tags',
        ( newVersion.indexOf('rc') < 0 ? 'npm publish' : '# skipped npm publish due to RC version' ),
        'cd ..'
    );
  }

  function updateSite () {
    start('Adding new version of the docs site...');
    var options = { cwd: './code.material.angularjs.org' };
    writeDocsJson();

    //-- build files for bower
    exec([
           'rm -rf dist',
           'gulp docs',
           'sed -i \'\' \'s,http:\\/\\/localhost:8080\\/angular-material,https:\\/\\/cdn.gitcdn.xyz/cdn/angular/bower-material/v{{newVersion}}/angular-material,g\' dist/docs/docs.js',
           'sed -i \'\' \'s,base\ href=\\",base\ href=\\"/{{newVersion}},g\' dist/docs/index.html'
         ]);

    //-- copy files over to site repo
    exec([
           'rm -rf ./*-rc*',
           'cp -Rf ../dist/docs {{newVersion}}',
           'rm -rf latest && cp -Rf ../dist/docs latest',
           'git add -A',
           'git commit -m "release: version {{newVersion}}"',
           'rm -rf ../dist'
         ], options);

    //-- update firebase.json file
    writeFirebaseJson();
    exec([ 'git commit --amend --no-edit -a' ]);
    done();

    //-- add steps to push script
    pushCmds.push(
        comment('push the site'),
        'cd ' + options.cwd,
        'git pull --rebase --strategy=ours',
        'git push',
        'cd ..'
    );

    function writeFirebaseJson () {
      fs.writeFileSync(options.cwd + '/firebase.json', getFirebaseJson());
      function getFirebaseJson () {
        var json      = require(options.cwd + '/firebase.json');
        json.rewrites = json.rewrites || [];
        switch (json.rewrites.length) {
          case 0:
            json.rewrites.push(getRewrite('HEAD'));
          case 1:
            json.rewrites.push(getRewrite('latest'));
          default:
            json.rewrites.push(getRewrite(newVersion));
        }
        return JSON.stringify(json, null, 2);
        function getRewrite (str) {
          return {
            source:      '/' + str + '/**/!(*.@(js|html|css|json|svg|png|jpg|jpeg))',
            destination: '/' + str + '/index.html'
          };
        }
      }
    }

    function writeDocsJson () {
      var config      = require(options.cwd + '/docs.json');
      config.versions = config.versions.filter(function (version) {
        return version.indexOf('rc') < 0;
      });
      config.versions.unshift(newVersion);

      //-- only set to default if not a release candidate
      config.latest = newVersion;
      fs.writeFileSync(options.cwd + '/docs.json', JSON.stringify(config, null, 2));
    }
  }

  function updateMaster () {
    pushCmds.push(
        comment('update package.json in master'),
        'git co master',
        'git pull --rebase {{origin}} master',
        'git checkout release/{{newVersion}} -- CHANGELOG.md',
        'node -e "' + stringifyFunction(buildCommand) + '"',
        'git add CHANGELOG.md',
        'git add package.json',
        'git commit -m "update version number in package.json to {{newVersion}}"',
        'git push'
    );
    function buildCommand () {
      require('fs').writeFileSync('package.json', JSON.stringify(getUpdatedJson(), null, 2));
      function getUpdatedJson () {
        var json     = require('./package.json');
        json.version = '{{newVersion}}';
        return json;
      }
    }

    function stringifyFunction (method) {
      return method
          .toString()
          .split('\n')
          .slice(1, -1)
          .map(function (line) { return line.trim(); })
          .join(' ')
          .replace(/"/g, '\\"');
    }
  }

  function header () {
    clear();
    line();
    log(center('Angular Material Release'));
    line();
  }

  function center (msg) {
    msg        = ' ' + msg.trim() + ' ';
    var length = msg.length;
    var spaces = Math.floor((lineWidth - length) / 2);
    return Array(spaces + 1).join('-') + msg.green + Array(lineWidth - msg.length - spaces + 1).join('-');
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
      for (var key in userOptions) options[ key ] = userOptions[ key ];
      return child_process.execSync(fill(cmd) + ' 2> /dev/null', options).trim();
    } catch (err) {
      return err;
    }
  }

  function comment (msg) {
    return '\n# ' + msg + '\n';
  }

  function start (msg) {
    var parsedMsg = fill(msg),
        msgLength = strip(parsedMsg).length,
        diff      = lineWidth - 4 - msgLength;
    write(parsedMsg + Array(diff + 1).join(' '));
  }

  function log (msg) {
    msg = msg || '';
    console.log(fill(msg));
  }

  function write (msg) {
    process.stdout.write(fill(msg));
  }

  function line () {
    log(Array(lineWidth + 1).join('-'));
  }
})();
