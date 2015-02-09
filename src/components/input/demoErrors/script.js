angular.module('inputErrorsApp', ['ngMaterial', 'ngMessages'])

.controller('AppCtrl', function($scope) {
  $scope.project = {
    description: 'Nuclear Missile Defense System',
    clientName: 'Bill Clinton',
    rate: 500
  };
});
