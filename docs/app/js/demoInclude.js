DocsApp.directive('demoInclude', [
  '$q', 
  '$http', 
  '$compile', 
  '$templateCache',
  '$timeout',
function($q, $http, $compile, $templateCache, $timeout) {
  return {
    restrict: 'E',
    link: postLink
  };
  
  function postLink(scope, element, attr) {
    var demoContainer;

    // Interpret the expression given as `demo-include files="something"`
    var files = scope.$eval(attr.files) || {};
    var ngModule = scope.$eval(attr.module) || '';

    $timeout(handleDemoIndexFile);

    /**
     * Fetch the index file, and if it contains its own ngModule
     * then bootstrap a new angular app with that ngModule. Otherwise, compile
     * the demo into the current ng-app.
     */
    function handleDemoIndexFile() {
      files.index.contentsPromise.then(function(contents) {
        demoContainer = angular.element(
          '<div class="demo-content ' + ngModule + '">'
        );

        var isStandalone = !!ngModule;
        var demoScope;
        var demoCompileService;
        if (isStandalone) {
          angular.bootstrap(demoContainer[0], [ngModule]);
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
            demoContainer.html(contents);
            demoCompileService(demoContainer.contents())(demoScope);
          });
        });
      });

    }


    /**
     * Fetch the demo styles, and append them to the DOM.
     */
    function handleDemoStyles() {
      return $q.all(files.css.map(function(file) {
        return file.contentsPromise;
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
      return $q.all(files.html.map(function(file) {

        return file.contentsPromise.then(function(contents) {
          // Get the $templateCache instance that goes with the demo's specific ng-app.
          var demoTemplateCache = demoContainer.injector().get('$templateCache');
          demoTemplateCache.put(file.name, contents);

          scope.$on('$destroy', function() {
            demoTemplateCache.remove(file.name);
          });

        });

      }));

    }

  }

}]);
