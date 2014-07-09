var _ = require('lodash');
var path = require('canonical-path');

module.exports = {
  name: 'components-generate',
  description: 'Transform the components into a renderable data structure',
  runAfter: ['docs-processed'],
  runBefore: ['adding-extra-docs'],
  exports: {
    components: ['value', []]
  },
  process: function(docs, config, components) { 
    var options = config.get('processing.componentsGenerate', {});
    var demoOutputFolder = options.demoOutputFolder || 'components/${component.id}/${demo.id}';
    var componentOutputFolder = options.outputFolder || 'components/${component.id}';
    var repositoryUrl = config.get('source.repository');
    var projectPath = config.get('source.projectPath');

    var generatedDocs = [];

    _(docs)
      .groupBy('componentId')
      .each(function(componentDocs, id) {
        var component = {};
        component.id = componentDocs[0].componentId;
        component.name = componentDocs[0].componentName;

        var byType = _.groupBy(componentDocs, 'type');

        var demos = {};
        _(byType.demo)
          .groupBy('id')
          .each(function(demoDocs, demoId) {
            var demo = {
              name: demoDocs[0].name,
              id: demoId,
            };
            var outputFolder = _.template(demoOutputFolder, {
              component: component, demo: demo
            });
            var indexDoc = _(demoDocs).remove({ basePath: 'index.html' }).first();

            demo.files = _.map(demoDocs, generateDemoFile);
            demo.indexFile = generateDemoFile(indexDoc);
            demo.indexFile.js = _.filter(demo.files, { fileType: 'js' });
            demo.indexFile.css = _.filter(demo.files, { fileType: 'css' });

            demos[demoId] = demo;

            generatedDocs = generatedDocs
              .concat(demo.files)
              .concat(demo.indexFile);

            function generateDemoFile(fromDoc) {
              return _.assign({
                template: fromDoc.basePath === 'index.html' ? 
                  'demo/template.index.html' :
                  'demo/template.file',
                outputPath: path.join(outputFolder, fromDoc.basePath),
              }, fromDoc);
            }
          });

        if (!_.keys(demos).length) {
          return;
        }

        var outputFolder = _.template(componentOutputFolder, { component: component });
        component.demos = demos;
        component.template = 'component.template.html';
        component.outputPath = path.join(outputFolder, 'index.html');

        var mainSource = _(byType.source)
          .filter({ fileType: 'js' })
          .omit(function(file) { return file.basePath.match(/.spec.js$/); })
          .first();

        component.repositoryUrl = repositoryUrl + '/tree/master/' + path.dirname(mainSource.file).replace(projectPath, '');

        generatedDocs.push(component);
        components.push(component);
      });

    generatedDocs.push({
      template: 'components-data.template.js',
      outputPath: 'js/components-data.js',
      components: components
    });

    return generatedDocs;

  }
};
