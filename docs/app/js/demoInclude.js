DocsApp.directive('demoInclude', [
  '$q', 
  '$http', 
  '$compile', 
  '$templateCache',
function($q, $http, $compile, $templateCache) {
  return function postLink(scope, element, attr) {
    var demo = scope.$eval(attr.demoInclude);

    $http.get(demo.indexFile.outputPath, {cache: $templateCache})
    .then(function(response) {

      var demoContainer = angular.element(
        '<div class="demo-content ' + demo.module + '">'
      ).html(response.data);

      if (demo.module) {
        angular.bootstrap(demoContainer[0], [demo.module]);
      } else {
        $compile(demoContainer)(scope);
      }

      element.append(demoContainer);

      var styleFiles = demo.files.filter(function(file) {
        return file.fileType === 'css';
      });
      if (styleFiles.length) {
        var demoSelector = demo.module ? ('.' + demo.module + ' ') : '';
        $q.all(styleFiles.map(function(file) {
          return $http.get(file.outputPath, {cache: $templateCache})
            .then(function(response) { return response.data; });
        }))
        .then(function(styles) {
          styles = styles.join('\n'); //join styles as one string

          styles = styles.replace(/.+?({|,)/g, function($1) {
            // change ' .class {' to '.buttonsDemo1.class {'
            return demoSelector + $1;
          });

          var styleElement = angular.element('<style>' + styles + '</style>');
          document.body.appendChild(styleElement[0]);

          scope.$on('$destroy', function() {
            styleElement.remove();
          });
        });
      }

      // Put the demo's templates into the cache for the demo's app,
      // so they can be referenced local to the demo
      var templates = demo.files.filter(function(file) {
        return file.fileType === 'html';
      });
      if (templates.length) {
        var demoTemplateCache = demoContainer.injector().get('$templateCache');
        templates.forEach(function(file) {
          $http.get(file.outputPath).then(function(response) {
            demoTemplateCache.put(file.basePath, response.data);
          });
        });

        scope.$on('$destroy', function() {
          templates.forEach(demoTemplateCache.remove);
        });
      }

    });

  };

}]);
