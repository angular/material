var DocsApp = angular.module('docsApp', ['ngMaterial', 'ngRoute', 'angularytics'])

.config([
  'COMPONENTS',
  '$routeProvider',
function(COMPONENTS, $routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'home.tmpl.html'
  });

  angular.forEach(COMPONENTS, function(component) {
    component.url = '/component/' + component.id;
    $routeProvider.when(component.url, {
      templateUrl: component.outputPath,
      resolve: {
        component: function() { return component; }
      },
      controller: 'DocPageCtrl'
    });
  });

  $routeProvider.otherwise('/');

}])

.config(['AngularyticsProvider',
function(AngularyticsProvider) {
  AngularyticsProvider.setEventHandlers(['Console', 'GoogleUniversal']);
}])

.run([
  'Angularytics',
  '$rootScope',
function(Angularytics, $rootScope) {
  Angularytics.init();
}])

.controller('HomeCtrl', [
  '$rootScope',
function($rootScope) {
  $rootScope.appTitle = 'Material Design';
}])

.controller('DocsCtrl', [
  '$scope',
  'COMPONENTS',
  '$materialSidenav',
  '$timeout',
  '$location',
  '$rootScope',
function($scope, COMPONENTS, $materialSidenav, $timeout, $location, $rootScope) {
  $scope.COMPONENTS = COMPONENTS;

  document.querySelector('.sidenav-content')
  .addEventListener('click', function(e) {
    if ($materialSidenav('left').isOpen()) {
      e.preventDefault();
      e.stopPropagation();
      $timeout(function() {
        $materialSidenav('left').close();
      });
    }
  });


  $scope.setCurrentComponent = function(component) {
    $scope.currentComponent = component;
  };

  $scope.toggleMenu = function() {
    $timeout(function() {
      $materialSidenav('left').toggle();
    });
  };

  $scope.goHome = function($event) {
    $location.path( '/' );
    $scope.setCurrentComponent({});
  }

  $scope.goToComponent = function(component) {
    $location.path( component.url );
    $materialSidenav('left').close();
  };
  $scope.componentIsCurrent = function(component) {
    return $location.path() === component.url;
  };
}])

.controller('DocPageCtrl', [
  '$scope',
  'component',
  '$rootScope',
function($scope, component, $rootScope) {
  $rootScope.appTitle = 'Material: ' + component.name;

  $scope.setCurrentComponent(component);

  $scope.demos = [];
  angular.forEach(component.demos, function(demo) {
    $scope.demos.push(demo);
  });
  component.$selectedDemoIndex = component.$selectedDemoIndex || 0;

  $scope.openDemo = function(demoPath) {
    window.open('http://' + window.location.host + '/' + demoPath);
  };

  $scope.demoSource = function(demoPath) {
    window.open('view-source:' + window.location.host + '/' + demoPath);
  };

}])

