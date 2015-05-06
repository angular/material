(function() {
  DocsApp
    .factory('$codepenDataAdapter', CodepenDataAdapter)
    .factory('$codepen', ['$demoAngularScripts', '$document', '$codepenDataAdapter', Codepen]);

  /**
   * @ngdoc service
   * @name codepen
   * @description
   * Provides a service to open a code example in codepen.
   */
  function Codepen($demoAngularScripts, $document, $codepenDataAdapter) {

    var CODEPEN_API = 'http://codepen.io/pen/define/';

    return {
      editOnCodepen: editOnCodepen
    };

    /**
     * @ngdoc function
     * @name $codepen.editOnCodepen
     * @param {object} demo The object representing the metadata and contents for a demo
     * @usage
     * $codepen.editOnCodepen({
     *   id: 'demo-id',
     *   title: 'title',
     *   module: 'module-name',
     *   files: {
     *     html: [{ name: 'relative-path', contents: '...'}],
     *     css: [{ name: 'relative-path', contents: '...'],
     *     index: { contents: '...' },
     *     js: [{ contents: '...' }]
     *   }
     * });
     */
    function editOnCodepen(demo) {
      var data = $codepenDataAdapter.translate(demo, $demoAngularScripts.all());
      var form = buildForm(data);
      $document.find('body').append(form);
      form[0].submit();
      form.remove();
    };

    function buildForm(data) {
      var form = angular.element('<form style="display: none;" method="post" target="_blank" action="' + CODEPEN_API + '"></form>');
      var input = '<input type="hidden" name="data" value="' + cleanseJson(data) + '" />';
      form.append(input);
      return form;
    };

    function cleanseJson(json) {
      return JSON.stringify(json)
        .replace(/"/g, "&quot;")
        .replace(/"/g, "&apos;");
    };
  };

  /**
   * @ngdoc service
   * @description
   * ** INTENDED FOR INTERNAL USE **
   *
   * Translates demo metadata and files into Codepen's post form data.  See api documentation for
   * additional fields not used by this service. (http://blog.codepen.io/documentation/api/prefill)
   */
  function CodepenDataAdapter() {

    var CORE_JS = 'https://cdn.rawgit.com/angular/bower-material/master/angular-material.js';
    var ASSET_CACHE_JS = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-114/assets-cache.js';
    var CORE_CSS = 'https://cdn.rawgit.com/angular/bower-material/master/angular-material.css';

    return {
      translate: translate
    };

    /**
     * @ngdoc function
     * @name $codepenDataAdapter.translate
     * @param {object} demo The object representing the metadata and contents for a demo
     * @param {Array} externalScripts Any additional dependent scripts
     * @usage
     * var demo = {
     *   id: 'demo-id',
     *   title: 'title',
     *   module: 'module-name',
     *   files: {
     *     html: [{ name: 'relative-path', contents: '...'}],
     *     css: [{ name: 'relative-path', contents: '...'],
     *     index: { contents: '...' },
     *     js: [{ contents: '...' }]
     *    }
     * };
     *
     * var externalScripts = ['pathToScript1', 'pathToScript2'];
     *
     * $codepen.editOnCodepen(demo, externalScripts);
     */
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
    };

    function processHtml(demo) {
      var index = demo.files.index.contents;

      var processors = [
        applyAngularAttributesToParentElement,
        insertTemplatesAsScriptTags,
        replaceEscapedCharacters
      ];

      angular.forEach(processors, function(processor) {
        index = processor(index, demo);
      });

      return index;
    };

    function processJs(jsFiles) {
      var mergedJs = mergeFiles(jsFiles).join(' ');
      var script = replaceDemoModuleWithCodepenModule(mergedJs);
      return script;
    };

    function mergeFiles(files) {
      return files.map(function(file) {
        return file.contents;
      });
    };

    //Adds class to parent element so that styles are applied correctly
    //Adds ng-app attribute.  This is the same module name provided in the asset-cache.js
    function applyAngularAttributesToParentElement(html, demo) {
      var tmp = angular.element(html);
      tmp.addClass(demo.id);
      tmp.attr('ng-app', 'MyApp');
      return tmp[0].outerHTML;
    };

    //Adds templates inline in the html, so that templates are cache in the example
    function insertTemplatesAsScriptTags(indexHtml, demo) {
      if (demo.files.html.length) {
        var tmp = angular.element(indexHtml);
        angular.forEach(demo.files.html, function(template) {
          tmp.append("<script type='text/ng-template' id='" + template.name + "'>" + template.contents + "</script>");
        });
        return tmp[0].outerHTML;
      }
      return indexHtml;
    };

    //Escapes ampersands so that after codepen unescapes the html the escaped code block
    //uses the correct escaped characters
    function replaceEscapedCharacters(html) {
      return html
        .replace(/&gt;/g, "&amp;gt;")
        .replace(/&lt;/g, "&amp;lt;");
    };

    //Required to make codepen work.  Without replacing the module, the asset cache will not work
    function replaceDemoModuleWithCodepenModule(file) {
      var matchAngularModule =  /\.module\(('[^']*'|"[^"]*")\s*,(?:\s*\[([^\]]*)\])?/g;
      return file.replace(matchAngularModule, ".module('MyApp'");
    };
 };
})();
