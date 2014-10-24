
angular.module('app', ['ngMaterial'])

.controller('AppCtrl', function($scope) {
  $scope.data = {};
})

.directive('ig', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      fid: '@',
      disabled: '='
    },
    template: 
      '<material-input-group ng-disabled="{{disabled}}">' +
        '<label for="{{fid}}"><span ng-show="disabled">Disabled </span>Description</label>' +
        '<material-input id="{{fid}}" type="text" ng-model="data.description">' +
      '</material-input-group>'
  };
});
