var _ = require('lodash');
var path = require('canonical-path');
var buildConfig = require('../config/build.config');

var projectPath = path.resolve(__dirname, '..');
var packagePath = __dirname;

module.exports = function(config) {

  require('dgeni-packages/ngdoc')(config);

  config.merge('rendering.nunjucks.config.tags', {
    variableStart: '{$',
    variableEnd: '$}',
    blockStart: '{%',
    blockEnd: '%}'
  });

  config.set('buildConfig', buildConfig);

  config.set('rendering.outputFolder', path.join(projectPath, buildConfig.docsDist));
  config.set('rendering.contentsFolder', path.join(config.rendering.outputFolder, 'generated'));

  config.set('rendering.templateFolders', [
    path.resolve(packagePath, 'templates'),
    path.resolve(packagePath, 'templates/ngdoc'),
    path.resolve(packagePath, 'templates/ngdoc/api'),
    path.resolve(packagePath, 'templates/ngdoc/lib'),
  ]);

  config.append('processing.tagDefinitions', require('./tag-defs'));

  config.set('processing.componentsGenerate', {
    componentOutputFolder: 'generated/${component.id}',
    docSubFolder: '${doc.docType}/${doc.id || doc.name}'
  });

  config.set('basePath', projectPath);
  config.set('logging.level', 'info');

  config.set('source.fileReaders', [
    require('./file-readers/json')
  ]);
  config.set('source.projectPath', projectPath);
  config.set('source.repository', buildConfig.repository);
  config.set('source.files', ['src/components/*/module.json']);

  config.append('processing.processors', [
    require('./processors/jsdoc'),
    require('./processors/components-generate'),
  ]);

  //Remove some of the default ngdoc processors, we won't use them
  _(config.get('processing.processors'))
    .remove(require('dgeni-packages/ngdoc/processors/component-groups-generate'))
    .remove(require('dgeni-packages/ngdoc/processors/compute-path'));

  return config;
};
