
angular.module('appSvgIconSets', ['ngMaterial'])
  .controller('DemoCtrl', function($scope) {
    $scope.sizes = [12, 14, 16, 18, 21, 24, 36, 48, 60, 72];
    $scope.limit = 10;
    $scope.color = '#00bcd4';
    $scope.iconType = 'Font';
    $scope.loading = false;
  })
  .config(function($mdIconProvider) {
    $mdIconProvider.iconSet('social', 'img/icons/sets/social-icons.svg')
                   .defaultIconSet('img/icons/sets/core-icons.svg');
  });
