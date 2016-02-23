"use strict";

/**
 * @ngdoc directive
 * @name mdProgressCircular
 * @module material.components.progressCircular
 * @restrict E
 *
 * @description
 * The circular progress directive is used to make loading content in your app as delightful and
 * painless as possible by minimizing the amount of visual change a user sees before they can view
 * and interact with content.
 *
 * For operations where the percentage of the operation completed can be determined, use a
 * determinate indicator. They give users a quick sense of how long an operation will take.
 *
 * For operations where the user is asked to wait a moment while something finishes up, and it’s
 * not necessary to expose what's happening behind the scenes and how long it will take, use an
 * indeterminate indicator.
 *
 * @param {string} md-mode Select from one of two modes: **'determinate'** and **'indeterminate'**.
 *
 * Note: if the `md-mode` value is set as undefined or specified as not 1 of the two (2) valid modes, then `.ng-hide`
 * will be auto-applied as a style to the component.
 *
 * Note: if not configured, the `md-mode="indeterminate"` will be auto injected as an attribute.
 * If `value=""` is also specified, however, then `md-mode="determinate"` would be auto-injected instead.
 * @param {number=} value In determinate mode, this number represents the percentage of the
 *     circular progress. Default: 0
 * @param {number=} md-diameter This specifies the diameter of the circular progress. The value
 * should be a pixel-size value (eg '100'). If this attribute is
 * not present then a default value of '50px' is assumed.
 *
 * @usage
 * <hljs lang="html">
 * <md-progress-circular md-mode="determinate" value="..."></md-progress-circular>
 *
 * <md-progress-circular md-mode="determinate" ng-value="..."></md-progress-circular>
 *
 * <md-progress-circular md-mode="determinate" value="..." md-diameter="100"></md-progress-circular>
 *
 * <md-progress-circular md-mode="indeterminate"></md-progress-circular>
 * </hljs>
 */

angular
  .module('material.components.progressCircular')
  .directive('mdProgressCircular', ['$window', '$$rAF', '$mdProgressCircular', MdProgressCircularDirective]);

function MdProgressCircularDirective($window, $$rAF, $mdProgressCircular) {
  var DEGREE_IN_RADIANS = $window.Math.PI / 180;

  return {
    restrict: 'E',
    scope: {
      value: '@',
      mdDiameter: '@'
    },
    template:
      '<svg xmlns="http://www.w3.org/2000/svg">' +
        '<path fill="none"/>' +
      '</svg>',
    compile: function(element){
      element.attr('aria-valuemin', 0);
      element.attr('aria-valuemax', 100);
      element.attr('role', 'progressbar');

      return MdProgressCircularLink;
    }
  };

  function MdProgressCircularLink(scope, element) {
    var svg = angular.element(element[0].querySelector('svg'));
    var path = angular.element(element[0].querySelector('path'));
    var lastAnimationId = 0;

    path.attr('stroke-width', $mdProgressCircular.strokeWidth + 'px');

    scope.$watchGroup(['value', 'mdDiameter'], function(newValue, oldValue) {
      var id = ++lastAnimationId;
      var startTime = new $window.Date();
      var animateTo = clamp(newValue[0]);
      var animateFrom = clamp(oldValue[0]);
      var changeInValue = animateTo - animateFrom;

      var animationDuration = $mdProgressCircular.animationDuration;
      var diameter = $window.parseFloat(newValue[1]) || $mdProgressCircular.progressSize;
      var pathDiameter = diameter - $mdProgressCircular.strokeWidth;

      element.attr('aria-valuenow', animateTo);

      svg.css({
        width: diameter + 'px',
        height: diameter + 'px'
      });

      // The viewBox has to be applied via setAttribute, because it is
      // case-sensitive. If jQuery is included in the page, `.attr` lowercases
      // all attribute names.
      svg[0].setAttribute('viewBox', '0 0 ' + diameter + ' ' + diameter);

      (function animation() {
        var currentTime = $window.Math.min(new $window.Date() - startTime, animationDuration);

        path.attr('d', getSvgArc(
          $mdProgressCircular.easeFn(currentTime, animateFrom, changeInValue, animationDuration),
          diameter,
          pathDiameter
        ));

        if (id === lastAnimationId && currentTime < animationDuration) {
          $$rAF(animation);
        }
      })();
    });
  }

  /**
   * Generates an arc following the SVG arc syntax.
   * Syntax spec: https://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands
   *
   * @param {number} current Current value between 0 and 100.
   * @param {number} diameter Diameter of the container.
   * @param {number} pathDiameter Diameter of the path element.
   * @param {number=0} startAtPercentage The point at which the semicircle should start rendering.
   * Used for doing the indeterminate animation.
   *
   * @returns {string} String representation of an SVG arc.
   */
  function getSvgArc(current, diameter, pathDiameter, startAtPercentage) {
    // The angle can't be exactly 360, because the arc becomes hidden.
    var largeArcFlag = current <= 50 ? 0 : 1;
    var maximumAngle = 359.99 / 100;
    var radius = diameter / 2;
    var pathRadius = pathDiameter / 2;
    var currentInDegrees;
    var arcSweep;
    var startAt;

    if(startAtPercentage){
      startAt = startAtPercentage*maximumAngle;
      currentInDegrees = startAt - (current*maximumAngle);
      arcSweep = 0;
    }else{
      startAt = 0;
      currentInDegrees = current*maximumAngle;
      arcSweep = 1;
    }

    var start = polarToCartesian(radius, pathRadius, startAt);
    var end = polarToCartesian(radius, pathRadius, currentInDegrees);

    return 'M' + start + 'A' + pathRadius + ',' + pathRadius +
      ' 0 ' + largeArcFlag + ',' + arcSweep + ' ' + end;
  }

  /**
   * Converts Polar coordinates to Cartesian.
   *
   * @param {number} radius Radius of the container.
   * @param {number} pathRadius Radius of the path element
   * @param {number} angleInDegress Angle at which to place the point.
   *
   * @returns {string} Cartesian coordinates in the format of `x,y`.
   */
  function polarToCartesian(radius, pathRadius, angleInDegrees) {
    var angleInRadians = (angleInDegrees - 90) * DEGREE_IN_RADIANS;

    return (radius + (pathRadius * $window.Math.cos(angleInRadians))) +
      ',' + (radius + (pathRadius * $window.Math.sin(angleInRadians)));
  }

  /**
   * Limits a value between 0 and 100.
   */
  function clamp(value) {
    return $window.Math.max(0, $window.Math.min(value || 0, 100));
  }
}
