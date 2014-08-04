/**
 * @ngdoc module
 * @name material.components.button
 *
 * @description
 * Button is CSS component.
 */
angular.module('material.components.button', [])
  .directive('materialButton', MaterialButtonDirective);

function MaterialButtonDirective() {
  return {
    restrict: 'E',
    transclude: true,
    template: '<material-ripple initial-opacity="0.25" opacity-decay-velocity="0.75"></material-ripple>',
    link: function(scope, element, attr, ctrl, transclude) {
      transclude(scope, function(clone) {
        element.append(clone);
      });
    }
  };
}
