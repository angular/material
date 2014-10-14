/**
 * @ngdoc module
 * @name material.components.progressCircular
 * @description Circular Progress module!
 */
angular.module('material.components.progressCircular', [
  'material.animations',
  'material.services.aria'
])
  .directive('mdProgressCircular', [
    '$$rAF',
    '$mdEffects',
    MdProgressCircularDirective
  ]);

/**
 * @ngdoc directive
 * @name mdProgressCircular
 * @module material.components.progressCircular
 * @restrict E
 *
* @description
 * The circular progress directive is used to make loading content in your app as delightful and painless as possible by minimizing the amount of visual change a user sees before they can view and interact with content.
 *
 * For operations where the percentage of the operation completed can be determined, use a determinate indicator. They give users a quick sense of how long an operation will take.
 *
 * For operations where the user is asked to wait a moment while something finishes up, and it’s not necessary to expose what's happening behind the scenes and how long it will take, use an indeterminate indicator.
 *
 * @param {string} mode Select from one of two modes: determinate and indeterminate.
 * @param {number=} value In determinate mode, this number represents the percentage of the circular progress. Default: 0
 * @param {number=} diameter This specifies the diamter of the circular progress. Default: 48
 *
 * @usage
 * <hljs lang="html">
 * <md-progress-circular mode="determinate" value="..."></md-progress-circular>
 *
 * <md-progress-circular mode="determinate" ng-value="..."></md-progress-circular>
 *
 * <md-progress-circular mode="determinate" value="..." diameter="100"></md-progress-circular>
 *
 * <md-progress-circular mode="indeterminate"></md-progress-circular>
 * </hljs>
 */
function MdProgressCircularDirective($$rAF, $mdEffects) {
  var fillRotations = new Array(101),
    fixRotations = new Array(101);

  for (var i = 0; i < 101; i++) {
    var percent = i / 100;
    var rotation = Math.floor(percent * 180);

    fillRotations[i] = 'rotate(' + rotation.toString() + 'deg)';
    fixRotations[i] = 'rotate(' + (rotation * 2).toString() + 'deg)';
  }

  return {
    restrict: 'E',
    template: 
      '<div class="wrapper1"><div class="wrapper2"><div class="circle">' +
        '<div class="mask full">' +
          '<div class="fill"></div>' +
        '</div>' +
        '<div class="mask half">' +
          '<div class="fill"></div>' +
          '<div class="fill fix"></div>' +
        '</div>' +
        '<div class="shadow"></div>' +
      '</div>' +
      '<div class="inset"></div></div></div>',
    compile: compile
  };

  function compile(tElement, tAttrs, transclude) {
    tElement.attr('aria-valuemin', 0);
    tElement.attr('aria-valuemax', 100);
    tElement.attr('role', 'progressbar');

    return postLink;
  }

  function postLink(scope, element, attr) {
    var circle = element[0],
      fill = circle.querySelectorAll('.fill, .mask.full'),
      fix = circle.querySelectorAll('.fill.fix'),
      i, clamped, fillRotation, fixRotation;

    var diameter = attr.diameter || 48;
    var scale = diameter/48;

    circle.style[$mdEffects.TRANSFORM] = 'scale(' + scale.toString() + ')';

    attr.$observe('value', function(value) {
      clamped = clamp(value);
      fillRotation = fillRotations[clamped];
      fixRotation = fixRotations[clamped];

      element.attr('aria-valuenow', clamped);

      for (i = 0; i < fill.length; i++) {
        fill[i].style[$mdEffects.TRANSFORM] = fillRotation;
      }

      for (i = 0; i < fix.length; i++) {
        fix[i].style[$mdEffects.TRANSFORM] = fixRotation;
      }
    });
  }

  function clamp(value) {
    if (value > 100) {
      return 100;
    }

    if (value < 0) {
      return 0;
    }

    return Math.ceil(value || 0);
  }
}
