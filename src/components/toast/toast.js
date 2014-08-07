/**
 * @ngdoc module
 * @name material.components.toast
 * @description
 * Toast
 */
angular.module('material.components.toast', ['material.services.popup'])
  .directive('materialToast', [
    QpToastDirective
  ])
  .factory('$materialToast', [
    '$timeout',
    '$materialPopup',
    QpToastService
  ]);

function QpToastDirective() {
  return {
    restrict: 'E',
    transclude: true,
    template: 
      '<div class="toast-container" ng-transclude>' +
      '</div>'
  };
}

/**
 * @ngdoc service
 * @name $materialToast
 * @module material.components.toast
 */
function QpToastService($timeout, $materialPopup) {
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

      // Also supports all options from $materialPopup
      transformTemplate: function(template) {
        return '<material-toast>' + template + '</material-toast>';
      }
    }, options || {});

    recentToast && recentToast.then(function(destroyToast) {
      destroyToast();
    });

    recentToast = $materialPopup(options).then(function(toast) {
      function destroy() {
        $timeout.cancel(toast.delay);
        toast.destroy();
      }

      // Controller will be passed a `$hideToast` function
      toast.locals.$hideToast = destroy;

      toast.element.addClass(options.position);
      toast.enter(function() {
        if (options.duration) {
          toast.delay = $timeout(destroy, options.duration);
        }
      });

      return destroy;
    });

    return recentToast;
  }
}
