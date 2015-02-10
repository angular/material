angular.module('selectDemoOptionsAsync', ['ngMaterial'])
.controller('SelectAsyncController', function($timeout, $scope) {

  $scope.loadUsers = function() {
    // Use timeout to simulate a 650ms request.
    $scope.users = [];
    return $timeout(function() {
      $scope.users = [
        { id: 1, name: 'Scooby Doo' },
        { id: 2, name: 'Shaggy Rodgers' },
        { id: 3, name: 'Fred Jones' },
        { id: 4, name: 'Daphne Blake' },
        { id: 5, name: 'Velma Dinkley' },
      ];
    }, 650);
  };
});
