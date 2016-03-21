
angular.module('sliderDemo1', ['ngMaterial'])
  .config(function($mdIconProvider) {
    $mdIconProvider
      .iconSet('device', 'img/icons/sets/device-icons.svg', 24);
  })
.controller('AppCtrl', function($scope) {

  $scope.color = {
    red: Math.floor(Math.random() * 255),
    green: Math.floor(Math.random() * 255),
    blue: Math.floor(Math.random() * 255)
  };

  $scope.rating1 = 3;
  $scope.rating2 = 2;
  $scope.rating3 = 4;

  $scope.disabled1 = Math.floor(Math.random() * 100);
  $scope.disabled2 = 0;
  $scope.disabled3 = 70;

  $scope.invert = Math.floor(Math.random() * 100);

  $scope.isDisabled = true;
});
