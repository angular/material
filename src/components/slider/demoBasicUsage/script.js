
angular.module('sliderDemo1', ['ngMaterial'])

.controller('AppCtrl', function($scope) {

  $scope.color = {
    red: Math.floor(Math.random() * 255),
    green: Math.floor(Math.random() * 255),
    blue: Math.floor(Math.random() * 255)
  };

  $scope.rating1 = $scope.rating2 = $scope.rating3 = 3;
  $scope.disabled1 = 0;
  $scope.disabled2 = 70;

});
