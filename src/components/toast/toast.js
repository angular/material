/**
 * @ngdoc module
 * @name material.components.toast
 * @description
 * Toast
 */
angular.module('material.components.toast', ['material.services.compiler'])
  .directive('materialToast', [
    QpToastDirective
  ])
  .factory('$materialToast', [
    '$timeout',
    '$rootScope',
    '$materialCompiler',
    '$rootElement',
    '$animate',
    QpToastService
  ]);

function QpToastDirective() {
  return {
    restrict: 'E'
  };
}

/**
 * @ngdoc service
 * @name $materialToast
 * @module material.components.toast
 */
function QpToastService($timeout, $rootScope, $materialCompiler, $rootElement, $animate) {
  var recentToast;

  return showToast;

  /**
   * TODO fully document this
   * Supports all options from $materialPopup, in addition to `duration` and `position`
   */
  function showToast(options) {
    options = angular.extend({
      // How long to keep the toast up, milliseconds
      duration: 3000,
      // [unimplemented] Whether to disable swiping
      swipeDisabled: false,
      // Supports any combination of these class names: 'bottom top left right fit'. 
      // Default: 'bottom left'
      position: 'bottom left',
    }, options || {});

    recentToast && recentToast.then(function(destroy) { destroy(); });

    recentToast = $materialCompiler.compile(options).then(function(compileData) {
      // Controller will be passed a `$hideToast` function
      compileData.locals.$hideToast = destroy;
      
      var scope = $rootScope.$new();
      var element = compileData.link(scope);
      element.addClass(options.position);

      var delayTimeout;
      $animate.enter(element, $rootElement, null, function() {
        if (options.duration) {
          delayTimeout = $timeout(destroy, options.duration);
        }
      });

      return destroy;

      function destroy() {
        $timeout.cancel(delayTimeout);
        $animate.leave(element, function() {
          scope.$destroy();
        });
      }
    });

    return recentToast;
  }
}
