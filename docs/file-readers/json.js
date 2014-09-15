var path = require('canonical-path');
var _ = require('lodash');
var glob = require('glob');
var fs = require('fs');
var ngModuleData = require('../util/ngModuleData');

module.exports = {
  pattern: /module.json$/,
  processFile: function(filePath, contents, basePath) {
    var json = JSON.parse(contents);
    var jsonDir = path.dirname(filePath);
    
    if (!json.module) {
      throw new Error("module.json has no `module` field!");
    }

    json = _.assign({
      js: ['*.js'],
      scss: ['*.scss'],
      readme: ['*.md', '*.MD'],
      demos: {}
    }, json);

    //[].concat to coerce it to an array if it's not
    var sources = getDocsForPatterns(['!*.spec.js'].concat(json.js));
    sources.forEach(function(doc) {
      var moduleData = ngModuleData(doc.content);
      doc.dependencies = (doc.dependencies || []).concat(moduleData.dependencies);
      doc.docType = 'source';
    });

    var readmes = getDocsForPatterns([].concat(json.readme));
    readmes.forEach(function(doc) {
      doc.docType = 'readme';
      doc.name = 'overview';
    });

    var demos = _(json.demos)
      .map(function(demo, demoId) {
        return _(getDocsForPatterns([].concat(demo.files)))
          .flatten()
          .forEach(function(doc) {
           doc.docType = 'demo';
           doc.id = demoId;
           doc.name = demo.name;
           if (doc.fileType == 'js') {
             doc.module = ngModuleData(doc.content).module;
             if (!doc.module) {
               //Unknown fix for an unknown bug: the first time, ngModuleData
               //won't read correctly. Second time, it will.
               // TODO(ajoslin): find cause and properly fix.
               doc.module = ngModuleData(doc.content).module;
             }
           }
          })
          .value();
      })
      .flatten()
      .value();

    return sources.concat(demos).concat(readmes);

    function getDocsForPatterns(patterns) {
      var negatedFiles = _(patterns)
        .remove(function(pattern) {
          return pattern.charAt(0) === '!';
        })
        .map(function(pattern) {
          return pattern.substring(1); //remove '!"
        })
        .flatten()
        .map(getFilenamesForGlob)
        .value();

      return _(patterns)
        .map(getFilenamesForGlob)
        .flatten()
        .filter(function(file) {
          return negatedFiles.indexOf(file) === -1;
        })
        .map(fileToDoc)
        .value();
    }

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
