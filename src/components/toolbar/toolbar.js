/**
 * @ngdoc module
 * @name material.components.toolbar
 */
angular.module('material.components.toolbar', [
  'material.components.content'
])
  .directive('materialToolbar', [
    materialToolbarDirective
  ]);

/**
 * @ngdoc directive
 * @name materialToolbar
 * @restrict E
 * @description
 * `material-toolbar` is used to place a toolbar in your app.
 *
 * 
 *
 */ 
function materialToolbarDirective() {

  return {
    restrict: 'E',
  };

}
