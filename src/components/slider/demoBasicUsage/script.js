
angular.module('sliderDemo1', ['ngMaterial'])

.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('altTheme')
    .primaryPalette('blue')
    .accentPalette('green')
    .warnPalette('red');
  $mdThemingProvider.setDefaultTheme('altTheme');
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

  $scope.disabled1 = 0;
  $scope.disabled2 = 70;
});
