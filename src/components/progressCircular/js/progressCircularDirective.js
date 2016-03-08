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
 * Note: if the `md-mode` value is set as undefined or specified as not 1 of the two (2) valid modes, then **'indeterminate'**
 * will be auto-applied as the mode.
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
  .directive('mdProgressCircular', [
    '$$rAF',
    '$window',
    '$mdProgressCircular',
    '$mdUtil',
    '$interval',
    '$log',
    MdProgressCircularDirective
  ]);

function MdProgressCircularDirective($$rAF, $window, $mdProgressCircular, $mdUtil, $interval, $log) {
  var DEGREE_IN_RADIANS = $window.Math.PI / 180;
  var MODE_DETERMINATE = 'determinate';
  var MODE_INDETERMINATE = 'indeterminate';

  return {
    restrict: 'E',
    scope: {
      value: '@',
      mdDiameter: '@',
      mdMode: '@'
    },
    template:
      '<svg xmlns="http://www.w3.org/2000/svg">' +
        '<path fill="none"/>' +
      '</svg>',
    compile: function(element, attrs) {
      element.attr({
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        'role': 'progressbar'
      });

      if (angular.isUndefined(attrs.mdMode)) {
        var hasValue = angular.isDefined(attrs.value);
        var mode = hasValue ? MODE_DETERMINATE : MODE_INDETERMINATE;
        var info = "Auto-adding the missing md-mode='{0}' to the ProgressCircular element";

        $log.debug( $mdUtil.supplant(info, [mode]) );
        attrs.$set('mdMode', mode);
      } else {
        attrs.$set('mdMode', attrs.mdMode.trim());
      }

      return MdProgressCircularLink;
    }
  };

  function MdProgressCircularLink(scope, element, attrs) {
    var svg = angular.element(element[0].querySelector('svg'));
    var path = angular.element(element[0].querySelector('path'));
    var startIndeterminate = $mdProgressCircular.startIndeterminate;
    var endIndeterminate = $mdProgressCircular.endIndeterminate;
    var rotationIndeterminate = 0;
    var lastAnimationId = 0;
    var interval;

    scope.$watchGroup(['value', 'mdMode'], function(newValues, oldValues) {
      var mode = newValues[1];

      if (mode !== MODE_DETERMINATE && mode !== MODE_INDETERMINATE) {
        mode = MODE_INDETERMINATE;
        attrs.$set('mdMode', mode);
      }

      if (mode === MODE_INDETERMINATE) {
        startIndeterminateAnimation();
      } else {
        var newValue = clamp(newValues[0]);

        cleanupIndeterminateAnimation();
        element.attr('aria-valuenow', newValue);
        renderCircle(clamp(oldValues[0]), newValue);
      }

    });

    // This is in a separate watch in order to avoid layout, unless
    // the value has actually changed.
    scope.$watch('mdDiameter', function(newValue) {
      var diameter = getSize(newValue);
      var strokeWidth = getStroke(diameter);
      var dimensions = {
        width: diameter + 'px',
        height: diameter + 'px'
      };

      // The viewBox has to be applied via setAttribute, because it is
      // case-sensitive. If jQuery is included in the page, `.attr` lowercases
      // all attribute names.
      svg[0].setAttribute('viewBox', '0 0 ' + diameter + ' ' + diameter);

      // Usually viewBox sets the dimensions for the SVG, however that doesn't
      // seem to be the case on IE10.
      svg.css(dimensions);
      element.css(dimensions);
      path.css('stroke-width',  strokeWidth + 'px');
    });

    function renderCircle(animateFrom, animateTo, easing, duration, rotation) {
      var id = ++lastAnimationId;
      var startTime = getTimestamp();
      var changeInValue = animateTo - animateFrom;
      var diameter = getSize(scope.mdDiameter);
      var pathDiameter = diameter - getStroke(diameter);
      var ease = easing || $mdProgressCircular.easeFn;
      var animationDuration = duration || $mdProgressCircular.duration;

      // No need to animate it if the values are the same
      if (animateTo === animateFrom) {
        path.attr('d', getSvgArc(animateTo, diameter, pathDiameter, rotation));
      } else {
        $$rAF(function animation(now) {
          var currentTime = (now || getTimestamp()) - startTime;

          path.attr('d', getSvgArc(
            ease(currentTime, animateFrom, changeInValue, animationDuration),
            diameter,
            pathDiameter,
            rotation
          ));

          if (id === lastAnimationId && currentTime < animationDuration) {
            $$rAF(animation);
          }
        });
      }
    }

    function animateIndeterminate() {
      renderCircle(
        startIndeterminate,
        endIndeterminate,
        $mdProgressCircular.easeFnIndeterminate,
        $mdProgressCircular.durationIndeterminate,
        rotationIndeterminate
      );

      // The % 100 technically isn't necessary, but it keeps the rotation
      // under 100, instead of becoming a crazy large number.
      rotationIndeterminate = (rotationIndeterminate + endIndeterminate) % 100;

      var temp = startIndeterminate;
      startIndeterminate = -endIndeterminate;
      endIndeterminate = -temp;
    }

    function startIndeterminateAnimation() {
      if (!interval) {
        var startTime = getTimestamp();
        var animationDuration = $mdProgressCircular.rotationDurationIndeterminate;
        var radius = getSize(scope.mdDiameter) / 2;

        // Spares us at least a little bit of string concatenation.
        radius = ' ' + radius + ', ' + radius;

        // This animates the indeterminate rotation. This can be achieved much easier
        // with CSS keyframes, however IE11 seems to have problems centering the rotation
        // which causes a wobble in the indeterminate animation.
        $$rAF(function animation(now) {
          var timestamp = now || getTimestamp();
          var currentTime = timestamp - startTime;
          var rotation = $mdProgressCircular.easingPresets.linearEase(currentTime, 0, 360, animationDuration);

          path.attr('transform', 'rotate(' + rotation + radius + ')');

          if (interval) {
            $$rAF(animation);
          } else {
            path.removeAttr('transform');
          }

          // Reset the animation
          if (currentTime >= animationDuration) {
            startTime = timestamp;
          }
        });

        // Note that this interval isn't supposed to trigger a digest.
        interval = $interval(
          animateIndeterminate,
          $mdProgressCircular.durationIndeterminate + 50,
          0,
          false
        );

        animateIndeterminate();
        element.removeAttr('aria-valuenow');
      }
    }

    function cleanupIndeterminateAnimation() {
      if (interval) {
        $interval.cancel(interval);
        interval = null;
      }
    }
  }

  /**
   * Generates an arc following the SVG arc syntax.
   * Syntax spec: https://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands
   *
   * @param {number} current Current value between 0 and 100.
   * @param {number} diameter Diameter of the container.
   * @param {number} pathDiameter Diameter of the path element.
   * @param {number=0} rotation The point at which the semicircle should start rendering.
   * Used for doing the indeterminate animation.
   *
   * @returns {string} String representation of an SVG arc.
   */
  function getSvgArc(current, diameter, pathDiameter, rotation) {
    // The angle can't be exactly 360, because the arc becomes hidden.
    var maximumAngle = 359.99 / 100;
    var startPoint = rotation || 0;
    var radius = diameter / 2;
    var pathRadius = pathDiameter / 2;

    var startAngle = startPoint * maximumAngle;
    var endAngle = current * maximumAngle;
    var start = polarToCartesian(radius, pathRadius, startAngle);
    var end = polarToCartesian(radius, pathRadius, endAngle + startAngle);
    var arcSweep = endAngle < 0 ? 0 : 1;
    var largeArcFlag;

    if (endAngle < 0) {
      largeArcFlag = endAngle >= -180 ? 0 : 1;
    } else {
      largeArcFlag = endAngle <= 180 ? 0 : 1;
    }

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

  /**
   * Determines the size of a progress circle, based on the provided
   * value in the following formats: `X`, `Ypx`, `Z%`.
   */
  function getSize(value) {
    var defaultValue = $mdProgressCircular.progressSize;

    if (value) {
      var parsed = parseFloat(value);

      if (value.lastIndexOf('%') === value.length - 1) {
        parsed = (parsed / 100) * defaultValue;
      }

      return parsed;
    }

    return defaultValue;
  }

  /**
   * Determines the circle's stroke width, based on
   * the provided diameter.
   */
  function getStroke(diameter) {
    return $mdProgressCircular.strokeWidth / 100 * diameter;
  }

  /**
   * Retrieves a timestamp for timing animations.
   */
  function getTimestamp() {
    var perf = $window.performance;
    return perf && perf.now && perf.now() || +new $window.Date();
  }
}
