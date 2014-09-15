
angular.module('sidenavDemo1', ['ngMaterial'])

.controller('AppCtrl', function($scope, $timeout, $materialSidenav) {
  $scope.toggleLeft = function() {
    $materialSidenav('left').toggle();
  };
  $scope.toggleRight = function() {
    $materialSidenav('right').toggle();
  };
})

.controller('LeftCtrl', function($scope, $timeout, $materialSidenav) {
  $scope.close = function() {
    $materialSidenav('left').close();
  };
})

.controller('RightCtrl', function($scope, $timeout, $materialSidenav) {
  $scope.close = function() {
    $materialSidenav('right').close();
  };
});
