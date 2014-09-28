/**
 * @ngdoc module
 * @name material.components.toast
 * @description
 * Toast
 */
angular.module('material.components.toast', [
  'material.services.interimElement'
  ])
  .directive('materialToast', [
    MaterialToastDirective
  ])
  .factory('$materialToast', [
    '$timeout',
    '$$interimElementFactory',
    '$animate',
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
 * Open a toast notification on any position on the screen, with an optional 
 * duration.
 *
 * Only one toast notification may ever be active at any time. If a new toast is
 * shown while a different toast is active, the old toast will be automatically
 * hidden.
 *
 * `$materialToast` is an $interimElement service and adheres to the same behaviors.
 *  It has a `show()`, `hide()` and `cancel()` function.
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
 *     $materialToast.show({
 *       template: '<material-toast>Hello!</material-toast>',
 *       hideTimeout: 3000
 *     });
 *   };
 * });
 * </hljs>
 *
 * @paramType Options
 * @param {string=} templateUrl The url of an html template file that will
 * be used as the content of the toast. Restrictions: the template must
 * have an outer `material-toast` element.
 * @param {string=} template Same as templateUrl, except this is an actual
 * template string.
 * @param {number=} hideTimeout How many milliseconds the toast should stay
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

function MaterialToastService($timeout, $$interimElementFactory, $animate) {

  var factoryDef = {
    onShow: onShow,
    onHide: onHide,
    position: 'bottom left',
    hideTimeout: 3000,
  };

  var $materialToast = $$interimElementFactory(factoryDef);
  return $materialToast;

  function onShow(scope, el, options) {
    el.addClass(options.position);
    options.parent.addClass(toastOpenClass(options.position));

    var hammertime = new Hammer(el[0], {
      recognizers: [
        [Hammer.Swipe, { direction: Hammer.DIRECTION_HORIZONTAL }]
      ]
    });

    el.data('hammertime', hammertime);

    hammertime.on('swipeleft swiperight', onSwipe);

    function onSwipe(ev) {
      //Add swipeleft/swiperight class to element so it can animate correctly
      element.addClass(ev.type);
      $timeout($materialToast.hide);
    }

    return $animate.enter(el, options.parent);
  }

  function onHide(scope, el, options) {
    var hammertime = el.data('hammertime');
    hammertime.destroy();
    el.data('hammertime', undefined);
    options.parent.removeClass(toastOpenClass(options.position));
    return $animate.leave(el);
  }

  function toastOpenClass(position) {
    return 'material-toast-open-' +
      (position.indexOf('top') > -1 ? 'top' : 'bottom');
  }
}
