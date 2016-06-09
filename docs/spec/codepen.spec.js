describe('CodepenDataAdapter', function() {

  var codepenDataAdapter, demo, data, externalScripts;
  beforeEach(module('docsApp'));

  beforeEach(inject(function(_codepenDataAdapter_) {
    codepenDataAdapter = _codepenDataAdapter_;
  }));

  beforeEach(function() {
    externalScripts = [
      'http://some-url-to-external-js-files-required-for-codepen'
    ];

    demo = {
      id: 'spec-demo',
      title: 'demo-title',
      module: 'demo-module',
      files: {
        index: {
          contents: '<div></div>'
        },
        html: [],
        css: [
          { contents: '.fake-class { color: red }' }
        ],
        js: [
          { contents: 'angular.module("SomeOtherModule", ["Dependency1"]);' }
        ]
      }
    }
  });

  describe('#translate', function() {

    describe('the most common usage', function() {
      beforeEach(function() {
        data = codepenDataAdapter.translate(demo, externalScripts);
      });

      it('provides the title of the codepen', function() {
        expect(data.title).toBe(demo.title);
      });

      it('includes the core angular css', function() {

        // NOTE: the release script replaces this localhost reference with
        // 'https://gitcdn.link/repo/angular/bower-material/master/angular-material.css'

        expect(data.css_external).toBe('http://localhost:8080/angular-material.css');
      });

      it('includes the external js files, including the asset cache required to serve svgs to codepen', function() {

        var expected = [
          'http://some-url-to-external-js-files-required-for-codepen',
          'http://localhost:8080/angular-material.js',
          'https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-114/assets-cache.js'
        ].join(';');
        expect(data.js_external).toBe(expected)
      });

      it('adds ng-app attribute to the index', function() {
        expect(angular.element(data.html).attr('ng-app')).toBe('MyApp');
      });

      it('adds the demo id as a class attribute to the parent element on the index.html', function() {
        expect(angular.element(data.html).hasClass(demo.id)).toBe(true);
      });

      it('replaces the demo module with the codepen module', function() {
        expect(data.js).toBe("angular.module('MyApp');");
      });

      it('includes the demo css', function() {
        expect(data.css).toBe('.fake-class { color: red }');
      });
    });

    describe('when html templates are included in the demo', function() {

      var template, $script;
      beforeEach(function() {
        template = {
          name: 'template-name',
          contents: "<div class='foo'>{{bar}}</div>"
        };

        demo.files.html.push(template);

        data = codepenDataAdapter.translate(demo, externalScripts);

        script = angular.element(data.html).find('script');
      });

      it('appends the template to the index', function() {
        expect(script.html()).toBe(template.contents);
      });

      it('adds the ngTemplate to the script tag', function() {
        expect(script.attr('type')).toBe('text/ng-template');
      });

      it('adds the template name as the id', function() {
        expect(script.attr('id')).toBe(template.name);
      });
    });

    describe('when the demo html includes a <code> block', function() {

      it('escapes the ampersand, so that codepen does not unescape the angle brackets', function() {
        demo.files.index.contents = '<div><code>&gt;md-autocomplete&lt;</code></div>';
        data = codepenDataAdapter.translate(demo, externalScripts);
        expect(angular.element(data.html).html()).toBe('<code>&amp;gt;md-autocomplete&amp;lt;</code>');
      });

      it('handles multiple code blocks', function() {
        demo.files.index.contents = '<div><code>&gt;md-autocomplete&lt;</code><code>&gt;md-input&lt;</code></div>';
        data = codepenDataAdapter.translate(demo, externalScripts);
        expect(angular.element(data.html).html()).toBe('<code>&amp;gt;md-autocomplete&amp;lt;</code><code>&amp;gt;md-input&amp;lt;</code>');
      });

    });

    describe('when the html example includes &nbsp;', function() {

      it('escapes the ampersand, so that the codepen does not translate to an invalid character', function() {
        demo.files.index.contents = '<div>&nbsp;&nbsp;</div>';
        data = codepenDataAdapter.translate(demo, externalScripts);
        expect(angular.element(data.html).html()).toBe('&amp;nbsp;&amp;nbsp;');
      });
    });

    describe('when the module definition in the js file is formatted in different ways', function() {

      it('handles second argument on a new line', function() {
        var script = "angular.module('test',\n \
[]);";
        demo.files.js = [{ contents: script }];

        data = codepenDataAdapter.translate(demo, externalScripts);
        expect(data.js).toBe("angular.module('MyApp');");
      });

      it('handles dependencies on new lines', function() {
        var script = "angular.module('test', [\n \
'Dep1',\n \
'Dep2',\n \
]);";
        demo.files.js = [{ contents: script }];

        data = codepenDataAdapter.translate(demo, externalScripts);
        expect(data.js).toBe("angular.module('MyApp');");
      });

      it('handles module on a new line', function() {
        var script = "angular\n\
.module('test', [\n \
'Dep1',\n \
'Dep2',\n \
]);";
        demo.files.js = [{ contents: script }];

        data = codepenDataAdapter.translate(demo, externalScripts);
        expect(data.js).toBe("angular\n\
.module('MyApp');");
      });
    });
  });
});
