angular.module('selectDemoBasic', ['ngMaterial'])
.controller('AppCtrl', function($scope) {
  $scope.neighborhoods = ['Chelsea', 'Financial District', 'Midtown', 'West Village', 'Williamsburg'];
  $scope.neighborhoods2 = ['Chelsea', 'Financial District', 'Lower Manhattan', 'Midtown', 'Soho', 'Upper Manhattan', 'West Village', 'Williamsburg' ];
});
