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
    link: function(scope, element, attr) {
      var bar1 = angular.element(element[0].querySelector('.bar1')),
          bar2 = angular.element(element[0].querySelector('.bar2')),
          container = angular.element(element[0].querySelector('.container'));

      attr.$observe('value', function(value) {
        bar2.css('width', clamp(value).toString() + '%');
      });

      attr.$observe('secondaryvalue', function(value) {
        bar1.css('width', clamp(value).toString() + '%');
      });

      $timeout(function() {
        container.addClass('ready');
      });
    }
  };
}

// **********************************************************
// Private Methods
// **********************************************************

function clamp(value) {
  if (value > 100) {
    return 100;
  }

  if (value < 0) {
    return 0;
  }

  return value || 0;
}