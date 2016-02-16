/**
 * ngPanel by @matsko
 * https://github.com/matsko/ng-panel
 */
DocsApp

  .directive('ngPanel', ['$animate', function($animate) {
    return {
      restrict: 'EA',
      transclude: 'element',
      terminal: true,
      compile: function(elm, attrs) {
        var attrExp = attrs.ngPanel || attrs['for'];
        var regex = /^(\S+)(?:\s+track by (.+?))?$/;
        var match = regex.exec(attrExp);

        var watchCollection = true;
        var objExp = match[1];
        var trackExp = match[2];
        if (trackExp) {
          watchCollection = false;
        } else {
          trackExp = match[1];
        }

        return function(scope, $element, attrs, ctrl, $transclude) {
          var previousElement, previousScope;
          scope[watchCollection ? '$watchCollection' : '$watch'](trackExp, function(value) {
            if (previousElement) {
              $animate.leave(previousElement);
            }
            if (previousScope) {
              previousScope.$destroy();
              previousScope = null;
            }
            var record = watchCollection ? value : scope.$eval(objExp);
            previousScope = scope.$new();
            $transclude(previousScope, function(element) {
              previousElement = element;
              $animate.enter(element, null, $element);
            });
          });
        };
      }
    };
  }]);
