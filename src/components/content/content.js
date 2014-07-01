/**
 * @ngdoc overview
 * @name material.components.content
 *
 * @description
 * Scrollable content
 */
angular.module('material.components.content', [
  'material.services.registry'
])

.controller('$materialContentController', ['$scope', '$element', '$attrs', '$materialComponentRegistry', materialContentController])
.factory('$materialContent', ['$materialComponentRegistry', materialContentService])
.directive('materialContent', [materialContentDirective])

function materialContentController($scope, $element, $attrs, $materialComponentRegistry) {
  $materialComponentRegistry.register(this, $attrs.componentId || 'content');

  this.getElement = function() {
    return $element;
  };
}

function materialContentService($materialComponentRegistry) {
  return function(handle) {
    var instance = $materialComponentRegistry.get(handle);
    if(!instance) {
      $materialComponentRegistry.notFoundError(handle);
    }
    return instance
  }
}


function materialContentDirective() {
  return {
    restrict: 'E',
    transclude: true,
    template: '<div class="material-content" ng-transclude></div>',
    controller: '$materialContentController',
    link: function($scope, $element, $attr) {
    }
  }
}
