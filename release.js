var colors = require('colors');
var fs = require('fs');
var prompt = require('prompt-sync');
var child_process = require('child_process');
var pkg = require('./package.json');
var oldVersion = pkg.version;
var newVersion;
var abort = [ 'git checkout master', 'rm abort push' ];
var push  = [ 'rm abort push'];
var defaultOptions = { encoding: 'utf-8' };

if (validate()) {
  newVersion = getNewVersion();

  console.log('\n--------\n');

  checkoutVersionBranch();
  updateVersion();
  createChangelog();
  commitChanges();
  tagRelease();
  cloneRepo('bower-material', 2);
  updateBowerVersion();
  cloneRepo('code.material.angularjs.org', 1);
  updateSite();
  updateMaster();
  writeScript('abort', abort);
  writeScript('push', push);

  console.log('\n--------\n');
  console.log('Your repo is ready to be pushed.');
  console.log('Please look over CHANGELOG.md and make any changes.');
  console.log('When you are ready, please run "./push" to finish the process.');
  console.log('If you would like to cancel this release, please run "./abort"');
}

//-- utility methods

function validate () {
  if (exec('npm whoami') !== 'angularcore') {
    log('You must be authenticated with npm as "angularcore" to perform a release.');
  } else if (exec('git rev-parse --abbrev-ref HEAD') !== 'master') {
    log('Releases can only performed from master at this time.');
  } else if (exec('git pull -q --rebase origin master 2> /dev/null') instanceof Error) {
    log('Please make sure your local branch is synced with origin/master.');
  } else {
    return true;
  }
  function log (msg) {
    var str = 'Error: ' + msg;
    console.log(str.red);
  }
}

function checkoutVersionBranch () {
  exec(fill('git checkout -q -b release/{{newVersion}}'));
  abort.push(fill('git branch -D release/{{newVersion}}'));
}

function updateVersion () {
  process.stdout.write(fill('Updating package.json version from {{oldVersion}} to {{newVersion}}...'));
  pkg.version = newVersion;
  fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
  done();
  abort.push('git checkout package.json');
  push.push('git add package.json');
}

function createChangelog () {
  process.stdout.write(fill('Generating changelog from v{{oldVersion}} to v{{newVersion}}...'));
  var cmd = fill('gulp changelog --sha=$(git merge-base v{{oldVersion}} HEAD)');
  exec(cmd);
  done();
  abort.push('git checkout CHANGELOG.md');
  push.push('git add CHANGELOG.md');
}

function clear () {
  process.stdout.write("\u001b[2J\u001b[0;0H");
}

function getNewVersion () {
  clear();
  var options = getVersionOptions(oldVersion), key, type, version;
  console.log(fill('The current version is {{oldVersion}}.'));
  console.log('');
  console.log('What type of release is this?');
  for (key in options) { console.log((+key + 1) + ') ' + options[key]); }
  console.log('');
  process.stdout.write('Please select a new version: ');
  type = prompt();

  if (options[type - 1]) version = options[type - 1];
  else if (type.match(/^\d+\.\d+\.\d+(-rc\d+)?$/)) version = type;
  else throw new Error('Your entry was invalid.');

  if (version.indexOf('rc') < 0) {
    console.log('');
    process.stdout.write('Is this a release candidate? [yes/no] ');
    if (prompt() === 'yes') version += '-rc1';
  }

  console.log('');
  process.stdout.write('The new version will be ' + version + '.  Is this correct? [yes/no] ');
  return prompt() === 'yes' ? version : getNewVersion();

  function getVersionOptions (version) {
    return version.match(/-rc\d+$/)
        ? [ increment(version, 'rc'),
            increment(version, 'minor') ]
        : [ increment(version, 'patch'),
            increment(version, 'minor'),
            increment(version, 'major') ];

    function increment (versionString, type) {
      var version = parseVersion(versionString);
      if (version.rc) {
        switch (type) {
          case 'minor': version.rc = 0; break;
          case 'rc': version.rc++; break;
        }
      } else {
        version[type]++;
        //-- reset any version numbers lower than the one changed
        switch (type) {
          case 'major': version.minor = 0;
          case 'minor': version.patch = 0;
          case 'patch': version.rc = 0;
        }
      }
      return getVersionString(version);

      function parseVersion (version) {
        var parts = version.split(/\.|\-rc/g);
        return { string: version, major: parts[0], minor: parts[1], patch: parts[2], rc: parts[3] || 0 };
      }

      function getVersionString(version) {
        var str = version.major + '.' + version.minor + '.' + version.patch;
        if (version.rc) str += '-rc' + version.rc;
        return str;
      }
    };
  }
}

function tagRelease () {
  process.stdout.write('Tagging release...');
  exec(fill('git tag v{{newVersion}}'));
  done();
  abort.push(fill('git tag -d v{{newVersion}}'));
  push.push(
      fill('git push origin v{{newVersion}}'),
      fill('git push --set-upstream origin release/{{newVersion}}')
  );
}

function commitChanges () {
  process.stdout.write('Committing changes...');
  exec(fill('git commit -am "release: version {{newVersion}}"'));
  done();
  push.push('git commit --amend --no-edit');
}

function cloneRepo (repo, depth) {
  depth = depth || 1;
  process.stdout.write('Cloning ' + repo + ' from Github...');
  exec('git clone https://github.com/angular/' + repo + '.git --depth=' + depth + ' 2> /dev/null');
  done();
  abort.push('rm -rf ' + repo);
}

function fill(str) {
  return str.replace(/\{\{[^\}]+\}\}/g, function (match) {
    return eval(match.substr(2, match.length - 4));
  });
}

function writeScript (name, cmds) {
  fs.writeFileSync(name, cmds.join('\n'));
  exec('chmod +x ' + name);
}

function updateBowerVersion () {
  process.stdout.write('Updating bower version...');
  var options = { cwd: './bower-material' },
      bower = require(options.cwd + '/bower.json'),
      package = require(options.cwd + '/package.json');
  //-- update versions in config files
  bower.version = package.version = newVersion;
  fs.writeFileSync(options.cwd + '/package.json', JSON.stringify(package, null, 2));
  fs.writeFileSync(options.cwd + '/bower.json', JSON.stringify(bower, null, 2));
  done();
  process.stdout.write('Building bower files...');
  //-- build files for bower
  exec('rm -rf dist');
  exec('gulp build');
  exec('gulp build --mode=default');
  exec('gulp build --mode=closure');
  done();
  process.stdout.write('Copy files into bower repo...');
  //-- copy files over to bower repo
  exec('cp -Rf ../dist/* ./', options);
  exec('git add -A', options);
  exec(fill('git commit -m "release: version {{newVersion}}"'), options);
  exec(fill('git tag -f v{{newVersion}}'), options);
  exec('rm -rf dist');
  done();
  //-- add steps to push script
  push.push(
      'cd ' + options.cwd,
      'git push -q origin master',
      fill('git push -q origin v{{newVersion}}'),
      'npm publish',
      'cd ..'
  );
}

function updateSite () {
  process.stdout.write('Adding new version of the docs site...');
  var options = { cwd: './code.material.angularjs.org' },
      config  = require(options.cwd + '/docs.json');
  config.versions.unshift(newVersion);
  config.latest = newVersion;
  fs.writeFileSync(options.cwd + '/docs.json', JSON.stringify(config, null, 2));
  //-- build files for bower
  exec('rm -rf dist');
  exec('gulp docs');
  //-- copy files over to site repo
  exec('rm -rf latest', options);
  exec(fill('cp -Rf ../dist/docs {{newVersion}}'), options);
  exec(fill('cp -Rf ../dist/docs latest'), options);
  exec('git add -A', options);
  exec(fill('git commit -m "release: version {{newVersion}}"'), options);
  exec(fill('git tag -f v{{newVersion}}'), options);
  exec('rm -rf dist');
  done();
  //-- add steps to push script
  push.push(
      'cd ' + options.cwd,
      'git push -q origin master',
      fill('git push -q origin v{{newVersion}}'),
      'cd ..'
  );
}

function updateMaster () {
  push.push(
      'git co master',
      'git pull --rebase origin master',
      'node -e "' + stringifyFunction(buildCommand) + '"',
      'git add package.json',
      fill('git commit -m "update version number in package.json to {{newVersion}}"'),
      'git push origin master'
  );
  function buildCommand () {
    require('fs').writeFileSync('package.json', JSON.stringify(getUpdatedJson(), null, 2));
    function getUpdatedJson () {
      var json = require('./package.json');
      json.version = '{{newVersion}}';
      return json;
    }
  }
  function stringifyFunction (method) {
    return fill(method
        .toString()
        .split('\n')
        .slice(1, -1)
        .map(function (line) { return line.trim(); })
        .join(' ')
        .replace(/\"/g, '\\\"'));
  }
}

function done () {
  console.log('done.'.green);
}

function exec (cmd, userOptions) {
  try {
    var options = Object.create(defaultOptions);
    for (var key in userOptions) options[key] = userOptions[key];
    return child_process.execSync(cmd, options).trim();
  } catch (err) {
    return err;
  }
}
