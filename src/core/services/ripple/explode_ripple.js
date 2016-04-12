angular.module('material.core')
    .directive('mdInkExplode', InkExplodeRippleDirective);


/**
 * @ngdoc directive
 * @name mdInkExplode
 * @module material.core
 *
 * @description
 * The `md-ink-explode` directive allows you to specify a different container for the ripple to take place in when the
 * element that this directive is on is clicked. This can be used for transitions to another state.
 *
 * @param {string} md-ink-explode A DOM selector for the container to be passed to QuerySelector()
 * @param {number} md-ink-explode-duration The duration of the explode from start to finish
 * @param {string} md-ink-explode-color A hex, rgb or rgba color string
 *
 * @usage
 * ### String values
 * <hljs lang="html">
 *   <ANY id="rippleContainer">
 *       <ANY md-ink-ripple="#FF0000" md-ink-explode="#rippleContainer">
 *         Ripples in red
 *       </ANY>
 *   </ANY>
 *
 *   <ANY id="rippleContainer">
 *       <ANY md-ink-ripple='#0000FF' md-ink-explode-color="#FF0000" md-ink-explode="#rippleContainer">
 *         Both types of ripple
 *       </ANY>
 *   </ANY>
 *
 *   <ANY md-ink-explode="false">
 *     Not rippling
 *   </ANY>
 * </hljs>
 *
 * ### Interpolated values
 * <hljs lang="html">
 *   <ANY md-ink-explode-color="{{ randomColor() }}">
 *     Ripples with the return value of 'randomColor' function
 *   </ANY>
 *
 *   <ANY md-ink-ripple="{{ canRipple() }}">
 *     Ripples if 'canRipple' function return value is not 'false' or '0'
 *   </ANY>
 * </hljs>
 */
function InkExplodeRippleDirective ($mdInkRipple) {
  return {
    controller: angular.noop,
    link:       function (scope, element, attr) {
      $mdInkRipple.attach(scope, angular.element(element), {
        center:        false,
        dimBackground: false,
        fitRipple:     false,
        duration:      parseInt(attr.mdInkExplodeDuration) || 1000,
        inkExplode:    true
      });
    }
  }
}