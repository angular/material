/**
 * @ngdoc module
 * @name material.components.linearProgress
 * @description Linear Progress module!
 */
angular.module('material.components.linearProgress', [
  'material.animations',
  'material.services.aria'
])
  .directive('materialLinearProgress', ['$timeout', MaterialLinearProgressDirective]);

/**
 * @ngdoc directive
 * @name materialLinearProgress
 * @module material.components.linearProgress
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
 * <material-linear-progress mode="determinate" value="..."></material-linear-progress>
 *
 * <material-linear-progress mode="determinate" ng-value="..."></material-linear-progress>
 *
 * <material-linear-progress mode="indeterminate"></material-linear-progress>
 *
 * <material-linear-progress mode="buffer" value="..." secondaryValue="..."></material-linear-progress>
 *
 * <material-linear-progress mode="query"></material-linear-progress>
 * </hljs>
 */
function MaterialLinearProgressDirective($timeout) {
  return {
    restrict: 'E',
    template: '<div class="container">' +
      '<div class="dashed"></div>' +
      '<div class="bar bar1"></div>' +
      '<div class="bar bar2"></div>' +
      '</div>',
    compile: function compile(tElement, tAttrs, transclude) {
      tElement.attr('aria-valuemin', 0);
      tElement.attr('aria-valuemax', 100);
      tElement.attr('role', 'progressbar');

      return function(scope, element, attr) {
        var bar1Style = element[0].querySelector('.bar1').style,
            bar2Style = element[0].querySelector('.bar2').style,
            container = angular.element(element[0].querySelector('.container'));

        attr.$observe('value', function(value) {
          if(attr.mode == 'query'){
            return;
          }

          var clamped = clamp(value);
          element.attr('aria-valuenow', clamped);

          var transform =  transformTable[clamped];
          bar2Style.transform = transform;
          bar2Style.webkitTransform = transform;
        });

        attr.$observe('secondaryvalue', function(value) {
          var transform =  transformTable[clamp(value)];
          bar1Style.transform = transform;
          bar1Style.webkitTransform = transform;
        });

        $timeout(function() {
          container.addClass('ready');
        });
      }
    }
  };
}

// **********************************************************
// Private Methods
// **********************************************************

var transformTable = new Array(101);

for(var i = 0; i < 101; i++){
  transformTable[i] = makeTransform(i);
}

function makeTransform(value){
  var scale = value/100;
  var translateX = (value-100)/2;
  return 'translateX(' + translateX.toString() + '%) scale(' + scale.toString() + ', 1)';
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