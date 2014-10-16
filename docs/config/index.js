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

.config(function(log, templateEngine, templateFinder) {

  templateEngine.config.tags = {
    variableStart: '{$',
    variableEnd: '$}',
    blockStart: '{%',
    blockEnd: '%}'
  };

  templateFinder.templateFolders = [
    path.resolve(packagePath, 'template'),
    path.resolve(packagePath, 'template/ngdoc'),
    path.resolve(packagePath, '../app-template')
  ];
})

.config(function(readFilesProcessor, writeFilesProcessor, checkAnchorLinksProcessor) {
  readFilesProcessor.basePath = path.join(projectPath, 'dist');
  readFilesProcessor.sourceFiles = ['angular-material.js'];

  writeFilesProcessor.outputFolder = path.join(projectPath, 'dist/docs');

  // Don't use checkAnchorLinksProcessor
  checkAnchorLinksProcessor.checkDoc = function() { return false; };
})

;
