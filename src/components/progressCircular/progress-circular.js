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
 * @param {string} md-mode Select from one of two modes: **'determinate'** and **'indeterminate'**.<br/>
 * Note: if the `md-mode` value is undefined or not 1 of the two (2) valid modes, then `.ng-hide`
 * will be auto-applied as a style to the component.
 * @param {number=} value In determinate mode, this number represents the percentage of the
 *     circular progress. Default: 0
 * @param {number=} md-diameter This specifies the diamter of the circular progress. The value
 * may be a percentage (eg '25%') or a pixel-size value (eg '48'). If this attribute is
 * not present then a default value of '48px' is assumed.
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
function MdProgressCircularDirective($mdConstant, $mdTheming, $mdUtil) {
  var DEFAULT_PROGRESS_SIZE = 100;
  var DEFAULT_SCALING = 0.5;

  var MODE_DETERMINATE = "determinate",
      MODE_INDETERMINATE = "indeterminate";


  return {
    restrict: 'E',
    scope : true,
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
    var spinnerWrapper =  angular.element(element.children()[0]);

    var lastMode, toVendorCSS = $mdUtil.dom.animator.toCss;

    // Update size/scaling of the progress indicator
    // Watch the "value" and "md-mode" attributes

    circle.style[$mdConstant.CSS.TRANSFORM] = 'scale(' + getDiameterRatio() + ')';

    attr.$observe('value', function(value) {
      var percentValue = clamp(value);
      element.attr('aria-valuenow', percentValue);

      if (attr.mdMode == "determinate") {
        animateIndicator(percentValue);
      }
    });

    attr.$observe('mdMode',function(mode){
      switch( mode ) {
        case MODE_DETERMINATE:
        case MODE_INDETERMINATE:
          spinnerWrapper.removeClass('ng-hide');

          // Inject class selector instead of attribute selector
          // (@see layout.js changes for IE performance issues)

          if ( lastMode ) spinnerWrapper.removeClass( lastMode );
               lastMode = "md-mode-" + mode;
          if ( lastMode ) spinnerWrapper.addClass( lastMode );

          break;
        default:
          spinnerWrapper.addClass('ng-hide');
      }
    });

    var leftC, rightC, gap;

    /**
     * Manually animate the Determinate indicator based on the specified
     * percentage value (0-100).
     *
     * Note: this animation was previously done using SCSS.
     * - generated 54K of styles
     * - use attribute selectors which had poor performances in IE
     */
    function animateIndicator(value) {
      leftC  = leftC  || angular.element(element[0].querySelector('.md-left > .md-half-circle'));
      rightC = rightC || angular.element(element[0].querySelector('.md-right > .md-half-circle'));
      gap    = gap    || angular.element(element[0].querySelector('.md-gap'));

      var gapStyles = removeEmptyValues({
          borderBottomColor: (value <= 50) ? "transparent !important" : "",
          transition: (value <= 50) ? "" : "borderBottomColor 0.1s linear"
        }),
        leftStyles = removeEmptyValues({
          transition: (value <= 50) ? "transform 0.1s linear" : "",
          transform: $mdUtil.supplant("rotate({0}deg)", [value <= 50 ? 135 : ((((value - 50) / 50) * 180) + 135)])
        }),
        rightStyles = removeEmptyValues({
          transition: (value >= 50) ? "transform 0.1s linear" : "",
          transform: $mdUtil.supplant("rotate({0}deg)", [value >= 50 ? 45 : (value / 50 * 180 - 135)])
        });

      leftC.css(toVendorCSS(leftStyles));
      rightC.css(toVendorCSS(rightStyles));
      gap.css(toVendorCSS(gapStyles));

    }

    /**
     * We will scale the progress circle based on the default diameter.
     *
     * Determine the diameter percentage (defaults to 100%)
     * May be express as float, percentage, or integer
     */
    function getDiameterRatio() {
      if ( !attr.mdDiameter ) return DEFAULT_SCALING;

      var match = /([0-9]*)%/.exec(attr.mdDiameter);
      var value = Math.max(0, (match && match[1]/100) || parseFloat(attr.mdDiameter));

      // should return ratio; DEFAULT_PROGRESS_SIZE === 100px is default size
      return  (value > 1) ? value / DEFAULT_PROGRESS_SIZE : value;
    }
  }

  /**
   * Clamps the value to be between 0 and 100.
   * @param {number} value The value to clamp.
   * @returns {number}
   */
  function clamp(value) {
    return Math.max(0, Math.min(value || 0, 100));
  }

  function removeEmptyValues(target) {
    for (var key in target) {
      if (target.hasOwnProperty(key)) {
        if ( target[key] == "" ) delete target[key];
      }
    }

    return target;
  }
}
