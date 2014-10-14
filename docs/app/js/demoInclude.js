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
      $http.get(demo.index.outputPath, {cache: $templateCache})
      .then(function(response) {
        demoContainer = angular.element(
          '<div class="demo-content ' + demo.id + '">'
        );

        var demoIndexHtml = response.data;
        var isStandalone = !!demo.ngModule.module;
        var demoScope;
        var demoCompileService;
        if (isStandalone) {
          angular.bootstrap(demoContainer[0], [demo.ngModule.module]);
          demoScope = demoContainer.scope();
          demoCompileService = demoContainer.injector().get('$compile');
          scope.$on('$destroy', function() {
            demoScope.$destroy();
          });

        } else {
          demoScope = scope.$new();
          demoCompileService = $compile;
        }

        // Once everything is loaded, put the demo into the DOM
        $q.all([
          handleDemoStyles(),
          handleDemoTemplates()
        ]).finally(function() {
          demoScope.$evalAsync(function() {
            element.append(demoContainer);
            demoContainer.html(demoIndexHtml);
            demoCompileService( demoContainer.contents() )(demoScope);
          });
        });
      });

    }


    /**
     * Fetch the demo styles, and append them to the DOM.
     */
    function handleDemoStyles() {
      return $q.all((demo.css || []).map(function(file) {
        return $http.get(file.outputPath, {cache: $templateCache})
          .then(function(response) { return response.data; });
      }))
      .then(function(styles) {
        styles = styles.join('\n'); //join styles as one string

        var styleElement = angular.element('<style>' + styles + '</style>');
        document.body.appendChild(styleElement[0]);

        scope.$on('$destroy', function() {
          styleElement.remove();
        });
      });

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
      return $q.all((demo.html || []).map(function(file) {
        return $http.get(file.outputPath).then(function(response) {
          // Get the $templateCache instance that goes with the demo's specific ng-app.
          var demoTemplateCache = demoContainer.injector().get('$templateCache');

          demoTemplateCache.put(file.name, response.data);

          scope.$on('$destroy', function() {
            demoTemplateCache.remove(file.name);
          });

        });

      }));

    }

  };

}]);
