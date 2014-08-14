angular.module('material.components.toolbar', [
  'material.components.content'
])
  .directive('materialToolbar', [
    materialToolbarDirective
  ]);

function materialToolbarDirective() {

  return {
    restrict: 'E',
  };

}
