
angular.module('formDemo1', ['ngMaterial'])

.controller('AppCtrl', function($scope) {
  $scope.data = {};
})

.directive('ig', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      fid: '@'
    },
    template: 
      '<material-input-group>' +
        '<label for="{{fid}}">Description</label>' +
        '<material-input id="{{fid}}" type="text" ng-model="data.description">' +
      '</material-input-group>'
  };
});
