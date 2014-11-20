var _ = require('lodash');

module.exports = function contentProcessor(templateFinder) {
  return {
    $runAfter: ['paths-computed'],
    $runBefore: ['rendering-docs'],
    $process: function(docs) {
      var contentDocs = _(docs)
      .filter(function(doc) {
        return doc.docType === 'content';
      })
      .groupBy('area')
      .mapValues(function(areaDocs) {
        return _.map(areaDocs, function(areaDoc) {
          return {
            name: areaDoc.name,
            outputPath: areaDoc.outputPath,
            url: '/' + areaDoc.path,
            label: areaDoc.label || areaDoc.name
          };
        });
      }).
      value();

      docs.push({
        name: 'PAGES',
        template: 'constant-data.template.js',
        outputPath: 'js/content-data.js',
        items: contentDocs
      });
    }
  };
};
