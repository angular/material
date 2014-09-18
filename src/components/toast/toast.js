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
 *
 * @description
 * Open a toast notification on any position on the screen, with an optional 
 * duration.
 *
 * Only one toast notification may ever be active at any time. If a new toast is
 * shown while a different toast is active, the old toast will be automatically
 * hidden.
 *
 * `$materialToast` takes one argument, options, which is defined below.
 *
 * @usage
 * <hljs lang="html">
 * <div ng-controller="MyController">
 *   <material-button ng-click="openToast()">
 *     Open a Toast!
 *   </material-button>
 * </div>
 * </hljs>
 * <hljs lang="js">
 * var app = angular.module('app', ['ngMaterial']);
 * app.controller('MyController', function($scope, $materialToast) {
 *   $scope.openToast = function($event) {
 *     var hideToast = $materialToast({
 *       template: '<material-toast>Hello!</material-toast>',
 *       duration: 3000
 *     });
 *   };
 * });
 * </hljs>
 *
 * @returns {function} `hideToast` - A function that hides the toast.
 *
 * @paramType Options
 * @param {string=} templateUrl The url of an html template file that will
 * be used as the content of the toast. Restrictions: the template must
 * have an outer `material-toast` element.
 * @param {string=} template Same as templateUrl, except this is an actual
 * template string.
 * @param {number=} duration How many milliseconds the toast should stay
 * active before automatically closing.  Set to 0 to disable duration. 
 * Default: 3000.
 * @param {string=} position Where to place the toast. Available: any combination
 * of 'bottom', 'left', 'top', 'right', 'fit'. Default: 'bottom left'.
 * @param {string=} controller The controller to associate with this toast.
 * The controller will be injected the local `$hideToast`, which is a function
 * used to hide the toast.
 * @param {string=} locals An object containing key/value pairs. The keys will
 * be used as names of values to inject into the controller. For example, 
 * `locals: {three: 3}` would inject `three` into the controller with the value
 * of 3.
 * @param {object=} resolve Similar to locals, except it takes promises as values
 * and the toast will not open until the promises resolve.
 * @param {string=} controllerAs An alias to assign the controller to on the scope.
 */
function QpToastService($timeout, $rootScope, $materialCompiler, $rootElement, $animate) {
  var recentToast;
  function toastOpenClass(position) {
    return 'material-toast-open-' +
      (position.indexOf('top') > -1 ? 'top' : 'bottom');
  }

  // If the $rootElement is the document (<html> element), be sure to append it to the
  // body instead.
  var toastParent = $rootElement.find('body');
  if ( !toastParent.length ) {
    toastParent = $rootElement;
  }

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
      position: 'bottom left'
    }, options || {});

    recentToast && recentToast.then(function(destroy) { destroy(); });

    recentToast = $materialCompiler.compile(options).then(function(compileData) {
      // Controller will be passed a `$hideToast` function
      compileData.locals.$hideToast = destroy;

      var scope = $rootScope.$new();
      var element = compileData.link(scope);

      var toastParentClass = toastOpenClass(options.position);
      element.addClass(options.position);
      toastParent.addClass(toastParentClass);

      var delayTimeout;
      $animate.enter(element, toastParent).then(function() {
        if (options.duration) {
          delayTimeout = $timeout(destroy, options.duration);
        }
      });

      var hammertime = new Hammer(element[0], {
        recognizers: [
          [Hammer.Swipe, { direction: Hammer.DIRECTION_HORIZONTAL }]
        ]
      });
      hammertime.on('swipeleft swiperight', onSwipe);
      
      function onSwipe(ev) {
        //Add swipeleft/swiperight class to element so it can animate correctly
        element.addClass(ev.type);
        $timeout(destroy);
      }

      return destroy;

      function destroy() {
        if (destroy.called) return;
        destroy.called = true;

        hammertime.destroy();
        toastParent.removeClass(toastParentClass);
        $timeout.cancel(delayTimeout);
        $animate.leave(element).then(function() {
          scope.$destroy();
        });
      }
    });

    return recentToast;
  }
}
