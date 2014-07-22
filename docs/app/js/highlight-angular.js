DocsApp

.directive('highlight', function() {
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
})

.directive('codeView', function() {
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
})

.directive('iframeCodeView', function() {
  return {
    restrict: 'E',
    link: function(scope, element) {
      var iFrame = element[0].firstElementChild;
      if(iFrame && iFrame.src) {
        var links = angular.element(
          '<p><a class="material-button material-button-raised material-button-colored" href="' + iFrame.src + '" target="_blank">Full View</a> \
           <a class="material-button material-button-raised material-button-colored" href="view-source:' + iFrame.src + '" target="_blank">View Source</a></p>'
        );
        element.append(links);
        console.log(iFrame.src)
      }
    }
  };
});
