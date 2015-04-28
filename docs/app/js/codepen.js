(function() {
  DocsApp
    .factory('codepenDataAdapter', CodepenDataAdapter)
    .factory('codepen', ['$demoAngularScripts', '$document', 'codepenDataAdapter', Codepen]);

  // Provides a service to open a code example in codepen.
  function Codepen($demoAngularScripts, $document, codepenDataAdapter) {

    var CODEPEN_API = 'http://codepen.io/pen/define/';

    return {
      editOnCodepen: editOnCodepen
    };

    // Creates a codepen from the given demo model by posting to Codepen's API
    // using a hidden form.  The hidden form is necessary to avoid a CORS issue.
    // See http://blog.codepen.io/documentation/api/prefill
    function editOnCodepen(demo) {
      var data = codepenDataAdapter.translate(demo, $demoAngularScripts.all());
      var form = buildForm(data);
      $document.find('body').append(form);
      form[0].submit();
      form.remove();
    }

    // Builds a hidden form with data necessary to create a codepen.
    function buildForm(data) {
      var form = angular.element(
        '<form style="display: none;" method="post" target="_blank" action="' +
          CODEPEN_API +
          '"></form>'
      );
      var input = '<input type="hidden" name="data" value="' + escapeJsonQuotes(data) + '" />';
      form.append(input);
      return form;
    }

    // Recommended by Codepen to escape quotes.
    // See http://blog.codepen.io/documentation/api/prefill
    function escapeJsonQuotes(json) {
      return JSON.stringify(json)
        .replace(/"/g, "&quot;")
        .replace(/"/g, "&apos;");
    }
  }

  // Translates demo metadata and files into Codepen's post form data.  See api documentation for
  // additional fields not used by this service. http://blog.codepen.io/documentation/api/prefill
  function CodepenDataAdapter() {

    var CORE_JS = 'https://cdn.rawgit.com/angular/bower-material/master/angular-material.js';
    var CORE_CSS = 'https://cdn.rawgit.com/angular/bower-material/master/angular-material.css';
    var ASSET_CACHE_JS = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-114/assets-cache.js';

    return {
      translate: translate
    };

    // Translates a demo model to match Codepen's post data
    // See http://blog.codepen.io/documentation/api/prefill
    function translate(demo, externalScripts) {
      var files = demo.files;

      return {
        title: demo.title,
        html: processHtml(demo),
        css: mergeFiles(files.css).join(' '),
        js: processJs(files.js),
        js_external: externalScripts.concat([CORE_JS, ASSET_CACHE_JS]).join(';'),
        css_external: CORE_CSS
      };
    }

    // Modifies index.html with neccesary changes in order to display correctly in codepen
    // See each processor to determine how each modifies the html
    function processHtml(demo) {
      var index = demo.files.index.contents;

      var processors = [
        applyAngularAttributesToParentElement,
        insertTemplatesAsScriptTags,
        htmlEscapeAmpersand
      ];

      processors.forEach(function(processor) {
        index = processor(index, demo);
      });

      return index;
    }

    // Applies modifications the javascript prior to sending to codepen.
    // Currently merges js files and replaces the module with the Codepen
    // module.  See documentation for replaceDemoModuleWithCodepenModule.
    function processJs(jsFiles) {
      var mergedJs = mergeFiles(jsFiles).join(' ');
      var script = replaceDemoModuleWithCodepenModule(mergedJs);
      return script;
    }

    // Maps file contents to an array
    function mergeFiles(files) {
      return files.map(function(file) {
        return file.contents;
      });
    }

    // Adds class to parent element so that styles are applied correctly
    // Adds ng-app attribute.  This is the same module name provided in the asset-cache.js
    function applyAngularAttributesToParentElement(html, demo) {
      var tmp;

      // Grab only the DIV for the demo...
      angular.forEach(angular.element(html), function(it,key){
        if ((it.nodeName != "SCRIPT") || (it.nodeName != "#text")) {
          tmp = angular.element(it);
        }
      });

      tmp.addClass(demo.id);
      tmp.attr('ng-app', 'MyApp');
      return tmp[0].outerHTML;
    }

    // Adds templates inline in the html, so that templates are cached in the example
    function insertTemplatesAsScriptTags(indexHtml, demo) {
      if (demo.files.html.length) {
        var tmp = angular.element(indexHtml);
        angular.forEach(demo.files.html, function(template) {
          tmp.append("<script type='text/ng-template' id='" +
                     template.name + "'>" +
                     template.contents +
                     "</script>");
        });
        return tmp[0].outerHTML;
      }
      return indexHtml;
    }

    // Escapes ampersands so that after codepen unescapes the html the escaped code block
    // uses the correct escaped characters
    function htmlEscapeAmpersand(html) {
      return html
        .replace(/&gt;/g, "&amp;gt;")
        .replace(/&lt;/g, "&amp;lt;");
    }

    // Required to make codepen work. Demos define their own module when running on the
    // docs site.  In order to ensure the codepen example can use the asset-cache, the
    // module needs to match so that the $templateCache is populated with the necessary
    // assets.
    function replaceDemoModuleWithCodepenModule(file) {
      var matchAngularModule =  /\.module\(('[^']*'|"[^"]*")\s*,(?:\s*\[([^\]]*)\])?/g;
      return file.replace(matchAngularModule, ".module('MyApp'");
    }
  }
})();
