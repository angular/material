/**
 * @ngdoc module
 * @name material.components.bottomSheet
 * @description
 * BottomSheet
 */
angular.module('material.components.bottomSheet', [
  'material.services.interimElement'
])
.directive('mdBottomSheet', [
  MdBottomSheetDirective
])
.factory('$mdBottomSheet', [
  '$$interimElement',
  '$animate',
  '$mdEffects',
  '$timeout',
  '$$rAF',
  MdBottomSheet
]);

function MdBottomSheetDirective() {
  return {
    restrict: 'E'
  };
}

/**
 * @ngdoc service
 * @name $mdBottomSheet
 * @module material.components.bottomSheet
 *
 * @description
 * `$mdBottomSheet` opens a bottom sheet over the app and provides a simple promise API.
 *
 * ### Restrictions
 * 
 * - The bottom sheet's template must have an outer `<md-bottom-sheet>` element.
 *
 * @usage
 * <hljs lang="html">
 * <div ng-controller="MyController">
 *   <md-button ng-click="openBottomSheet()">
 *     Open a Bottom Sheet!
 *   </md-button>
 * </div>
 * </hljs>
 * <hljs lang="js">
 * var app = angular.module('app', ['ngMaterial']);
 * app.controller('MyController', function($scope, $mdBottomSheet) {
 *   $scope.openBottomSheet = function() {
 *     $mdBottomSheet.show({
 *       template: '<md-bottom-sheet>Hello!</md-bottom-sheet>'
 *     });
 *   };
 * });
 * </hljs>
 */

 /**
 * @ngdoc method
 * @name $mdBottomSheet#show
 *
 * @description
 * Show a bottom sheet with the specified options.
 *
 * @param {object} options An options object, with the following properties:
 *
 *   - `templateUrl` - `{string=}`: The url of an html template file that will
 *   be used as the content of the bottom sheet. Restrictions: the template must
 *   have an outer `md-bottom-sheet` element.
 *   - `template` - `{string=}`: Same as templateUrl, except this is an actual
 *   template string.
 *   - `controller` - `{string=}`: The controller to associate with this bottom sheet.
 *   - `locals` - `{string=}`: An object containing key/value pairs. The keys will
 *   be used as names of values to inject into the controller. For example, 
 *   `locals: {three: 3}` would inject `three` into the controller with the value
 *   of 3.
 *   - `targetEvent` - `{DOMClickEvent=}`: A click's event object. When passed in as an option, 
 *   the location of the click will be used as the starting point for the opening animation
 *   of the the dialog.
 *   - `resolve` - `{object=}`: Similar to locals, except it takes promises as values
 *   and the bottom sheet will not open until the promises resolve.
 *   - `controllerAs` - `{string=}`: An alias to assign the controller to on the scope.
 *
 * @returns {promise} A promise that can be resolved with `$mdBottomSheet.hide()` or
 * rejected with `$mdBottomSheet.cancel()`.
 */

/**
 * @ngdoc method
 * @name $mdBottomSheet#hide
 *
 * @description
 * Hide the existing bottom sheet and resolve the promise returned from 
 * `$mdBottomSheet.show()`.
 *
 * @param {*=} response An argument for the resolved promise.
 *
 */

/**
 * @ngdoc method
 * @name $mdBottomSheet#cancel
 *
 * @description
 * Hide the existing bottom sheet and reject the promise returned from 
 * `$mdBottomSheet.show()`.
 *
 * @param {*=} response An argument for the rejected promise.
 *
 */

function MdBottomSheet($$interimElement, $animate, $mdEffects, $timeout, $$rAF) {
  var backdrop;

  var $mdBottomSheet;
  return $mdBottomSheet = $$interimElement({
    targetEvent: null,
    onShow: onShow,
    onRemove: onRemove,
  });

  function onShow(scope, element, options) {
    // Add a backdrop that will close on click
    backdrop = angular.element('<md-backdrop class="opaque ng-enter">');
    backdrop.on('click touchstart', function() {
      $timeout($mdBottomSheet.cancel);
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

    // coercion incase $mdCompiler returns multiple elements
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
      transitionDelay = element.css($mdEffects.TRANSITION_DURATION);
      element.css($mdEffects.TRANSITION_DURATION, '0s');
    }

    function onTouchEnd(e) {
      // Re-enable the transitions on transforms
      element.css($mdEffects.TRANSITION_DURATION, transitionDelay);

      var currentY = getY(e);
      // If we didn't scroll much, and we didn't change targets, assume its a click
      if ( Math.abs(currentY - startY) < 5  && e.target == startTarget) {
        angular.element(e.target).triggerHandler('click');
      } else {
        // If they went fast enough, trigger a close.
        if (velocity > CLOSING_VELOCITY) {
          $timeout($mdBottomSheet.cancel);

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
        element.css($mdEffects.TRANSFORM, '');
      } else {
        element.css($mdEffects.TRANSFORM, 'translate3d(0, ' + amt + 'px, 0)');
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
