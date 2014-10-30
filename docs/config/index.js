var _ = require('lodash');
var path = require('canonical-path');
var buildConfig = require('../../config/build.config');

var projectPath = path.resolve(__dirname, '../..');
var packagePath = __dirname;

var Package = require('dgeni').Package;

module.exports = new Package('angular-md', [
  require('dgeni-packages/ngdoc'),
  require('dgeni-packages/nunjucks')
])

.processor(require('./processors/componentsData'))
.processor(require('./processors/indexPage'))
.processor(require('./processors/buildConfig'))
.processor(require('./processors/content'))

.config(function(log, templateEngine, templateFinder) {

  templateFinder.templateFolders = [
    path.resolve(packagePath, 'template'),
    path.resolve(packagePath, 'template/ngdoc'),
    path.resolve(packagePath, '../app-template')
  ];
})

.config(function(readFilesProcessor, writeFilesProcessor) {
  readFilesProcessor.basePath = projectPath;
  readFilesProcessor.sourceFiles = [
    { include: 'dist/angular-material.js', basePath: 'dist' },
    { include: 'docs/content/**/*.md', basePath: 'docs/content', fileReader: 'ngdocFileReader' }
  ];

  writeFilesProcessor.outputFolder = 'dist/docs';
})


.config(function(computeIdsProcessor, computePathsProcessor) {

  computeIdsProcessor.idTemplates.push({
    docTypes: ['content'],
    idTemplate: 'content-${fileInfo.relativePath.replace("/","-")}',
    getAliases: function(doc) { return [doc.id]; }
  });

  computePathsProcessor.pathTemplates.push({
    docTypes: ['content'],
    getPath: function(doc) {
      var docPath = path.dirname(doc.fileInfo.relativePath);
      if ( doc.fileInfo.baseName !== 'index' ) {
        docPath = path.join(docPath, doc.fileInfo.baseName);
      }
      return docPath;
    },
    getOutputPath: function(doc) {
      return path.join(
        'partials',
        path.dirname(doc.fileInfo.relativePath),
        doc.fileInfo.baseName) + '.html';
    }
  });
})

.config(function(generateComponentGroupsProcessor) {
  generateComponentGroupsProcessor.$enabled = false;
});
