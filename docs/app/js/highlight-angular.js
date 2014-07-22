DocsApp.directive('highlight', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      scope.$watch(attrs.highlight, highlight);
      scope.$watch(attrs.highlightLanguage, highlight);

      function highlight() {
        //Always add a newline at the start - stops a weird spacing bug
        var code = '\n' + (''+scope.$eval(attrs.highlight)).trim();
        var language = scope.$eval(attrs.highlightLanguage);
        if (code && language) {
          var highlightedCode = hljs.highlight(language, code);
          element.html(highlightedCode.value);
        }
      }
    }
  };
});

DocsApp.directive('codeView', function($compile) {
  return {
    restrict: 'C',
    link: function(scope, element) {
      var code = element.eq(0).clone();
      code.children().removeAttr('class');

      var highlightedCode = hljs.highlight('html', code[0].innerHTML);

      highlightedCode.value = highlightedCode.value.replace(/=<span class="hljs-value">""<\/span>/gi, '');

      element.prepend('<pre><code>' + highlightedCode.value + '</code></pre>');
    }
  };
});
