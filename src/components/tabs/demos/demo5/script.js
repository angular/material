
angular.module('app', ['ngMaterial', 'ngRoute'])

.config(function($routeProvider) {
  $routeProvider
    .when('/material', {
      templateUrl: 'material.tmpl.html',
      controller: 'MaterialTabCtrl'
    })
    .when('/angular', {
      templateUrl: 'angular.tmpl.html',
      controller: 'AngularTabCtrl'
    })
    .when('/polymer', {
      templateUrl: 'polymer.tmpl.html',
      controller: 'PolymerTabCtrl'
    })
    .otherwise({
      redirectTo: '/material'
    });
})

.controller('AppCtrl', function($scope, $location) {
  var tabs = $scope.tabs = [
    { path: '/material', label: 'Material Design' },
    { path: '/angular', label: 'Use Angular' },
    { path: '/polymer', label: 'Use Polymer' },
  ];

  $scope.selectedTabIndex = 0;
  $scope.$watch('selectedTabIndex', watchSelectedTab);
  
  function watchSelectedTab(index, oldIndex) {
    console.log('selecting from', oldIndex, 'to', index);
    $scope.reverse = index < oldIndex;
    $location.path(tabs[index].path);
  }

})

.controller('MaterialTabCtrl', function($scope) {
})

.controller('AngularTabCtrl', function($scope) {
})

.controller('PolymerTabCtrl', function($scope) {
});
