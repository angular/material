var _ = require('lodash');
var path = require('canonical-path');
var buildConfig = require('../config/build.config');

var projectPath = path.resolve(__dirname, '..');
var packagePath = __dirname;

module.exports = function(config) {

  require('dgeni-packages/base')(config);
  require('dgeni-packages/nunjucks')(config);

  config.merge('rendering.nunjucks.config.tags', {
    variableStart: '{$',
    variableEnd: '$}',
    blockStart: '{%',
    blockEnd: '%}'
  });

  config.set('rendering.outputFolder', path.join(projectPath, buildConfig.docsDist));
  config.set('rendering.templateFolders', [
    path.resolve(packagePath, 'templates')
  ]);
  config.set('rendering.templatePatterns', [
    '${ doc.template }'
  ]);

  config.set('processing.componentsGenerate', {
    outputFolder: 'components/${component.id}',
    demoOutputFolder: 'components/${component.id}/${demo.id}'
  });

  config.set('basePath', projectPath);
  config.set('logging.level', 'info');

  config.set('source.fileReaders', [
    require('./file-readers/json'),
    // require('dgeni-packages/jsdoc/file-readers/jsdoc'),
    // require('./file-readers/any')
  ]);
  config.set('source.projectPath', projectPath);
  config.set('source.repository', buildConfig.repository);
  config.set('source.files', ['src/components/*/module.json']);

  //Used by dgeni-packages/examples package
  config.set('processing.examples', {
    outputFolder: 'demos',
    templateFolder: 'templates/demos'
  });

  config.append('processing.processors', [
    require('./processors/components-generate')
  ]);

  return config;
};
