
angular.module('formDemo1', ['ngMaterial'])

.controller('AppCtrl', function($scope) {
  $scope.data = {
    i1 : "Field #1",
    i2 : "Field #2",
    i3 : "Field #3",
    i4 : "Field #4",
    i5 : "Field #5",
    i6 : "Field #6",
    i7 : "Field #7",
    i8 : "Field #8"
  };
})

.directive('ig', function() {
  return {
    restrict: 'E',
    replace: true,
    scope : {
      fid : '@',
      title : '=value'
    },
    template:
      '<material-input-group>' +
        '<label for="{{fid}}">Description</label>' +
        '<material-input id="{{fid}}" type="text" ng-model="title">' +
      '</material-input-group>'
  };
});
