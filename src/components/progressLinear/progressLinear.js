/**
 * @ngdoc module
 * @name material.components.progressLinear
 * @description Linear Progress module!
 */
angular.module('material.components.progressLinear', [
  'material.animations',
  'material.services.aria'
])
.directive('mdProgressLinear', [
  '$$rAF', 
  '$mdEffects',
  MdProgressLinearDirective
]);

/**
 * @ngdoc directive
 * @name mdProgressLinear
 * @module material.components.progressLinear
 * @restrict E
 *
 * @description
 * The linear progress directive is used to make loading content in your app as delightful and painless as possible by minimizing the amount of visual change a user sees before they can view and interact with content. Each operation should only be represented by one activity indicator—for example, one refresh operation should not display both a refresh bar and an activity circle.
 *
 * For operations where the percentage of the operation completed can be determined, use a determinate indicator. They give users a quick sense of how long an operation will take.
 *
 * For operations where the user is asked to wait a moment while something finishes up, and it’s not necessary to expose what's happening behind the scenes and how long it will take, use an indeterminate indicator.
 *
 * @param {string} mode Select from one of four modes: determinate, indeterminate, buffer or query.
 * @param {number=} value In determinate and buffer modes, this number represents the percentage of the primary progress bar. Default: 0
 * @param {number=} secondaryValue In the buffer mode, this number represents the precentage of the secondary progress bar. Default: 0
 *
 * @usage
 * <hljs lang="html">
 * <md-progress-linear mode="determinate" value="..."></md-progress-linear>
 *
 * <md-progress-linear mode="determinate" ng-value="..."></md-progress-linear>
 *
 * <md-progress-linear mode="indeterminate"></md-progress-linear>
 *
 * <md-progress-linear mode="buffer" value="..." secondaryValue="..."></md-progress-linear>
 *
 * <md-progress-linear mode="query"></md-progress-linear>
 * </hljs>
 */
function MdProgressLinearDirective($$rAF, $mdEffects) {

  return {
    restrict: 'E',
    template: '<div class="container">' +
      '<div class="dashed"></div>' +
      '<div class="bar bar1"></div>' +
      '<div class="bar bar2"></div>' +
      '</div>',
    compile: compile
  };
  
  function compile(tElement, tAttrs, transclude) {
    tElement.attr('aria-valuemin', 0);
    tElement.attr('aria-valuemax', 100);
    tElement.attr('role', 'progressbar');

    return postLink;
  }
  function postLink(scope, element, attr) {
    var bar1Style = element[0].querySelector('.bar1').style,
      bar2Style = element[0].querySelector('.bar2').style,
      container = angular.element(element[0].querySelector('.container'));

    attr.$observe('value', function(value) {
      if (attr.mode == 'query') {
        return;
      }

      var clamped = clamp(value);
      element.attr('aria-valuenow', clamped);
      bar2Style[$mdEffects.TRANSFORM] = progressLinearTransforms[clamped];
    });

    attr.$observe('secondaryvalue', function(value) {
      bar1Style[$mdEffects.TRANSFORM] = progressLinearTransforms[clamp(value)];
    });

    $$rAF(function() {
      container.addClass('ready');
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


// **********************************************************
// Private Methods
// **********************************************************
var progressLinearTransforms = (function() {
  var values = new Array(101);
  for(var i = 0; i < 101; i++){
    values[i] = makeTransform(i);
  }

  return values;

  function makeTransform(value){
    var scale = value/100;
    var translateX = (value-100)/2;
    return 'translateX(' + translateX.toString() + '%) scale(' + scale.toString() + ', 1)';
  }
})();
