angular.module('buttonsDemoBasic', ['ngMaterial'])
.controller('AppCtrl', function($scope) {
  $scope.isDisabled = true;
  $scope.googleUrl = 'http://google.com';
});
