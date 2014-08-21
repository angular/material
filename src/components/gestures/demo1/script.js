
angular.module('app', ['ngMaterial'])

.controller('AppCtrl', function($scope, $timeout, $materialGesture) {
  $scope.output = [];

  $scope.g = function(type, e) {
    console.log(type);
    $scope.output.push({
      type: type,
      x: e.center.x,
      y: e.center.y,
      ts: +new Date
    });
  };
});
