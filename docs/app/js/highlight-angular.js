DocsApp

.directive('code', function() {
  return {
    restrict: 'E',
    link: function(scope, element, attr) {
      if (!attr.language) return;
      var content;
      if (attr.content) {
        content = scope.$eval(attr.content);
      } else {
        content = element.html();
      }
      var language = attr.language;

      var highlightedCode = hljs.highlight(language, content);
      element.html(highlightedCode.value);
      element.attr('block','');
    }
  };
})

.directive('code', function() {
  return {
    restrict: 'E',
    link: function(scope, element, attr) {
      if (!attr.language) return;

      var language = attr.language;
      var highlightedCode = hljs.highlight(language, element.html());
      element.html(highlightedCode.value);
      element.attr('block','');
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
