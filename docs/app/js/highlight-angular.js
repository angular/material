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
