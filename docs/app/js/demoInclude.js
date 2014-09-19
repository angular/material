DocsApp.directive('demoInclude', [
  '$q', 
  '$http', 
  '$compile', 
  '$templateCache',
function($q, $http, $compile, $templateCache) {
  return function postLink(scope, element, attr) {
    var demoContainer;

    // Interpret the expression given as `demo-include="something"`
    var demo = scope.$eval(attr.demoInclude);

    handleDemoIndexFile();

    /**
     * Fetch the demo's incdex file, and if it contains its own ng-app module
     * then bootstrap a new angular app  with that module. Otherwise, compile
     * the demo into the current demo ng-app.
     */
    function handleDemoIndexFile() {
      $http.get(demo.indexFile.outputPath, {cache: $templateCache})
        .then(function(response) {

          demoContainer = angular.element(
            '<div class="demo-content ' + demo.module + '">'
          ).html(response.data);

          if (demo.module) {
            angular.bootstrap(demoContainer[0], [demo.module]);
          } else {
            $compile(demoContainer)(scope);
          }

          handleDemoStyles();
          handleDemoTemplates();

          element.append(demoContainer);
        });
    }


    /**
     * Fetch the demo styles, add a rule to restrict the styles to only
     * apply to this specific demo, and append the styles to the DOM.
     */
    function handleDemoStyles() {

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
          styles = styles
            .join('\n') //join styles as one string
            .replace(/.+?({|,)/g, function($1) {
              // change ' .class {' to '.buttonsDemo1 .class {'
              return demoSelector + $1;
            });

          var styleElement = angular.element('<style>' + styles + '</style>');
          document.body.appendChild(styleElement[0]);

          scope.$on('$destroy', function() {
            styleElement.remove();
          });
        });
      }

    }

    /**
     * Fetch the templates for this demo, and put the templates into
     * the demo app's templateCache, with a url that allows the demo apps
     * to reference their templates local to the demo index file.
     *
     * For example, make it so the dialog demo can reference templateUrl
     * 'my-dialog.tmpl.html' instead of having to reference the url
     * 'generated/material.components.dialog/demo/demo1/my-dialog.tmpl.html'.
     */
    function handleDemoTemplates() {

      var templates = demo.files.filter(function(file) {
        return file.fileType === 'html';
      });

      if (templates.length) {
        // Get the $templateCache instance that goes with the demo's specific
        // app instance.
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

    }

  };

}]);
