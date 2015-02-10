
angular.module('appUsingTemplateCache', ['ngMaterial'])
  .controller('DemoCtrl', function($scope) {})
  .config(function($mdIconProvider) {
    $mdIconProvider.iconSet('core', 'img/icons/sets/core-icons.svg')
                   .icon('social:cake', 'img/icons/cake.svg');
  })
  .run(function($http, $templateCache) {
    var urls = [
      'img/icons/sets/core-icons.svg',
      'img/icons/cake.svg',
      'img/icons/android.svg'
    ];
    // Pre-fetch and cache icons.
    angular.forEach(urls, function(url) {
      $http.get(url, {cache: $templateCache});
    })
  })
  ;
