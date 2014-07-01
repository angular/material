
angular.module('app', ['ngMaterial'])

.controller('AppCtrl', function($scope, $timeout, $materialSidenav) {
  var leftNav;
  $timeout(function() {
    leftNav = $materialSidenav('left');
  });
  var rightNav;
  $timeout(function() {
    rightNav = $materialSidenav('right');
  });
  $scope.toggleLeft = function() {
    leftNav.toggle();
  };
  $scope.toggleRight = function() {
    rightNav.toggle();
  };
})

.controller('LeftCtrl', function($scope, $timeout, $materialSidenav) {
  var nav;
  $timeout(function() {
    nav = $materialSidenav('left');
  });
  $scope.close = function() {
    nav.close();
  };
})

.controller('RightCtrl', function($scope, $timeout, $materialSidenav) {
  var nav;
  $timeout(function() {
    nav = $materialSidenav('right');
  });
  $scope.close = function() {
    nav.close();
  };
});