const _ = require('lodash');
const buildConfig = require('../../../config/build.config.js');

// We don't need to publish all of a doc's data to the app, that will
// add many kilobytes of loading overhead.
function publicDocData(doc, extraData) {
  const options = _.assign(extraData || {}, { hasDemo: (doc.docType === 'directive') });

  // This RegEx always retrieves the last source descriptor.
  // For example it retrieves from `/opt/material/src/core/services/ripple/ripple.js` the following
  // source descriptor: `src/core/`.
  // This is needed because components are not only located in `src/components`.
  let descriptor = doc.fileInfo.filePath.toString().match(/src\/.*?\//g).pop();
  if (descriptor) {
    descriptor = descriptor.substring(descriptor.indexOf('/') + 1, descriptor.lastIndexOf('/'));
  }

  return buildDocData(doc, options, descriptor || 'components');
}

function coreServiceData(doc, extraData) {
  const options = _.assign(extraData || {}, { hasDemo: false });
  return buildDocData(doc, options, 'core');
}

function buildDocData(doc, extraData, descriptor) {

  const module = 'material.' + descriptor;
  const githubBaseUrl = buildConfig.repository + '/blob/master/src/' + descriptor + '/';

  const basePathFromProjectRoot = 'src/' + descriptor + '/';
  const filePath = doc.fileInfo.filePath;
  const indexOfBasePath = filePath.indexOf(basePathFromProjectRoot);
  const path = filePath.substr(indexOfBasePath + basePathFromProjectRoot.length, filePath.length);

  return _.assign({
    name: doc.name,
    type: doc.docType,
    restrict: doc.restrict,
    outputPath: doc.outputPath,
    url: doc.path,
    label: doc.label || doc.name,
    module: module,
    githubUrl: githubBaseUrl + path
  }, extraData);
}

module.exports = function componentsGenerateProcessor() {
  return {
    $runAfter: ['paths-computed'],
    $runBefore: ['rendering-docs'],
    $process: process
  };

  function process(docs) {

    const components = _(docs)
      .filter(function(doc) {
        // We are not interested in docs that are not in a module
        // We are only interested in pages that are not landing pages
        return doc.docType !== 'componentGroup' && doc.module;
      })
      .filter('module')
      .groupBy('module')
      .map(function(moduleDocs, moduleName) {

        const moduleDoc = _.find(docs, {
          docType: 'module',
          name: moduleName
        });
        if (!moduleDoc) return undefined;

        return publicDocData(moduleDoc, {
          docs: moduleDocs
            .filter(function(doc) {
              // Private isn't set to true, just to an empty string if @private is supplied
              return doc.docType !== 'module';
            })
            .map(publicDocData)
        });

      })
      .filter() // remove null items
      .value();

    const EXPOSED_CORE_SERVICES = '$mdMedia';

    const services = _(docs).filter(function(doc) {
      return doc.docType === 'service' &&
        doc.module === 'material.core' &&
        EXPOSED_CORE_SERVICES.indexOf(doc.name) !== -1;
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
