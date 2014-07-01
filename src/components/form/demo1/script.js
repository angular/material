
angular.module('app', ['ngMaterial'])

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
    template: '<div class="material-input-group">' +
                '<label for="{{fid}}">Description</label>' +
                '<input id="{{fid}}" type="text" ng-model="data.description">' +
              '</div>',
  }
});