/**
 * @ngdoc module
 * @name material.components.progressCircular
 * @description Circular Progress module!
 */
angular.module('material.components.progressCircular', [
  'material.core'
])
  .directive('mdProgressCircular', MdProgressCircularDirective);

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
 * @param {string} md-mode Select from one of two modes: determinate and indeterminate.
 * @param {number=} value In determinate mode, this number represents the percentage of the
 *     circular progress. Default: 0
 * @param {number=} md-diameter This specifies the diamter of the circular progress. Default: 48
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
function MdProgressCircularDirective($mdConstant, $mdTheming) {
  return {
    restrict: 'E',
    template:
        // The progress 'circle' is composed of two half-circles: the left side and the right
        // side. Each side has CSS applied to 'fill-in' the half-circle to the appropriate progress.
        '<div class="md-spinner-wrapper">' +
          '<div class="md-inner">' +
            '<div class="md-gap"></div>' +
            '<div class="md-left">' +
              '<div class="md-half-circle"></div>' +
            '</div>' +
            '<div class="md-right">' +
              '<div class="md-half-circle"></div>' +
            '</div>' +
          '</div>' +
        '</div>',
    compile: compile
  };

  function compile(tElement) {
    // The javascript in this file is mainly responsible for setting the correct aria attributes.
    // The animation of the progress spinner is done entirely with just CSS.
    tElement.attr('aria-valuemin', 0);
    tElement.attr('aria-valuemax', 100);
    tElement.attr('role', 'progressbar');

    return postLink;
  }

  function postLink(scope, element, attr) {
    $mdTheming(element);
    var circle = element[0];

    // Scale the progress circle based on the default diameter.
    var diameter = attr.mdDiameter || 48;
    var scale = diameter / 48;
    circle.style[$mdConstant.CSS.TRANSFORM] = 'scale(' + scale + ')';

    attr.$observe('value', function(value) {
      var percentValue = clamp(value);
      element.attr('aria-valuenow', percentValue);
    });
  }

  /**
   * Clamps the value to be between 0 and 100.
   * @param {number} value The value to clamp.
   * @returns {number}
   */
  function clamp(value) {
    return Math.max(0, Math.min(value || 0, 100));
  }
}
