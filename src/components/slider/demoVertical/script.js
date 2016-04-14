
angular.module('sliderDemo2', ['ngMaterial'])

.controller('AppCtrl', function($scope) {

  $scope.vol = Math.floor(Math.random() * 100);
  $scope.bass = Math.floor(Math.random() * 100);
  $scope.master = Math.floor(Math.random() * 100);
});
