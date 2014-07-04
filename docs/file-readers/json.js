var path = require('canonical-path');
var _ = require('lodash');
var glob = require('glob');
var fs = require('fs');

module.exports = {
  pattern: /module.json$/,
  processFile: function(filePath, contents, basePath) {
    var json = JSON.parse(contents);
    var jsonDir = path.dirname(filePath);
    
    if (!json.module) {
      throw new Error("paper.json has no `module` field!");
    }

    json = _.assign({
      js: ['*.js', '!*.spec.js'],
      scss: ['*.scss'],
      readme: ['*.md'],
      demos: {}
    }, json);

    var sources = _([].concat(json.js, json.scss, json.readme))
      .map(getFilenamesForGlob)
      .flatten()
      .map(fileToDoc)
      .each(function(doc) {
        doc.type = 'source';
      })
      .value();

    var demos = _(json.demos)
      .map(function(demo, demoId) {
        //[].concat makes sure demoFiles is always an array
        return _([].concat(demo.files))
         .map(getFilenamesForGlob)
         .flatten()
         .map(fileToDoc)
         .each(function(doc) {
           doc.type = 'demo';
           doc.id = demoId;
           doc.name = demo.name;
         })
         .value();
      })
      .flatten()
      .value();

    return sources.concat(demos);

    function getFilenamesForGlob(pattern) {
      return glob.sync(pattern, { cwd: jsonDir })
        .map(function(filename) {
          return path.join(jsonDir, filename);
        })
        .filter(function(fullPath) {
          return fs.statSync(fullPath).isFile();
        });
    }
    function fileToDoc(fullPath) {
      return {
        fileType: path.extname(fullPath).substring(1),
        file: fullPath,
        content: fs.readFileSync(fullPath).toString(),
        componentId: json.module,
        componentName: json.name,
        basePath: path.basename(fullPath),
      };
    }
  }
};
