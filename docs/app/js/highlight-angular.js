DocsApp

.directive('hljs', ['$compile', function($compile) {
  return {
    restrict: 'E',
    compile: function(element, attr) {
      var code;
      //No attribute? code is the content
      if (!attr.code) {
        code = element.html();
        element.empty();
      }

      return function(scope, element, attr) {
        var contentParent = angular.element('<pre><code class="highlight" ng-non-bindable></code></pre>');
        var codeElement = contentParent.find('code');

        // Attribute? code is the evaluation
        if (attr.code) {
          code = scope.$eval(attr.code);
        }
        if (!code) return;
        var highlightedCode = hljs.highlight(attr.language || attr.lang, code.trim());
        highlightedCode.value = highlightedCode.value.replace(/=<span class="hljs-value">""<\/span>/gi, '');
        codeElement.append(highlightedCode.value).addClass('highlight');

        element.append(contentParent);
      };
    }
  };
}])

.directive('codeView', function() {
  return {
    restrict: 'C',
    link: function(scope, element) {
      var code = element.eq(0).clone();
      code.children().removeAttr('class');

      var highlightedCode = hljs.highlight('html', code[0].innerHTML);

      highlightedCode.value = highlightedCode.value.replace(/=<span class="hljs-value">""<\/span>/gi, '');

      element.prepend('<pre><code>' + highlightedCode.value + '</code></pre>');
      element.find('code').addClass('highlight');
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
          '<p><a class="md-button md-button-raised md-button-colored" href="' + iFrame.src + '" target="_blank">Full View</a> \
           <a class="md-button md-button-raised md-button-colored" href="view-source:' + iFrame.src + '" target="_blank">View Source</a></p>'
        );
        element.append(links);
      }
    }
  };
});
