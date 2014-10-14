// Regex adapted from https://github.com/ceymard/gulp-ngcompile

module.exports = function processContent(fileContent) {
  var NG_MODULE_REGEX = /\.module\(('[^']*'|"[^"]*")\s*,(?:\s*\[([^\]]+)\])?/g;
  var match = NG_MODULE_REGEX.exec(fileContent || '');
  var module = match && match[1] && match[1].slice(1, -1); //remove quotes
  var depsMatch = match && match[2] && match[2].trim();
  
  var dependencies = [];
  if (depsMatch) {
    dependencies = depsMatch.split(/\s*,\s*/).map(function(dep) {
      dep = dep.slice(1, -1); //remove quotes
      return dep;
    });
  }

  return {
    module: module || '',
    dependencies: dependencies
  };
};
