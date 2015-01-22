angular.module('selectDemoBasic', ['ngMaterial'])
.controller('AppCtrl', function($scope) {
  $scope.neighborhoods = ['Chelsea', 'Financial District', 'Midtown', 'West Village', 'Williamsburg'];
});
