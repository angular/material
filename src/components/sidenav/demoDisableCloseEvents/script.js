angular
  .module('disableCloseEventsSidenavDemo', ['ngMaterial'])
  .controller('AppCtrl', function ($scope, $mdSidenav) {
    $scope.toggleSidenav = buildToggler('closeEventsDisabled');

    function buildToggler(componentId) {
      return function() {
        $mdSidenav(componentId).toggle();
      };
    }
  });
