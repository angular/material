var _ = require('lodash');

// We don't need to publish all of a doc's data to the app, that will
// add many kilobytes of loading overhead.
function publicDocData(doc, extraData) {
  doc = doc || {};
  return _.assign({
    name: doc.name,
    type: doc.docType,
    outputPath: doc.outputPath,
    url: doc.path,
    label: doc.label || doc.name
  }, extraData || {});
}

module.exports = function componentsGenerateProcessor(log, moduleMap) {
  return {
    $runAfter: ['paths-computed'],
    $runBefore: ['rendering-docs'],
    $process: process
  };

  function process(docs) {

    
    // We are only interested in pages that are not landing pages
    var pages = _.filter(docs, function(page) {
      return page.docType != 'componentGroup';
    });

    var components = _(pages)
      .filter('module') // We are not interested in docs that are not in a module
      .groupBy('module')
      .map(function(moduleDocs, moduleName) {

        var moduleDoc = _.find(docs, {
          docType: 'module',
          name: moduleName
        });
        if (!moduleDoc) return;

        return publicDocData(moduleDoc, {
          docs: _(moduleDocs)
            .filter(function(doc) {
              return doc.docType !== 'module';
            })
            .sortBy(function(doc) {
              return typeof doc.order === 'number' ? doc.order : doc.docType;
            })
            .map(publicDocData)
            .value()
        });

      })
      .filter() //remove null items
      .value();

    docs.push({
      template: 'components-data.template.js',
      outputPath: 'js/components-data.js',
      components: components
    });

  }
};

