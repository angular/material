DocsApp

.directive('hljs', ['$timeout', function($timeout) {
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
        var contentParent;

        if (attr.code) {
          // Attribute? code is the evaluation
          code = scope.$eval(attr.code);
        }

        if ( code ) {
          contentParent = angular.element('<pre><code class="highlight" ng-non-bindable></code></pre>');
          element.append(contentParent);
          // Defer highlighting 1-frame to prevent GA interference...
          $timeout(render, 0, false);
        }

        function render() {

          var codeElement = contentParent.find('code');
          var lines = code.split('\n');

          // Remove empty lines
          lines = lines.filter(function(line) {
            return line.trim().length;
          });

          // Make it so each line starts at 0 whitespace
          var firstLineWhitespace = lines[0].match(/^\s*/)[0] || '';
          lines = lines.map(function(line) {
            return line
              .replace(new RegExp('^' + firstLineWhitespace), '')
              .replace(/\s+$/, '');
          });

          var highlightedCode = hljs.highlight(attr.language || attr.lang, lines.join('\n'), true);

              highlightedCode.value = highlightedCode.value
                .replace(/=<span class="hljs-value">""<\/span>/gi, '')
                .replace('<head>', '')
                .replace('<head/>', '');

          codeElement.append(highlightedCode.value).addClass('highlight');

        }
      };
    }
  };
}])
;
