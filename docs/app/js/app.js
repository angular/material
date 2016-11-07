angular.module('docsApp', [ 'angularytics', 'ngRoute', 'ngMessages', 'ngMaterial' ], [
  'SERVICES',
  'COMPONENTS',
  'DEMOS',
  'PAGES',
  '$routeProvider',
  '$locationProvider',
  '$mdThemingProvider',
  '$mdIconProvider',
function(SERVICES, COMPONENTS, DEMOS, PAGES,
    $routeProvider, $locationProvider, $mdThemingProvider, $mdIconProvider) {

  $locationProvider.html5Mode(true);

  $routeProvider
    .when('/', {
      templateUrl: 'partials/home.tmpl.html'
    })
    .when('/layout/:tmpl', {
      templateUrl: function(params){
        return 'partials/layout-' + params.tmpl + '.tmpl.html';
      }
    })
    .when('/layout/', {
      redirectTo:  '/layout/introduction'
    })
    .when('/demo/', {
      redirectTo: DEMOS[0].url
    })
    .when('/api/', {
      redirectTo: COMPONENTS[0].docs[0].url
    })
    .when('/getting-started', {
      templateUrl: 'partials/getting-started.tmpl.html'
    })
    .when('/contributors', {
      templateUrl: 'partials/contributors.tmpl.html'
    })
    .when('/license', {
      templateUrl: 'partials/license.tmpl.html'
    });
  $mdThemingProvider.definePalette('docs-blue', $mdThemingProvider.extendPalette('blue', {
    '50': '#DCEFFF',
    '100': '#AAD1F9',
    '200': '#7BB8F5',
    '300': '#4C9EF1',
    '400': '#1C85ED',
    '500': '#106CC8',
    '600': '#0159A2',
    '700': '#025EE9',
    '800': '#014AB6',
    '900': '#013583',
    'contrastDefaultColor': 'light',
    'contrastDarkColors': '50 100 200 A100',
    'contrastStrongLightColors': '300 400 A200 A400'
  }));
  $mdThemingProvider.definePalette('docs-red', $mdThemingProvider.extendPalette('red', {
    'A100': '#DE3641'
  }));

  $mdThemingProvider.theme('docs-dark', 'default')
    .primaryPalette('yellow')
    .dark();

  $mdIconProvider.icon('md-toggle-arrow', 'img/icons/toggle-arrow.svg', 48);

  $mdThemingProvider.theme('default')
      .primaryPalette('docs-blue')
      .accentPalette('docs-red');

  $mdThemingProvider
      .enableBrowserColor();

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
      $routeProvider.when('/' + doc.url, {
        templateUrl: doc.outputPath,
        resolve: {
          component: function() { return component; },
          doc: function() { return doc; }
        },
        controller: 'ComponentDocCtrl'
      });
    });
  });

  angular.forEach(SERVICES, function(service) {
    $routeProvider.when('/' + service.url, {
      templateUrl: service.outputPath,
      resolve: {
        component: function() { return { isService: true } },
        doc: function() { return service; }
      },
      controller: 'ComponentDocCtrl'
    });
  });

  angular.forEach(DEMOS, function(componentDemos) {
    var demoComponent;

    COMPONENTS.forEach(function(component) {
      if (componentDemos.moduleName === component.name) {
        demoComponent = component;
        component.demoUrl = componentDemos.url;
      }
    });

    demoComponent = demoComponent || angular.extend({}, componentDemos);
    $routeProvider.when('/' + componentDemos.url, {
      templateUrl: 'partials/demo.tmpl.html',
      controller: 'DemoCtrl',
      resolve: {
        component: function() { return demoComponent; },
        demos: function() { return componentDemos.demos; }
      }
    });
  });

  $routeProvider.otherwise('/');

  // Change hash prefix of the Angular router, because we use the hash symbol for anchor links.
  // The hash will be not used by the docs, because we use the HTML5 mode for our links.
  $locationProvider.hashPrefix('!');

}])

.config(['AngularyticsProvider', function(AngularyticsProvider) {
   AngularyticsProvider.setEventHandlers(['Console', 'GoogleUniversal']);
}])

.run(['Angularytics', function(Angularytics) {
  Angularytics.init();
}])

.factory('menu', [
  'SERVICES',
  'COMPONENTS',
  'DEMOS',
  'PAGES',
  '$location',
  '$rootScope',
  '$http',
  '$window',
function(SERVICES, COMPONENTS, DEMOS, PAGES, $location, $rootScope, $http, $window) {

  var version = {};

  var sections = [{
    name: 'Getting Started',
    url: 'getting-started',
    type: 'link'
  }];

  var demoDocs = [];
  angular.forEach(DEMOS, function(componentDemos) {
    demoDocs.push({
      name: componentDemos.label,
      url: componentDemos.url
    });
  });

  sections.push({
    name: 'Demos',
    pages: demoDocs.sort(sortByName),
    type: 'toggle'
  });

  sections.push();

  sections.push({
    name: 'Customization',
    type: 'heading',
    children: [
      {
        name: 'CSS',
        type: 'toggle',
        pages: [{
            name: 'Typography',
            url: 'CSS/typography',
            type: 'link'
          },
          {
            name : 'Button',
            url: 'CSS/button',
            type: 'link'
          },
          {
            name : 'Checkbox',
            url: 'CSS/checkbox',
            type: 'link'
          }]
      },
      {
        name: 'Theming',
        type: 'toggle',
        pages: [
          {
            name: 'Introduction and Terms',
            url: 'Theming/01_introduction',
            type: 'link'
          },
          {
            name: 'Declarative Syntax',
            url: 'Theming/02_declarative_syntax',
            type: 'link'
          },
          {
            name: 'Configuring a Theme',
            url: 'Theming/03_configuring_a_theme',
            type: 'link'
          },
          {
            name: 'Multiple Themes',
            url: 'Theming/04_multiple_themes',
            type: 'link'
          },
          {
            name: 'Under the Hood',
            url: 'Theming/05_under_the_hood',
            type: 'link'
          },
          {
            name: 'Browser Color',
            url: 'Theming/06_browser_color',
            type: 'link'
          }
        ]
      }
    ]
  });

  var docsByModule = {};
  var apiDocs = {};
  COMPONENTS.forEach(function(component) {
    component.docs.forEach(function(doc) {
      if (angular.isDefined(doc.private)) return;
      apiDocs[doc.type] = apiDocs[doc.type] || [];
      apiDocs[doc.type].push(doc);

      docsByModule[doc.module] = docsByModule[doc.module] || [];
      docsByModule[doc.module].push(doc);
    });
  });

  SERVICES.forEach(function(service) {
    if (angular.isDefined(service.private)) return;
    apiDocs[service.type] = apiDocs[service.type] || [];
    apiDocs[service.type].push(service);

    docsByModule[service.module] = docsByModule[service.module] || [];
    docsByModule[service.module].push(service);
  });

  sections.push({
    name: 'API Reference',
    type: 'heading',
    children: [
    {
      name: 'Layout',
      type: 'toggle',
      pages: [{
        name: 'Introduction',
        id: 'layoutIntro',
        url: 'layout/introduction'
      }
        ,{
        name: 'Layout Containers',
        id: 'layoutContainers',
        url: 'layout/container'
        }
      ,{
        name: 'Layout Children',
        id: 'layoutGrid',
        url: 'layout/children'
      }
      ,{
        name: 'Child Alignment',
        id: 'layoutAlign',
        url: 'layout/alignment'
      }
      ,{
        name: 'Extra Options',
        id: 'layoutOptions',
        url: 'layout/options'
      }
      ,{
        name: 'Troubleshooting',
        id: 'layoutTips',
        url: 'layout/tips'
      }]
    },
    {
      name: 'Services',
      pages: apiDocs.service.sort(sortByName),
      type: 'toggle'
    },{
      name: 'Types',
      pages: apiDocs.type.sort(sortByName),
      type: 'toggle'
    },{
      name: 'Directives',
      pages: apiDocs.directive.sort(sortByName),
      type: 'toggle'
    }]
  });

  sections.push( {
        name: 'Contributors',
        url: 'contributors',
        type: 'link'
      } );

  sections.push({
    name: 'License',
    url:  'license',
    type: 'link',

    // Add a hidden section so that the title in the toolbar is properly set
    hidden: true
  });

  function sortByName(a,b) {
    return a.name < b.name ? -1 : 1;
  }

  var self;

  $rootScope.$on('$locationChangeSuccess', onLocationChange);

  $http.get("/docs.json")
      .then(function(response) {
        var versionId = getVersionIdFromPath();
        var head = { type: 'version', url: '/HEAD', id: 'head', name: 'HEAD (master)', github: '' };
        var commonVersions = versionId === 'head' ? [] : [ head ];
        var knownVersions = getAllVersions();
        var listVersions = knownVersions.filter(removeCurrentVersion);
        var currentVersion = getCurrentVersion() || {name: 'local'};
        version.current = currentVersion;
        sections.unshift({
          name: 'Documentation Version',
          type: 'heading',
          className: 'version-picker',
          children: [ {
            name: currentVersion.name,
            type: 'toggle',
            pages: commonVersions.concat(listVersions)
          } ]
        });
        function removeCurrentVersion (version) {
          switch (versionId) {
            case version.id: return false;
            case 'latest': return !version.latest;
            default: return true;
          }
        }
        function getAllVersions () {
          if (response && response.versions && response.versions.length) {
            return response.versions.map(function(version) {
              var latest = response.latest === version;
              return {
                type: 'version',
                url: '/' + version,
                name: getVersionFullString({ id: version, latest: latest }),
                id: version,
                latest: latest,
                github: 'tree/v' + version
              };
            });
          }

          return [];
        }
        function getVersionFullString (version) {
          return version.latest
              ? 'Latest Release (' + version.id + ')'
              : 'Release ' + version.id;
        }
        function getCurrentVersion () {
          switch (versionId) {
            case 'head': return head;
            case 'latest': return knownVersions.filter(getLatest)[0];
            default: return knownVersions.filter(getVersion)[0];
          }
          function getLatest (version) { return version.latest; }
          function getVersion (version) { return versionId === version.id; }
        }
        function getVersionIdFromPath () {
          var path = $window.location.pathname;
          if (path.length < 2) path = 'HEAD';
          return path.match(/[^\/]+/)[0].toLowerCase();
        }
      });

  return self = {
    version:  version,
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
      self.currentSection = section;
      self.currentPage = page;
    },
    isPageSelected: function(page) {
      return self.currentPage === page;
    }
  };

  function onLocationChange() {
    var path = $location.path();
    var introLink = {
      name: "Introduction",
      url:  "/",
      type: "link"
    };

    if (path == '/') {
      self.selectSection(introLink);
      self.selectPage(introLink, introLink);
      return;
    }

    var matchPage = function(section, page) {
      if (path.indexOf(page.url) !== -1) {
        self.selectSection(section);
        self.selectPage(section, page);
      }
    };

    sections.forEach(function(section) {
      if (section.children) {
        // matches nested section toggles, such as API or Customization
        section.children.forEach(function(childSection){
          if(childSection.pages){
            childSection.pages.forEach(function(page){
              matchPage(childSection, page);
            });
          }
        });
      }
      else if (section.pages) {
        // matches top-level section toggles, such as Demos
        section.pages.forEach(function(page) {
          matchPage(section, page);
        });
      }
      else if (section.type === 'link') {
        // matches top-level links, such as "Getting Started"
        matchPage(section, section);
      }
    });
  }
}])

.directive('menuLink', function() {
  return {
    scope: {
      section: '='
    },
    templateUrl: 'partials/menu-link.tmpl.html',
    link: function($scope, $element) {
      var controller = $element.parent().controller();

      $scope.isSelected = function() {
        return controller.isSelected($scope.section);
      };

      $scope.focusSection = function() {
        // set flag to be used later when
        // $locationChangeSuccess calls openPage()
        controller.autoFocusContent = true;
      };
    }
  };
})

.directive('menuToggle', ['$mdUtil', '$animateCss', '$$rAF', function($mdUtil, $animateCss, $$rAF) {
  return {
    scope: {
      section: '='
    },
    templateUrl: 'partials/menu-toggle.tmpl.html',
    link: function($scope, $element) {
      var controller = $element.parent().controller();

      // Used for toggling the visibility of the accordion's content, after
      // all of the animations are completed. This prevents users from being
      // allowed to tab through to the hidden content.
      $scope.renderContent = false;

      $scope.isOpen = function() {
        return controller.isOpen($scope.section);
      };

      $scope.toggle = function() {
        controller.toggleOpen($scope.section);
      };

      $mdUtil.nextTick(function() {
        $scope.$watch(function () {
          return controller.isOpen($scope.section);
        }, function (open) {
          var $ul = $element.find('ul');
          var $li = $ul[0].querySelector('a.active');

          if (open) {
            $scope.renderContent = true;
          }

          $$rAF(function() {
            var targetHeight = open ? $ul[0].scrollHeight : 0;

            $animateCss($ul, {
              easing: 'cubic-bezier(0.35, 0, 0.25, 1)',
              to: { height: targetHeight + 'px' },
              duration: 0.75 // seconds
            }).start().then(function() {
              var $li = $ul[0].querySelector('a.active');

              $scope.renderContent = open;

              if (open && $li && $ul[0].scrollTop === 0) {
                var activeHeight = $li.scrollHeight;
                var activeOffset = $li.offsetTop;
                var offsetParent = $li.offsetParent;
                var parentScrollPosition = offsetParent ? offsetParent.offsetTop : 0;

                // Reduce it a bit (2 list items' height worth) so it doesn't touch the nav
                var negativeOffset = activeHeight * 2;
                var newScrollTop = activeOffset + parentScrollPosition - negativeOffset;

                $mdUtil.animateScrollTo(document.querySelector('.docs-menu').parentNode, newScrollTop);
              }
            });
          });
        });
      });

      var parentNode = $element[0].parentNode.parentNode.parentNode;
      if(parentNode.classList.contains('parent-list-item')) {
        var heading = parentNode.querySelector('h2');
        $element[0].firstChild.setAttribute('aria-describedby', heading.id);
      }
    }
  };
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
  '$mdUtil',
function($scope, COMPONENTS, BUILDCONFIG, $mdSidenav, $timeout, $mdDialog, menu, $location, $rootScope, $mdUtil) {
  var self = this;

  $scope.COMPONENTS = COMPONENTS;
  $scope.BUILDCONFIG = BUILDCONFIG;
  $scope.menu = menu;

  $scope.path = path;
  $scope.goHome = goHome;
  $scope.openMenu = openMenu;
  $scope.closeMenu = closeMenu;
  $scope.isSectionSelected = isSectionSelected;
  $scope.scrollTop = scrollTop;

  // Grab the current year so we don't have to update the license every year
  $scope.thisYear = (new Date()).getFullYear();

  $rootScope.$on('$locationChangeSuccess', openPage);
  $scope.focusMainContent = focusMainContent;

  //-- Define a fake model for the related page selector
  Object.defineProperty($rootScope, "relatedPage", {
    get: function () { return null; },
    set: angular.noop,
    enumerable: true,
    configurable: true
  });

  $rootScope.redirectToUrl = function(url) {
    $location.path(url);
    $timeout(function () { $rootScope.relatedPage = null; }, 100);
  };

  // Methods used by menuLink and menuToggle directives
  this.isOpen = isOpen;
  this.isSelected = isSelected;
  this.toggleOpen = toggleOpen;
  this.autoFocusContent = false;


  var mainContentArea = document.querySelector("[role='main']");
  var scrollContentEl = mainContentArea.querySelector('md-content[md-scroll-y]');


  // *********************
  // Internal methods
  // *********************

  function closeMenu() {
    $timeout(function() { $mdSidenav('left').close(); });
  }

  function openMenu() {
    $timeout(function() { $mdSidenav('left').open(); });
  }

  function path() {
    return $location.path();
  }

  function scrollTop() {
    $mdUtil.animateScrollTo(scrollContentEl, 0, 200);
  }

  function goHome($event) {
    menu.selectPage(null, null);
    $location.path( '/' );
  }

  function openPage() {
    $scope.closeMenu();

    if (self.autoFocusContent) {
      focusMainContent();
      self.autoFocusContent = false;
    }
  }

  function focusMainContent($event) {
    // prevent skip link from redirecting
    if ($event) { $event.preventDefault(); }

    $timeout(function(){
      mainContentArea.focus();
    },90);

  }

  function isSelected(page) {
    return menu.isPageSelected(page);
  }

  function isSectionSelected(section) {
    var selected = false;
    var openedSection = menu.openedSection;
    if(openedSection === section){
      selected = true;
    }
    else if(section.children) {
      section.children.forEach(function(childSection) {
        if(childSection === openedSection){
          selected = true;
        }
      });
    }
    return selected;
  }

  function isOpen(section) {
    return menu.isSectionSelected(section);
  }

  function toggleOpen(section) {
    menu.toggleSelectSection(section);
  }
}])

.controller('HomeCtrl', [
  '$scope',
  '$rootScope',
function($scope, $rootScope) {
  $rootScope.currentComponent = $rootScope.currentDoc = null;
}])


.controller('GuideCtrl', [
  '$rootScope', '$http',
function($rootScope, $http) {
  $rootScope.currentComponent = $rootScope.currentDoc = null;
  if ( !$rootScope.contributors ) {
    $http
      .get('./contributors.json')
      .then(function(response) {
        $rootScope.github = response.data;
      })
  }
}])

.controller('LayoutCtrl', [
  '$scope',
  '$attrs',
  '$location',
  '$rootScope',
function($scope, $attrs, $location, $rootScope) {
  $rootScope.currentComponent = $rootScope.currentDoc = null;

  $scope.exampleNotEditable = true;
  $scope.layoutDemo = {
    mainAxis: 'center',
    crossAxis: 'center',
    direction: 'row'
  };
  $scope.layoutAlign = function() {
    return $scope.layoutDemo.mainAxis +
     ($scope.layoutDemo.crossAxis ? ' ' + $scope.layoutDemo.crossAxis : '')
  };
}])

.controller('LayoutTipsCtrl', [
function() {
  var self = this;

  /*
   * Flex Sizing - Odd
   */
  self.toggleButtonText = "Hide";

  self.toggleContentSize = function() {
    var contentEl = angular.element(document.getElementById('toHide'));

    contentEl.toggleClass("ng-hide");

    self.toggleButtonText = contentEl.hasClass("ng-hide") ? "Show" : "Hide";
  };
}])

.controller('ComponentDocCtrl', [
  '$scope',
  'doc',
  'component',
  '$rootScope',
function($scope, doc, component, $rootScope) {
  $rootScope.currentComponent = component;
  $rootScope.currentDoc = doc;
}])

.controller('DemoCtrl', [
  '$rootScope',
  '$scope',
  'component',
  'demos',
  '$templateRequest',
function($rootScope, $scope, component, demos, $templateRequest) {
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
      file.httpPromise = $templateRequest(file.outputPath)
        .then(function(response) {
          file.contents = response
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

.filter('nospace', function () {
  return function (value) {
    return (!value) ? '' : value.replace(/ /g, '');
  };
})
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
  return function(str, restrict) {
    if (restrict) {
      // If it is restricted to only attributes
      if (!restrict.element && restrict.attribute) {
        return '[' + str + ']';
      }

      // If it is restricted to elements and isn't a service
      if (restrict.element && str.indexOf('-') > -1) {
        return '<' + str + '>';
      }

      // TODO: Handle class/comment restrictions if we ever have any to document
    }

    // Just return the original string if we don't know what to do with it
    return str;
  };
})

/** Directive which applies a specified class to the element when being scrolled */
.directive('docsScrollClass', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attr) {

      var scrollParent = element.parent();
      var isScrolling = false;

      // Initial update of the state.
      updateState();

      // Register a scroll listener, which updates the state.
      scrollParent.on('scroll', updateState);

      function updateState() {
        var newState = scrollParent[0].scrollTop !== 0;

        if (newState !== isScrolling) {
          element.toggleClass(attr.docsScrollClass, newState);
        }

        isScrolling = newState;
      }
    }
  };
});
