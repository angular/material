angular
  .module('sidenavDemo2', ['ngMaterial'])
  .controller('AppCtrl', function ($scope, $timeout, $mdSidenav) {
    $scope.toggleLeft = buildToggler('left');
    $scope.toggleRight = buildToggler('right');

    $scope.isOpenRight = function(){
      return $mdSidenav('right').isOpen();
    };

    function buildToggler(navID) {
      return function() {
        $mdSidenav(navID).toggle()
      }
    }
  })
  .controller('LeftCtrl', function ($scope, $timeout, $mdSidenav) {
    $scope.close = function () {
      $mdSidenav('left').close();

    };
  })
  .controller('RightCtrl', function ($scope, $timeout, $mdSidenav) {
    $scope.close = function () {
      $mdSidenav('right').close();
    };
  });
