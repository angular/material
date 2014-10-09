/**
 * @ngdoc module
 * @name material.components.bottomSheet
 * @description
 * BottomSheet
 */
angular.module('material.components.bottomSheet', [
  'material.services.interimElement'
])
.directive('materialBottomSheet', [
  MaterialBottomSheetDirective
])
.factory('$materialBottomSheet', [
  '$$interimElement',
  '$animate',
  '$materialEffects',
  '$timeout',
  '$$rAF',
  MaterialBottomSheet
]);

function MaterialBottomSheetDirective() {
  return {
    restrict: 'E'
  };
}

/**
 * @ngdoc service
 * @name $materialBottomSheet
 * @module material.components.bottomSheet
 *
 * @description

 * Used to open a bottom sheet on the screen, `$materialBottomSheet` is a service
 * created by `$$interimElement` and provides a simple promise-based, behavior API:
 *
 *  - `$materialBottomSheet.show()`
 *  - `$materialBottomSheet.hide()`
 *  - `$materialBottomSheet.cancel()`
 *
 * #### Notes:
 *
 * Only one bottom sheet may ever be active at any time. If a new sheet is
 * shown while a different one is active, the previous sheet will be automatically
 * hidden.

 * The bottom sheet's template must have an outer `<material-bottom-sheet>` element.
 *
 * @usage
 * <hljs lang="html">
 * <div ng-controller="MyController">
 *   <material-button ng-click="openBottomSheet()">
 *     Open a Bottom Sheet!
 *   </material-button>
 * </div>
 * </hljs>
 * <hljs lang="js">
 * var app = angular.module('app', ['ngMaterial']);
 * app.controller('MyController', function($scope, $materialBottomSheet) {
 *   $scope.openBottomSheet = function() {
 *     $materialBottomSheet.show({
 *       template: '<material-bottom-sheet>Hello!</material-bottom-sheet>'
 *     });
 *   };
 * });
 * </hljs>
 */

 /**
 * @ngdoc method
 * @name $materialBottomSheet#show
 *
 * @description
 * Show a bottom sheet with the specified options.
 *
 * @paramType Options
 * @param {string=} templateUrl The url of an html template file that will
 * be used as the content of the bottom sheet. Restrictions: the template must
 * have an outer `material-bottom-sheet` element.
 * @param {string=} template Same as templateUrl, except this is an actual
 * template string.
 * @param {string=} controller The controller to associate with this bottom sheet.
 * @param {string=} locals An object containing key/value pairs. The keys will
 * be used as names of values to inject into the controller. For example, 
 * `locals: {three: 3}` would inject `three` into the controller with the value
 * of 3.
 * @param {element=} parent The element to append the bottomSheet to. Defaults to appending
 * to the root element of the application.
 * @param {DOMClickEvent=} targetEvent A click's event object. When passed in as an option, 
 * the location of the click will be used as the starting point for the opening animation
 * of the the dialog.
 * @param {object=} resolve Similar to locals, except it takes promises as values
 * and the bottom sheet will not open until the promises resolve.
 * @param {string=} controllerAs An alias to assign the controller to on the scope.
 *
 * @returns {Promise} Returns a promise that will be resolved or rejected when
 *  `$materialBottomSheet.hide()` or `$materialBottomSheet.cancel()` is called respectively.
 */

/**
 * @ngdoc method
 * @name $materialBottomSheet#hide
 *
 * @description
 * Hide the existing bottom sheet and `resolve` the promise returned from 
 * `$materialBottomSheet.show()`.
 *
 * @param {*} arg An argument to resolve the promise with.
 *
 */

/**
 * @ngdoc method
 * @name $materialBottomSheet#cancel
 *
 * @description
 * Hide the existing bottom sheet and `reject` the promise returned from 
 * `$materialBottomSheet.show()`.
 *
 * @param {*} arg An argument to reject the promise with.
 *
 */

function MaterialBottomSheet($$interimElement, $animate, $materialEffects, $timeout, $$rAF) {
  var backdrop;

  var $materialBottomSheet = $$interimElement({
    targetEvent: null,
    onShow: onShow,
    onRemove: onRemove,
  });

  return $materialBottomSheet;

  function onShow(scope, element, options) {
    // Add a backdrop that will close on click
    backdrop = angular.element('<material-backdrop class="opaque ng-enter">');
    backdrop.on('click touchstart', function() {
      $timeout($materialBottomSheet.cancel);
    });

    $animate.enter(backdrop, options.parent, null);

    var bottomSheet = new BottomSheet(element);
    options.bottomSheet = bottomSheet;

    // Give up focus on calling item
    options.targetEvent && angular.element(options.targetEvent.target).blur();

    return $animate.enter(bottomSheet.element, options.parent);

  }

  function onRemove(scope, element, options) {
    var bottomSheet = options.bottomSheet;
    $animate.leave(backdrop);
    return $animate.leave(bottomSheet.element).then(function() {
      bottomSheet.cleanup();

      // Restore focus
      options.targetEvent && angular.element(options.targetEvent.target).focus();
    });
  }

  /**
   * BottomSheet class to apply bottom-sheet behavior to an element
   */
  function BottomSheet(element) {
    var MAX_OFFSET = 80; // amount past the bottom of the element that we can drag down, this is same as in _bottomSheet.scss
    var WIGGLE_AMOUNT = 20; // point where it starts to get "harder" to drag
    var CLOSING_VELOCITY = 10; // how fast we need to flick down to close the sheet
    var startY, lastY, velocity, transitionDelay, startTarget;

    // coercion incase $materialCompiler returns multiple elements
    element = element.eq(0);

    element.on('touchstart', onTouchStart);
    element.on('touchmove', onTouchMove);
    element.on('touchend', onTouchEnd);

    return {
      element: element,
      cleanup: function cleanup() {
        element.off('touchstart', onTouchStart);
        element.off('touchmove', onTouchMove);
        element.off('touchend', onTouchEnd);
      }
    };

    function onTouchStart(e) {
      e.preventDefault();
      startTarget = e.target;
      startY = getY(e);
      
      // Disable transitions on transform so that it feels fast
      transitionDelay = element.css($materialEffects.TRANSITION_DURATION);
      element.css($materialEffects.TRANSITION_DURATION, '0s');
    }

    function onTouchEnd(e) {
      // Re-enable the transitions on transforms
      element.css($materialEffects.TRANSITION_DURATION, transitionDelay);

      var currentY = getY(e);
      // If we didn't scroll much, and we didn't change targets, assume its a click
      if ( Math.abs(currentY - startY) < 5  && e.target == startTarget) {
        angular.element(e.target).triggerHandler('click');
      } else {
        // If they went fast enough, trigger a close.
        if (velocity > CLOSING_VELOCITY) {
          $timeout($materialBottomSheet.cancel);

        // Otherwise, untransform so that we go back to our normal position
        } else {
          setTransformY(undefined);
        }
      }
    }

    function onTouchMove(e) {
      var currentY = getY(e);
      var delta = currentY - startY;

      velocity = currentY - lastY;
      lastY = currentY;
      
      // Do some conversion on delta to get a friction-like effect
      delta = adjustedDelta(delta);
      setTransformY(delta + MAX_OFFSET);
    }

    /**
     * Helper function to find the Y aspect of various touch events.
     **/
    function getY(e) {
      var touch = e.touches && e.touches.length ? e.touches[0] : e.changedTouches[0];
      return touch.clientY;
    }

    /**
     * Transform the element along the y-axis
     **/
    function setTransformY(amt) {
      if (amt === null || amt === undefined) {
        element.css($materialEffects.TRANSFORM, '');
      } else {
        element.css($materialEffects.TRANSFORM, 'translate3d(0, ' + amt + 'px, 0)');
      }
    }

    // Returns a new value for delta that will never exceed MAX_OFFSET_AMOUNT
    // Will get harder to exceed it as you get closer to it
    function adjustedDelta(delta) {
      if ( delta < 0  && delta < -MAX_OFFSET + WIGGLE_AMOUNT) {
        delta = -delta;
        var base = MAX_OFFSET - WIGGLE_AMOUNT;
        delta = Math.max(-MAX_OFFSET, -Math.min(MAX_OFFSET - 5, base + ( WIGGLE_AMOUNT * (delta - base)) / MAX_OFFSET) - delta / 50);
      }

      return delta;
    }
  }

}
