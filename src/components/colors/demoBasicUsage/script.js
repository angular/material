angular.module('colorsDemo', ['ngMaterial'])
  .config(function ($mdThemingProvider, $mdIconProvider) {
    $mdThemingProvider.theme('forest')
      .primaryPalette('brown')
      .accentPalette('green');

    $mdIconProvider
      .defaultIconSet('img/icons/sets/social-icons.svg', 24);
  })
  .directive('regularCard', function () {
    return {
      restrict: 'E',
      templateUrl: 'regularCard.tmpl.html',
      scope: {
        name: '@',
      }
    }
  })
  .directive('userCard', function () {
    return {
      restrict: 'E',
      templateUrl: 'userCard.tmpl.html',
      scope: {
        name: '@',
        theme: '@'
      },
      controller: function ($scope) {
        $scope.theme = $scope.theme || 'default';
      }
    }
  });
