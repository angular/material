var _ = require('lodash');
var path = require('canonical-path');

var sourceTypeByExtension = {
  html: 'HTML',
  css: 'CSS',
  js: 'JavaScript',
  'tmpl.html': 'Template'
};

module.exports = {
  name: 'components-generate',
  description: 'Transform the components into a renderable data structure',
  runAfter: ['api-docs'],
  runBefore: ['render-docs'],
  process: function(docs, config, otherDocs) {
    var options = config.get('processing.componentsGenerate', {});
    var repositoryUrl = config.get('source.repository');
    var projectPath = config.get('source.projectPath');

    var componentOutputFolder = options.componentOutputFolder;
    var docOutputFolder = path.join(componentOutputFolder, options.docSubFolder);

    var components = [];
    var renderedDocs = [];

    docs = docs.concat(otherDocs);

    var processors = {
      demo: processDemos,
      readme: processDocs,
      directive: processDocs,
      service: processDocs,
      object: processDocs
    };

    _(docs)
      .groupBy('componentId')
      .each(function(componentDocs, componentId) {
        var component = {
          id: componentId,
          name: componentDocs[0].componentName,
          docs: []
        };

        if (!_.find(componentDocs, { docType: 'demo' })) {
          return;
        }
        _(componentDocs)
          .omit({ docType: 'module' })
          .groupBy('docType')
          .each(function(docs, docType) {
            if (processors[docType]) {
              processors[docType](component, docType, docs);
            }
          });

        component.docs = component.docs
          .sort(function(a, b) {
            var orderA = a.hasOwnProperty('order') ? a.order : 999;
            var orderB = b.hasOwnProperty('order') ? b.order : 999;
            return orderA > orderB ? -1 : 1;
          })
          .sort(function(doc) {
            //Readme first
            return doc.docType === 'readme' ? -1 : 1;
          });

        component.template = 'component.template.html';
        component.outputPath = path.join(
          _.template(componentOutputFolder, { component: component }),
          'index.html'
        );

        renderedDocs.push(component);
        components.push(component);
      });

    renderedDocs.push({
      template: 'components-data.template.js',
      outputPath: 'js/components-data.js',
      components: components
    });

    return renderedDocs;

    function processDemos(component, docType, demoDocs) {
      component.demos = _(demoDocs)
        .groupBy('id')
        .map(function(demoDocs, demoId) {
          var demo = {};
          demo.id = demoId;
          demo.name = demoDocs[0].name;
          demo.docType = 'demo';

          var outputFolder = _.template(docOutputFolder, {
            component: component, doc: demo
          });
          
          var indexDoc = _(demoDocs)
            .remove({ basePath: 'index.html' })
            .first();

          demo.files = _.map(demoDocs, generateDemoFile);
          demo.indexFile = generateDemoFile(indexDoc);
          demo.indexFile.js = _.filter(demo.files, { fileType: 'js' });
          demo.indexFile.css = _.filter(demo.files, { fileType: 'css' });

          renderedDocs = renderedDocs
            .concat(demo.indexFile)
            .concat(demo.files);

          return demo;

          function generateDemoFile(fromDoc) {
            var extension = fromDoc.basePath.match(/.tmpl.html$/) ?
              'tmpl.html' :
              path.extname(fromDoc.basePath).substring(1); //remove starting '.'

            return _.assign({}, fromDoc, {
              template: fromDoc.basePath === 'index.html' ? 
                'demo/template.index.html' :
                'demo/template.file',
              outputPath: path.join(outputFolder, fromDoc.basePath),
              viewType : sourceTypeByExtension[extension]
            });
          }
        })
        .value();
    }

    function processDocs(component, docType, docs) {
      _(docs)
        .filter(function(doc) {
          return !doc.hasOwnProperty('private');
        })
        .map(function(doc) {
          return _.pick(doc, [
            'description',
            'kind',
            'content',
            'componentId',
            'componentName',
            'docType',
            'name',
            'params',
            'description',
            'restrict',
            'element',
            'priority',
            'usage',
            'returns',
            'order',
          ]);
        })
        .each(function(doc) {
          doc.demoOnly = false;

          if (doc.docType === 'directive') {
            //dash-case for directives
            doc.humanName = doc.name.replace(/([A-Z])/g, function($1) {
              return '-'+$1.toLowerCase();
            }); 
            if (doc.restrict.element) {
              doc.humanName = '<' + doc.humanName + '>';
            } else if (doc.restrict.attribute) {
              doc.humanName = doc.humanName;
            }
          } else if (doc.docType === 'readme') {
            doc.content = doc.content.replace(/<code>/g, '<code ng-non-bindable>');
            doc.humanName = 'Overview';
            doc.demoOnly = (doc.content.length < 30);
          } else {
            doc.humanName = doc.name;
          }

          doc.outputPath = path.join(
            _.template(docOutputFolder, {
              component: component, doc: doc
            }),
            'index.html'
          );
          renderedDocs.push(doc);
          component.docs.push(doc);
        })
        .value();
    }
  }
};

