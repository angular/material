var _ = require('lodash');
var path = require('canonical-path');
var ngModuleData = require('../util/ngModuleData');
var sass = require('node-sass');

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
          docs: [],
          url: '/' + componentId
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

        var readmeDoc = _.find(component.docs, { docType: 'readme' });
        component.docs.forEach(function(doc) {
          doc.readmeUrl = readmeDoc.url;
          doc.demos = components.demos;
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
      template: 'template.json',
      outputPath: path.join(config.get('basePath'), config.get('buildConfig.dist'), 'components.json'),
      content: components
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

          var moduleDoc = _.find(demoDocs, function(doc) {
            return !!doc.module;
          });

          demo.module = moduleDoc && moduleDoc.module || '';
          var files = _.map(demoDocs, generateDemoFile);
          var indexFile = generateDemoFile(indexDoc);

          // Wrap the css docs in a '.demoModule {' rule and compile with sass.
          if (demo.module) {
            _.filter(files, { fileType: 'css' })
              .forEach(function(file) {
                var moduleSelector = '.' + demo.module + ' {';
                var content = moduleSelector + '\n' + file.content + '\n}';
                file.content = sass.renderSync({
                  data: content
                });
              });
          }

          renderedDocs = renderedDocs
            .concat(indexFile)
            .concat(files);

          // No need to pass content on to the final docs app, uses up a lot 
          // of bytes
          demo.files = _.map(files, function(file) {
            return _.omit(file, ['content', 'renderedContent']);
          });
          demo.indexFile = _.omit(indexFile, ['content', 'renderedContent']);

          return demo;

          function generateDemoFile(fromDoc) {
            return _.assign({}, fromDoc, {
              template: 'demo/template.file',
              outputPath: path.join(outputFolder, fromDoc.basePath)
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
            'dependencies',
            'file',
            'startingLine',
            'paramType'
          ]);
        })
        .each(function(doc) {

          if (doc.docType === 'directive') {
            //dash-case for directives
            doc.humanName = doc.name.replace(/([A-Z])/g, function($1) {
              return '-'+$1.toLowerCase();
            }); 
          } else if (doc.docType === 'readme') {
            doc.content = doc.content.replace(/<code>/g, '<code ng-non-bindable>');
            doc.humanName = component.name;
          } else {
            doc.humanName = doc.name;
          }

          var repository = config.get('buildConfig').repository;
          doc.githubUrl = repository + '/tree/master/' +
            path.relative(config.basePath, doc.file);
          doc.githubEditUrl = repository + '/edit/master/' + 
            path.relative(config.basePath, doc.file);

          doc.url = path.join(component.url, doc.docType, doc.name);
          doc.outputPath = path.join(
            _.template(docOutputFolder, {
              component: component, doc: doc
            }),
            'index.html'
          );
          renderedDocs.push(doc);
          
          component.docs.push(_.omit(doc, ['content', 'renderedContent']));
        })
        .value();
    }
  }
};

