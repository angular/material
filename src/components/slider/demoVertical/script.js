angular.module('sliderDemoVertical', ['ngMaterial'])
.controller('AppCtrl', function($scope) {
  $scope.vol = Math.floor(Math.random() * 100);
  $scope.bass = 40;
  $scope.master = 80;
});
