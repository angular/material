
angular.module('appSvgIconSets', ['ngMaterial'])
  .controller('DemoCtrl', function($scope) {})
  .config(function($mdIconProvider) {
    $mdIconProvider.iconSet('social', 'img/icons/sets/social-icons.svg')
                   .defaultIconSet('img/icons/sets/core-icons.svg');
  });
