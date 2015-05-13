var fs = require('fs');
var prompt = require('prompt-sync');
var child_process = require('child_process');
var pkg = require('./package.json');
var oldVersion = pkg.version;
var newVersion = getNewVersion();

//-- do stuff
checkoutVersionBranch();
updateVersion();
createChangelog();
commitChanges();
tagRelease();
cloneBower();
removeBower();

console.log('\n--------\n');
console.log('Your repo is ready to be pushed.');
console.log('Please look over CHANGELOG.md and amend-commit any changes.');

//-- utility methods
function checkoutVersionBranch () {
  child_process.execSync(fill('git co -b v{{newVersion}}'));
}

function updateVersion () {
  process.stdout.write(fill('Updating package.json version from {{oldVersion}} to {{newVersion}}...'));
  pkg.version = newVersion;
  fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
  console.log('done.');
}

function createChangelog () {
  process.stdout.write(fill('Generating changelog from v{{oldVersion}} to v{{newVersion}}...'));
  var cmd = fill('gulp changelog --sha=$(git merge-base v{{oldVersion}} HEAD)');
  child_process.execSync(cmd);
  console.log('done.');
}

function clear () {
  process.stdout.write("\u001b[2J\u001b[0;0H");
}

function getNewVersion () {
  clear();
  var options = getVersionOptions(oldVersion), key, type, version;
  console.log(fill('The current version is {{oldVersion}}.'));
  console.log('What type of release is this?');
  for (key in options) { console.log((+key + 1) + ') ' + options[key]); }
  process.stdout.write('Please select a new version: ');
  type = prompt();

  if (options[type - 1]) version = options[type - 1];
  else if (type.match(/^\d+\.\d+\.\d+(-rc\d+)?$/)) version = type;
  else throw new Error('Your entry was invalid.');

  clear();
  process.stdout.write('The new version will be ' + version + '.  Is this correct? [yes/no] ');
  return prompt() === 'yes' ? version : getNewVersion();

  function getVersionOptions (version) {
    return version.match(/-rc\d+$/)
        ? [ increment(version, 'rc'),
            increment(version, 'minor') ]
        : [ increment(version, 'rc'),
            increment(version, 'patch'),
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
  child_process.execSync(fill('git tag v{{newVersion}}'));
  console.log('done.');
}

function commitChanges () {
  process.stdout.write('Committing changes...');
  child_process.execSync(fill('git commit -am "release: version {{newVersion}}"'));
  console.log('done.');
}

function removeBower () {
  process.stdout.write('Removing bower-material...');
  child_process.execSync('rm -rf bower-material');
  console.log('done.');
}

function cloneBower () {
  process.stdout.write('Cloning bower-material from Github...');
  child_process.execSync('git clone https://github.com/angular/bower-material.git --depth=1');
  console.log('done.');
}

function fill(str) {
  return str.replace(/\{\{[^\}]+\}\}/g, function (match) {
    return eval(match.substr(2, match.length - 4));
  });
}


