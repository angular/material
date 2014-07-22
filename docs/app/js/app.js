var DocsApp = angular.module('docsApp', ['ngMaterial', 'ngRoute', 'angularytics'])

.config([
  'COMPONENTS',
  '$routeProvider',
function(COMPONENTS, $routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'template/home.tmpl.html'
  });
  $routeProvider.when('/layout/cells', {
    templateUrl: 'template/layout-cells.tmpl.html'
  });
  $routeProvider.when('/layout/grid', {
    templateUrl: 'template/layout-grid.tmpl.html'
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

.controller('DocsCtrl', [
  '$scope',
  'COMPONENTS',
  '$materialSidenav',
  '$timeout',
  '$location',
  '$rootScope',
  '$materialDialog',
function($scope, COMPONENTS, $materialSidenav, $timeout, $location, $rootScope, $materialDialog) {
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
  };

  $scope.goToComponent = function(component) {
    if (component) {
      $location.path( component.url );
      $materialSidenav('left').close();
    }
  };
  $scope.componentIsCurrent = function(component) {
    return component && $location.path() === component.url;
  };

  $scope.viewSource = function(component, $event) {
    $materialDialog({
      targetEvent: $event,
      controller: 'ViewSourceCtrl',
      locals: {
        demo: component.$selectedDemo
      },
      templateUrl: 'template/view-source.tmpl.html'
    });
  };
}])

.controller('HomeCtrl', [
  '$scope',
  '$rootScope',
function($scope, $rootScope) {
  $rootScope.appTitle = 'Material Design';
  $scope.setCurrentComponent({
    name: 'Material Design'
  });
}])

.controller('LayoutCtrl', [
  '$scope',
  '$rootScope',
  '$attrs',
function($scope, $rootScope, $attrs) {
  $rootScope.appTitle = $attrs.demoTitle;
  $scope.setCurrentComponent({
    name: $attrs.demoTitle
  });
}])

.controller('DocPageCtrl', [
  '$scope',
  'component',
  '$rootScope',
function($scope, component, $rootScope) {
  $rootScope.appTitle = 'Material: ' + component.name;
  component.showViewSource = true;

  $scope.setCurrentComponent(component);
  component.$selectedDemo = component.$selectedDemo ||
    component.demos[ Object.keys(component.demos)[0] ];
}])

.controller('ViewSourceCtrl', [
  '$scope',
  'demo',
  '$hideDialog',
function($scope, demo, $hideDialog) {
  $scope.files = [demo.indexFile].concat(demo.files.sort(sortByJs));
  $scope.$hideDialog = $hideDialog;

  $scope.data = {
    selectedFile: demo.indexFile
  };

  function sortByJs(file) {
    return file.fileType == 'js' ? -1 : 1;
  }
}])

;
