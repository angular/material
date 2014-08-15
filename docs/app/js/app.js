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

    angular.forEach(component.docs, function(doc) {
      $routeProvider.when(doc.url, {
        templateUrl: doc.outputPath,
        resolve: {
          component: function() { return component; },
          doc: function() { return doc; }
        },
        controller: 'ComponentDocCtrl'
      });
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

.factory('menu', [
  'COMPONENTS',
  '$location',
  '$rootScope',
function(COMPONENTS, $location, $rootScope) {
  var componentDocs = [];
  var demoDocs = [];
  COMPONENTS.forEach(function(component) {
    component.docs.forEach(function(doc) {
      if (doc.docType === 'readme') {
        demoDocs.push(doc);
      } else {
        componentDocs.push(doc);
      }
    });
  });
  var sections = [{ 
    name: 'Demos',
    pages: demoDocs
  }, {
    name: 'Layout',
    pages: [{
      name: 'Layout Grid',
      id: 'grid',
      url: '/layout/grid'
    }, {
      name: 'Layout Cells',
      id: 'cells',
      url: '/layout/cells'
    }],
  }, {
    name: 'Components',
    pages: componentDocs
  }];
  var self;

  $rootScope.$on('$locationChangeSuccess', onLocationChange);

  return self = {
    sections: sections,

    selectSection: function(section) {
      self.openedSection = section;
    },
    toggleSelectSection: function(section) {
      self.openedSection = (self.openedSection === section ? null : section);
    },
    isSectionSelected: function(section) {
      return self.openedSection === section;
    },

    selectPage: function(section, page) {
      page && page.url && $location.path(page.url);
      self.currentSection = section;
      self.currentPage = page;
    },
    isPageSelected: function(section, page) {
      return self.currentPage === page;
    }
  };

  function onLocationChange() {
    var path = $location.path();
    sections.forEach(function(section) {
      section.pages.forEach(function(page) {
        if (path === page.url) {
          self.selectSection(section);
          self.selectPage(section, page);
        }
      });
    });
  }
}])

.controller('DocsCtrl', [
  '$scope',
  'COMPONENTS',
  '$materialSidenav',
  '$timeout',
  '$materialDialog',
  'menu',
  '$location',
function($scope, COMPONENTS, $materialSidenav, $timeout, $materialDialog, menu, $location) {
  $scope.goToUrl = function(p) {
    window.location = p;
  };

  $scope.COMPONENTS = COMPONENTS;

  $scope.menu = menu;

  $scope.toggleMenu = function() {
    $timeout(function() {
      $materialSidenav('left').toggle();
    });
  };

  $scope.goHome = function($event) {
    menu.selectPage(null, null);
    $location.path( '/' );
  };

  $scope.viewSource = function(demo, $event) {
    $materialDialog({
      targetEvent: $event,
      controller: 'ViewSourceCtrl',
      locals: {
        demo: demo
      },
      templateUrl: 'template/view-source.tmpl.html'
    });
  };


  COMPONENTS.forEach(function(component) {
    component.demos && component.demos.forEach(function(demo) {
      demo.$files = [demo.indexFile].concat(
        demo.files.sort(sortByJs)
      );
      demo.$selectedFile = demo.indexFile;
    });
  });

  function sortByJs(file) {
    return file.fileType == 'js' ? -1 : 1;
  }
}])

.controller('HomeCtrl', [
  '$scope',
function($scope) {
}])

.controller('LayoutCtrl', [
  '$scope',
  '$attrs',
  '$location',
function($scope, $attrs, $location) {
}])

.controller('ComponentDocCtrl', [
  '$scope',
  'doc',
  'component',
  '$rootScope',
function($scope, doc, component, $rootScope) {
  $scope.currentComponent = component;
  $scope.doc = doc;
}])
;
