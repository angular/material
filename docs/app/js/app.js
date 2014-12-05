var DocsApp = angular.module('docsApp', ['ngMaterial', 'ngRoute', 'angularytics'])

.config([
  'COMPONENTS',
  'DEMOS',
  'PAGES',
  '$routeProvider',
  '$mdThemingProvider',
function(COMPONENTS, DEMOS, PAGES, $routeProvider, $mdThemingProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'partials/home.tmpl.html'
    })
    .when('/layout/:tmpl', {
      templateUrl: function(params){
        return 'partials/layout-' + params.tmpl + '.tmpl.html';
      }
    });


  $mdThemingProvider.theme('docs-dark', 'default')
    .dark();

  angular.forEach(PAGES, function(pages, area) {
    angular.forEach(pages, function(page) {
      $routeProvider
        .when(page.url, {
          templateUrl: page.outputPath,
          controller: 'GuideCtrl'
        });
    });
  });

  angular.forEach(COMPONENTS, function(component) {
    angular.forEach(component.docs, function(doc) {
      doc.url = '/' + doc.url;
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

  angular.forEach(DEMOS, function(componentDemos) {
    var demoComponent;
    angular.forEach(COMPONENTS, function(component) {
      if (componentDemos.name === component.name) {
        demoComponent = component;
      }
    });
    demoComponent = demoComponent || angular.extend({}, componentDemos);
    $routeProvider.when(componentDemos.url, {
      templateUrl: 'partials/demo.tmpl.html',
      controller: 'DemoCtrl',
      resolve: {
        component: function() { return demoComponent; },
        demos: function() { return componentDemos.demos; }
      }
    });
  });

  $routeProvider.otherwise('/');
}])

.config(['AngularyticsProvider', function(AngularyticsProvider) {
   AngularyticsProvider.setEventHandlers(['Console', 'GoogleUniversal']);
}])

.run([
   'Angularytics',
   '$rootScope',
    '$timeout',
function(Angularytics, $rootScope,$timeout) {
  Angularytics.init();
}])

.factory('menu', [
  'COMPONENTS',
  'DEMOS',
  'PAGES',
  '$location',
  '$rootScope',
function(COMPONENTS, DEMOS, PAGES, $location, $rootScope) {

  var sections = [{
    name: 'Layout',
    pages: [{
      name: 'Container Elements',
      id: 'layoutContainers',
      url: '/layout/container'
    },{
      name: 'Grid System',
      id: 'layoutGrid',
      url: '/layout/grid'
    },{
      name: 'Child Alignment',
      id: 'layoutAlign',
      url: '/layout/alignment'
    },{
      name: 'Options',
      id: 'layoutOptions',
      url: '/layout/options'
    }]
  }];

  var apiDocs = {};
  COMPONENTS.forEach(function(component) {
    component.docs.forEach(function(doc) {
      if (angular.isDefined(doc.private)) return;
      apiDocs[doc.type] = apiDocs[doc.type] || [];
      apiDocs[doc.type].push(doc);
    });
  });
  var demoDocs = [];
  angular.forEach(DEMOS, function(componentDemos) {
    demoDocs.push({
      name: componentDemos.label,
      url: componentDemos.url
    });
  });

  sections.unshift({
    name: 'Demos',
    pages: demoDocs.sort(sortByName)
  });

  angular.forEach(PAGES, function(pages, area) {
    sections.push({
      name: area,
      pages: pages
    });
  });

  sections.push({
    name: 'Services',
    pages: apiDocs.service.sort(sortByName)
  });
  sections.push({
    name: 'Directives',
    pages: apiDocs.directive.sort(sortByName)
  });
  function sortByName(a,b) {
    return a.name < b.name ? -1 : 1;
  }

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

  function sortByHumanName(a,b) {
    return (a.humanName < b.humanName) ? -1 :
      (a.humanName > b.humanName) ? 1 : 0;
  }

  function onLocationChange() {
    var activated = false;
    var path = $location.path();
    sections.forEach(function(section) {
      section.pages.forEach(function(page) {
        if (path === page.url) {
          self.selectSection(section);
          self.selectPage(section, page);
          activated = true;
        }
      });
    });
    if (!activated) {
      self.selectSection(sections[3]);
    }
  }
}])

.controller('DocsCtrl', [
  '$scope',
  'COMPONENTS',
  'BUILDCONFIG',
  '$mdSidenav',
  '$timeout',
  '$mdDialog',
  'menu',
  '$location',
  '$rootScope',
function($scope, COMPONENTS, BUILDCONFIG, $mdSidenav, $timeout, $mdDialog, menu, $location, $rootScope) {
  $scope.COMPONENTS = COMPONENTS;
  $scope.BUILDCONFIG = BUILDCONFIG;

  $scope.menu = menu;

  var mainContentArea = document.querySelector("[role='main']");

  $rootScope.$on('$locationChangeSuccess', openPage);

  $scope.closeMenu = function() {
    $timeout(function() { $mdSidenav('left').close(); });
  };
  $scope.openMenu = function() {
    $timeout(function() { $mdSidenav('left').open(); });
  };

  $scope.path = function() {
    return $location.path();
  };

  $scope.goHome = function($event) {
    menu.selectPage(null, null);
    $location.path( '/' );
  };

  function openPage() {
    $scope.closeMenu();
    mainContentArea.focus();
  }
}])

.controller('HomeCtrl', [
  '$scope',
  '$rootScope',
  '$http',
function($scope, $rootScope, $http) {
  $rootScope.currentComponent = $rootScope.currentDoc = null;

  $scope.version = "";
  $scope.versionURL = "";

  // Load build version information; to be
  // used in the header bar area
  var now = Math.round(new Date().getTime()/1000);
  var versionFile = "version.json" + "?ts=" + now;

  $http.get("version.json")
    .then(function(response){
      var sha = response.data.sha || "";
      var url = response.data.url;

      if (sha) {
        $scope.versionURL = url + sha;
        $scope.version = sha.substr(0,6);
      }
    });


}])


.controller('GuideCtrl', [
  '$rootScope',
function($rootScope) {
  $rootScope.currentComponent = $rootScope.currentDoc = null;
}])

.controller('LayoutCtrl', [
  '$scope',
  '$attrs',
  '$location',
  '$rootScope',
function($scope, $attrs, $location, $rootScope) {
  $rootScope.currentComponent = $rootScope.currentDoc = null;

  $scope.layoutDemo = {
    mainAxis: 'center',
    crossAxis: 'center',
    direction: 'row'
  };
  $scope.layoutAlign = function() {
    return $scope.layoutDemo.mainAxis + ' ' + $scope.layoutDemo.crossAxis;
  };
}])

.controller('ComponentDocCtrl', [
  '$scope',
  'doc',
  'component',
  '$rootScope',
  '$templateCache',
  '$http',
  '$q',
function($scope, doc, component, $rootScope, $templateCache, $http, $q) {
  $rootScope.currentComponent = component;
  $rootScope.currentDoc = doc;
}])

.controller('DemoCtrl', [
  '$rootScope',
  '$scope',
  'component',
  'demos',
  '$http',
  '$templateCache',
  '$q',
function($rootScope, $scope, component, demos, $http, $templateCache, $q) {
  $rootScope.currentComponent = component;
  $rootScope.currentDoc = null;

  $scope.demos = [];

  angular.forEach(demos, function(demo) {
    // Get displayed contents (un-minified)
    var files = [demo.index]
      .concat(demo.js || [])
      .concat(demo.css || [])
      .concat(demo.html || []);
    files.forEach(function(file) {
      file.httpPromise =$http.get(file.outputPath, {cache: $templateCache})
        .then(function(response) {
          file.contents = response.data
            .replace('<head/>', '');
          return file.contents;
        });
    });
    demo.$files = files;
    $scope.demos.push(demo);
  });

  $scope.demos = $scope.demos.sort(function(a,b) {
    return a.name > b.name ? 1 : -1;
  });

}])

.filter('humanizeDoc', function() {
  return function(doc) {
    if (!doc) return;
    if (doc.type === 'directive') {
      return doc.name.replace(/([A-Z])/g, function($1) {
        return '-'+$1.toLowerCase();
      });
    }
    return doc.label || doc.name;
  };
})

.filter('directiveBrackets', function() {
  return function(str) {
    if (str.indexOf('-') > -1) {
      return '<' + str + '>';
    }
    return str;
  };
})
;
