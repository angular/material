(function() {
  DocsApp
    .factory('$codepen', ['$demoAngularScripts', '$document', Codepen]);

  function Codepen($demoAngularScripts, $document) {
    var translator = new ExampleFilesToCodepenDataTranslator();

    return {
      editExample: editExample
    };

    function editExample(demo) {
      var data = translator.translate(demo, $demoAngularScripts.all());
      var form = buildForm(data);
      $document.find('body').append(form);
      form[0].submit();
      form.remove();
    };

    function buildForm(data) {
      var target = '_blank';
      var url = 'http://codepen.io/pen/define/';
      var form = angular.element('<form style="display: none;" method="post" target="_blank" action="' + url + '"></form>');
      var input = angular.element('<input type="hidden" name="data" value="' + cleanseJson(data) + '" />');
      form.append(input);
      return form;
    };

    function cleanseJson(json) {
      return JSON.stringify(json)
        .replace(/"/g, "&quot;")
        .replace(/"/g, "&apos;");
    };
  };

  function ExampleFilesToCodepenDataTranslator() {
    return {
      translate: translate
    };

    //TODO: need to change this to use angular-material.js/css
    function translate(demo, externalScripts) {
      var files = demo.files;
      return {
        title: demo.title,
        html: mergeHtml(files).join(' '),
        css: mergeFiles(files.css).join(' '),
        js: mergeFiles(files.js).join(' '),
        js_external: externalScripts.concat(['https://material.angularjs.org/docs.js']).join(';') || '',
        css_external: 'https://material.angularjs.org/docs.css'
      };
    };

    function mergeHtml(files) {
      var index = files.index.contents;
      var additionalHtml = mergeFiles(files.html);
      return [index].concat(additionalHtml)
    };

    function mergeFiles(files) {
      return files.map(function(file) {
        return file.contents;
      });
    };
  };
})();
