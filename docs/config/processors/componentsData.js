var _ = require('lodash');
var buildConfig = require('../../../config/build.config.js');

// We don't need to publish all of a doc's data to the app, that will
// add many kilobytes of loading overhead.
function publicDocData(doc, extraData) {
  var options = _.assign(extraData || {}, { hasDemo: (doc.docType === 'directive') });
  return buildDocData(doc, options, 'components');
}

function coreServiceData(doc, extraData) {
  var options = _.assign(extraData || {}, { hasDemo: false });
  return buildDocData(doc, options, 'core');
}

function buildDocData(doc, extraData, descriptor) {
  var module = 'material.' + descriptor;
  var githubBaseUrl = buildConfig.repository + '/blob/master/src/' + descriptor + '/';
  var jsName = doc.module.split(module + '.').pop();

  var basePathFromProjectRoot = 'src/' + descriptor + '/';
  var filePath = doc.fileInfo.filePath;
  var indexOfBasePath = filePath.indexOf(basePathFromProjectRoot);
  var path = filePath.substr(indexOfBasePath + basePathFromProjectRoot.length, filePath.length);

  return _.assign({
    name: doc.name,
    type: doc.docType,
    outputPath: doc.outputPath,
    url: doc.path,
    label: doc.label || doc.name,
    module: module,
    githubUrl: githubBaseUrl + path
  }, extraData);
}

module.exports = function componentsGenerateProcessor(log, moduleMap) {
  return {
    $runAfter: ['paths-computed'],
    $runBefore: ['rendering-docs'],
    $process: process
  };

  function process(docs) {

    var components = _(docs)
      .filter(function(doc) {
        // We are not interested in docs that are not in a module
        // We are only interested in pages that are not landing pages
        return doc.docType !== 'componentGroup' && doc.module;
      })
      .filter('module')
      .groupBy('module')
      .map(function(moduleDocs, moduleName) {

        var moduleDoc = _.find(docs, {
          docType: 'module',
          name: moduleName
        });
        if (!moduleDoc) return;

        return publicDocData(moduleDoc, {
          docs: moduleDocs
            .filter(function(doc) {
              // Private isn't set to true, just to an empty string if @private is supplied
              return doc.docType !== 'module';
            })
            .map(publicDocData)
        });

      })
      .filter() //remove null items
      .value();

    var EXPOSED_CORE_SERVICES = '$mdMedia';

    var services = _(docs).filter(function(doc) {
      return doc.docType == 'service' &&
        doc.module == 'material.core' &&
        EXPOSED_CORE_SERVICES.indexOf(doc.name) != -1;
    }).map(coreServiceData).value();

    docs.push({
      name: 'SERVICES',
      template: 'constant-data.template.js',
      outputPath: 'js/services-data.js',
      items: services
    });

    docs.push({
      name: 'COMPONENTS',
      template: 'constant-data.template.js',
      outputPath: 'js/components-data.js',
      items: components
    });
  }
};
