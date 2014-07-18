
angular.module('app', ['ngMaterial'])

.controller('AppCtrl', function($scope, $timeout, $materialGesture) {
  var output = [];

  var pushMessage = function(msg) {
    output.push(msg);
  };

  $scope.drag = function(e) {
    output.push('DRAG', e.x, e.y);
  };
});
