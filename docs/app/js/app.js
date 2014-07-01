var DocsApp = angular.module('docsApp', ['ngMaterial', 'ngRoute'])

.config([
  'COMPONENTS',
  '$routeProvider',
function(COMPONENTS, $routeProvider) {

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

}])

.controller('DocsCtrl', [
  '$scope',
  'COMPONENTS',
  '$materialSidenav',
  '$timeout',
  '$location',
function($scope, COMPONENTS, $materialSidenav, $timeout, $location) {
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

  $scope.goToComponent = function(component) {
    $location.path(component.url);
    $materialSidenav('left').close();
  };
  $scope.componentIsCurrent = function(component) {
    return $location.path() === component.url;
  };
}])

.controller('DocPageCtrl', [
  '$scope',
  'component',
function($scope, component) {
  document.title = component.name;

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

;
