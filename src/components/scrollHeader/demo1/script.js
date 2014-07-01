angular.module('app', ['ngMaterial'])

.controller('AppCtrl', function($scope, $timeout, $materialSidenav) {
  $scope.toggleLeft = function() {
    $materialSidenav('left').toggle();
  }
})

.controller('LeftCtrl', function($scope, $materialSidenav) {
  $scope.close = function() {
    $materialSidenav('left').close();
  }
})

.controller('ListCtrl', function($scope, $materialSidenav) {
  $scope.toggleLeft = function() {
    $materialSidenav('left').toggle();
  }
})

.directive('driveItem', function() {
  return {
    restrict: 'E',
    templateUrl: 'drive-item.html'
  }
})

.directive('iconFill', function() {
  return {
    restrict: 'E',
    templateUrl: 'icon.html'
  }
})
