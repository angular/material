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
  .directive('mdToast', [
    MdToastDirective
  ])
  .factory('$mdToast', [
    '$timeout',
    '$$interimElement',
    '$animate',
    '$mdSwipe',
    MdToastService
  ]);

function MdToastDirective() {
  return {
    restrict: 'E'
  };
}

/**
 * @ngdoc service
 * @name $mdToast
 * @module material.components.toast
 *
 * @description
 * `$mdToast` opens a toast nofication on any position on the screen with an optional
 * duration, and provides a simple promise API.
 *
 * ### Restrictions
 * - The toast's template must have an outer `<md-toast>` element.
 *
 * @usage
 * <hljs lang="html">
 * <div ng-controller="MyController">
 *   <md-button ng-click="openToast()">
 *     Open a Toast!
 *   </md-button>
 * </div>
 * </hljs>
 *
 * <hljs lang="js">
 * var app = angular.module('app', ['ngMaterial']);
 * app.controller('MyController', function($scope, $mdToast) {
 *   $scope.openToast = function($event) {
 *     $mdToast.show({
 *       template: '<md-toast>Hello!</md-toast>',
 *       hideDelay: 3000
 *     });
 *   };
 * });
 * </hljs>
 */

 /**
 * @ngdoc method
 * @name $mdToast#show
 *
 * @description
 * Show a toast dialog with the specified options.
 *
 * @param {object} options An options object, with the following properties:
 *
 *   - `templateUrl` - `{string=}`: The url of an html template file that will
 *     be used as the content of the toast. Restrictions: the template must
 *     have an outer `md-toast` element.
 *   - `template` - `{string=}`: Same as templateUrl, except this is an actual
 *     template string.
 *   - `hideDelay` - `{number=}`: How many milliseconds the toast should stay
 *     active before automatically closing.  Set to 0 or false to have the toast stay open until 
 *     closed manually. Default: 3000.
 *   - `position` - `{string=}`: Where to place the toast. Available: any combination
 *     of 'bottom', 'left', 'top', 'right', 'fit'. Default: 'bottom left'.
 *   - `controller` - `{string=}`: The controller to associate with this toast.
 *     The controller will be injected the local `$hideToast`, which is a function
 *     used to hide the toast.
 *   - `locals` - `{string=}`: An object containing key/value pairs. The keys will
 *     be used as names of values to inject into the controller. For example,
 *     `locals: {three: 3}` would inject `three` into the controller with the value
 *     of 3.
 *   - `resolve` - `{object=}`: Similar to locals, except it takes promises as values
 *     and the toast will not open until the promises resolve.
 *   - `controllerAs` - `{string=}`: An alias to assign the controller to on the scope.
 *
 * @returns {promise} A promise that can be resolved with `$mdToast.hide()` or
 * rejected with `$mdBottomSheet.cancel()`.
 */

/**
 * @ngdoc method
 * @name $mdToast#hide
 *
 * @description
 * Hide the existing toast and resolve the promise returned from `$mdToast.show()`.
 *
 * @param {*=} response An argument for the resolved promise.
 *
 */

/**
 * @ngdoc method
 * @name $mdToast#cancel
 *
 * @description
 * Hide the existing toast and reject the promise returned from 
 * `$mdToast.show()`.
 *
 * @param {*=} response An argument for the rejected promise.
 *
 */

function MdToastService($timeout, $$interimElement, $animate, $mdSwipe) {

  var factoryDef = {
    onShow: onShow,
    onRemove: onRemove,
    position: 'bottom left',
    hideDelay: 3000,
  };

  var $mdToast = $$interimElement(factoryDef);
  return $mdToast;

  function onShow(scope, element, options) {
    element.addClass(options.position);
    options.parent.addClass(toastOpenClass(options.position));

    var configureSwipe = $mdSwipe(scope, 'swipeleft swiperight');
    options.detachSwipe = configureSwipe(element, function(ev) {
      //Add swipeleft/swiperight class to element so it can animate correctly
      element.addClass(ev.type);
      $timeout($mdToast.hide);
    });

    return $animate.enter(element, options.parent);
  }

  function onRemove(scope, element, options) {
    options.detachSwipe();
    options.parent.removeClass(toastOpenClass(options.position));
    return $animate.leave(element);
  }

  function toastOpenClass(position) {
    return 'md-toast-open-' +
      (position.indexOf('top') > -1 ? 'top' : 'bottom');
  }
}
