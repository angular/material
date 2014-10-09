/**
 * @ngdoc module
 * @name material.components.toast
 * @description
 * Toast
 */
angular.module('material.components.toast', [
  'material.services.interimElement',
  'material.components.swipe'
])
  .directive('materialToast', [
    MaterialToastDirective
  ])
  .factory('$materialToast', [
    '$timeout',
    '$$interimElement',
    '$animate',
    '$materialSwipe',
    MaterialToastService
  ]);

function MaterialToastDirective() {
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
 *
 * Used to open a toast notification on any position on the screen [with an optional
 * duration], `$materialToast` is a service created by `$$interimElement` and provides a
 * simple promise-based, behavior API:
 *
 *  - `$materialToast.show()`
 *  - `$materialToast.hide()`
 *  - `$materialToast.cancel()`
 *
 * #### Notes:
 *
 * Only one toast notification may ever be active at any time. If a new toast is
 * shown while a different toast is active, the old toast will be automatically
 * hidden.
 *
 * @usage
 * <hljs lang="html">
 *  <script type="text/javascript">
 *  var app = angular.module('app', ['ngMaterial']);
 *    app.controller('MyController', function($scope, $materialToast) {
 *      $scope.openToast = function($event) {
 *        $materialToast.show({
 *          template: '<material-toast>Hello!</material-toast>',
 *          hideDelay: 3000
 *        });
 *      };
 *    });
 *  </script>
 *
 *  <div ng-controller="MyController">
 *    <material-button ng-click="openToast()">
 *      Open a Toast!
 *    </material-button>
 *  </div>
 * </hljs>
 */

 /**
 * @ngdoc method
 * @name $materialToast#show
 *
 * @description
 * Show a toast dialog with the specified options.
 *
 * @paramType Options
 * @param {string=} templateUrl The url of an html template file that will
 * be used as the content of the toast. Restrictions: the template must
 * have an outer `material-toast` element.
 * @param {string=} template Same as templateUrl, except this is an actual
 * template string.
 * @param {number=} hideDelay How many milliseconds the toast should stay
 * active before automatically closing.  Set to 0 to disable duration.
 * Default: 3000.
 * @param {string=} position Where to place the toast. Available: any combination
 * of 'bottom', 'left', 'top', 'right', 'fit'. Default: 'bottom left'.
 * @param {string=} controller The controller to associate with this toast.
 * @param {string=} locals An object containing key/value pairs. The keys will
 * be used as names of values to inject into the controller. For example,
 * `locals: {three: 3}` would inject `three` into the controller with the value
 * of 3.
 * @param {object=} resolve Similar to locals, except it takes promises as values
 * and the toast will not open until the promises resolve.
 * @param {string=} controllerAs An alias to assign the controller to on the scope.
 * @param {element=} parent The element to append the bottomSheet to. Defaults to appending
 * to the root element of the application.
 *
 * @returns {Promise} Returns a promise that will be resolved or rejected when
 *  `$materialToast.hide()` or `$materialToast.cancel()` is called respectively.
 */

/**
 * @ngdoc method
 * @name $materialToast#hide
 *
 * @description
 * Hide an existing toast and `resolve` the promise returned from `$materialToast.show()`.
 *
 * @param {*} arg An argument to resolve the promise with.
 *
 */

/**
 * @ngdoc method
 * @name $materialToast#cancel
 *
 * @description
 * Hide an existing toast and `reject` the promise returned from `$materialToast.show()`.
 *
 * @param {*} arg An argument to reject the promise with.
 *
 */

function MaterialToastService($timeout, $$interimElement, $animate, $materialSwipe) {

  var factoryDef = {
    onShow: onShow,
    onRemove: onRemove,
    position: 'bottom left',
    hideDelay: 3000,
  };

  var $materialToast = $$interimElement(factoryDef);
  return $materialToast;

  function onShow(scope, element, options) {
    element.addClass(options.position);
    options.parent.addClass(toastOpenClass(options.position));

    var configureSwipe = $materialSwipe(scope, 'swipeleft swiperight');
    options.detachSwipe = configureSwipe(element, function(ev) {
      //Add swipeleft/swiperight class to element so it can animate correctly
      element.addClass(ev.type);
      $timeout($materialToast.hide);
    });

    return $animate.enter(element, options.parent);
  }

  function onRemove(scope, element, options) {
    options.detachSwipe();
    options.parent.removeClass(toastOpenClass(options.position));
    return $animate.leave(element);
  }

  function toastOpenClass(position) {
    return 'material-toast-open-' +
      (position.indexOf('top') > -1 ? 'top' : 'bottom');
  }
}
