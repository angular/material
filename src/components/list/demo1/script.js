
angular.module('app', ['ngMaterial'])

.controller('AppCtrl', function($scope) {

})

.directive('face', function() {
  return {
    restrict: 'E',
    template: '<img ng-src="{{face}}">',
    scope: true,
    link: function($scope, $element, $attr) {
      $scope.face = 'http://placekitten.com/40/40';
    }
  }
});
