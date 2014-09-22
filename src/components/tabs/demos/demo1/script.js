
angular.module('tabsDemo1', ['ngMaterial'] )
  .controller('AppCtrl', function( $scope ) {

    $scope.data = {
      selectedIndex: 0
    };
    $scope.locked = true;

  });
