// INPUT = $1 = VERSION
//  (something like 1.3 or 1.4.5)

// OUTPUT = a specific version number 
//  (something like 1.3.19 or 1.5.0-beta.2)

// this is used so that we can run a `git`
// command which is required to parse the
// collection of tags so that we can figure out
// the max version for the provided branch value
var exec = require('child_process').exec;

// this is the provided input value which could
// be a general branch like `1.3` or a specific
// version like `1.4.6`.
var version = process.argv[2];
if (!version) return;

exec("git --git-dir ./tmp/angular.js/.git tag", function(error, output) {
  var v = findMaxVersion(version, output);
  if (v) {
    // drop the `v` prefix from the version
    // `v1.3.5` => `1.3.5`
    //
    // this will relay the version number over
    // to the build script that used this
    console.log(v.substr(1));
  }
});

function findMaxVersion(branch, output) {
  var lines;
  var highestVersion;
  var majorBranch;

  // these weights are used to figure out which
  // releases are more important than others
  // (e.g. 1.3.0 > 1.3.0.beta.2)
  var WEIGHTS = {
    'beta': 10,
    'rc': 1000,
    'stable': 1000000
  };

  // this happens if the user provides a specific
  // version like `1.3.5` or `1.5.0-beta.2` instead
  // of a general branch like `1.3` or `1.5`.
  if (branch.match(/\./g).length > 1) {
    lines = ['v' + branch];
    majorBranch = branch.match(/^\d+\.\d+/)[0];
  } else {
    majorBranch = branch;
    lines = output.split("\n");
  }

  var versionRegex = new RegExp('^v' + majorBranch + '.(\\d+)(?:-(beta|rc).(\\d+))?');

  for (var i = lines.length - 1; i >= 0; i--) {
    var line = lines[i];
    var result = line.match(versionRegex);
    if (result && result.length > 0) {
      // stable releases have a higher weight than beta/RC versions
      // so we want to include 
      var weight = result[1] * WEIGHTS.stable;

      if (result[2]) {
        // something like "1.3.0-beta.2" will have a weight
        // of 20 while "1.3.0-rc.2" will have a weight of
        // 2000 while "1.3.2" will have a weight of 2000000
        // (which is calculated a few lines above here).
        // we add "1" to the end incase we match something
        // like "beta.0"
        //
        // so 1.3.0-beta.0 => 10 and 1.3.0-rc.0 => 1000
        var multiplier = WEIGHTS[result[2]];
        weight += multiplier * (result[3] + 1);
      } else {
        // this adds an extra 1 as well so that
        // 1.3.0 => 1000000
        weight += WEIGHTS.stable;
      }

      if (!highestVersion || highestVersion.weight < weight) {
        highestVersion = { version: line, weight: weight };
      }
    }
  }

  // in the event that we don't figure out a version
  // due to mismatched branches/tags we should not
  // return anything. The build scripts will detect
  // this and set a failing exit code.
  return highestVersion && highestVersion.version;
}
