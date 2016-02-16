
angular.module('appUsingTemplateCache', ['ngMaterial'])
  .controller('DemoCtrl', function($scope) {})
  .config(function($mdIconProvider) {

    // Register icon IDs with sources. Future $mdIcon( <id> ) lookups
    // will load by url and retrieve the data via the $http and $templateCache

    $mdIconProvider
      .iconSet('core', 'img/icons/sets/core-icons.svg',24)
      .icon('social:cake', 'img/icons/cake.svg',24);

  })
  .run(function($http, $templateCache) {

    var urls = [
      'img/icons/sets/core-icons.svg',
      'img/icons/cake.svg',
      'img/icons/android.svg'
    ];

    // Pre-fetch icons sources by URL and cache in the $templateCache...
    // subsequent $http calls will look there first.

    angular.forEach(urls, function(url) {
      $http.get(url, {cache: $templateCache});
    });

  })
  ;
