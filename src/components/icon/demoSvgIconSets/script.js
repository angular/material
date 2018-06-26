angular.module('appSvgIconSets', ['ngMaterial'])
  .controller('DemoCtrl', function($scope) {})
  .config(function($mdIconProvider) {
    $mdIconProvider
      .iconSet('social', 'img/icons/sets/social-icons.svg', 24)
      .iconSet('symbol', 'img/icons/sets/symbol-icons.svg', 24)
      .defaultIconSet('img/icons/sets/core-icons.svg', 24);
  });
