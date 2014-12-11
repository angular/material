(function() {
'use strict';

angular.module('material.components.tabs')
    .directive('mdTabsPagination', TabPaginationDirective);

function TabPaginationDirective($mdConstant, $window, $$rAF, $$q, $timeout, $mdMedia) {

  // Must match (2 * width of paginators) in scss
  var PAGINATORS_WIDTH = (8 * 4) * 2;

  return {
    restrict: 'A',
    require: '^mdTabs',
    link: postLink
  };

  function postLink(scope, element, attr, tabsCtrl) {

    var tabs = element[0].getElementsByTagName('md-tab');
    var debouncedUpdatePagination = $$rAF.throttle(updatePagination);
    var tabsParent = element.children();
    var locked = false;
    var state = scope.pagination = {
      page: -1,
      active: false,
      clickNext: function() { locked || userChangePage(+1); },
      clickPrevious: function() { locked || userChangePage(-1); }
    };

    scope.$on('$mdTabsChanged', debouncedUpdatePagination);
    angular.element($window).on('resize', debouncedUpdatePagination);

    scope.$on('$destroy', function() {
      angular.element($window).off('resize', debouncedUpdatePagination);
    });

    scope.$watch(function() { return tabsCtrl.tabToFocus; }, onTabFocus);

    // Make sure we don't focus an element on the next page
    // before it's in view
    function onTabFocus(tab, oldTab) {
      if (!tab) return;

      var pageIndex = getPageForTab(tab);
      if (!state.active || pageIndex === state.page) {
        tab.element.focus();
      } else {
        // Go to the new page, wait for the page transition to end, then focus.
        oldTab && oldTab.element.blur();
        setPage(pageIndex).then(function() {
          locked = false;
          tab.element.focus();
        });
      }
    }

    // Called when page is changed by a user action (click)
    function userChangePage(increment) {
      var sizeData = state.tabData;
      var newPage = Math.max(0, Math.min(sizeData.pages.length - 1, state.page + increment));
      var newTabIndex = sizeData.pages[newPage][ increment > 0 ? 'firstTabIndex' : 'lastTabIndex' ];
      var newTab = tabsCtrl.itemAt(newTabIndex);
      locked = true;
      onTabFocus(newTab);
    }

    function updatePagination() {
      if (!element.prop('offsetParent')) {
        var watcher = waitForVisible();
        return;
      }

      var tabs = element.find('md-tab');

      disablePagination();

      var sizeData = state.tabData = calculateTabData();
      var needPagination = state.active = sizeData.pages.length > 1;

      if (needPagination) { enablePagination(); }

      scope.$evalAsync(function () { scope.$broadcast('$mdTabsPaginationChanged'); });

      function enablePagination() {
        tabsParent.css('width', '9999px');

        //-- apply filler margins
        angular.forEach(sizeData.tabs, function (tab) {
          angular.element(tab.element).css('margin-left', tab.filler + 'px');
        });

        setPage(getPageForTab(tabsCtrl.getSelectedItem()));
      }

      function disablePagination() {
        slideTabButtons(0);
        tabsParent.css('width', '');
        tabs.css('width', '');
        tabs.css('margin-left', '');
        state.page = null;
        state.active = false;
      }

      function waitForVisible() {
        return watcher || scope.$watch(
            function () {
              $timeout(function () {
                if (element[0].offsetParent) {
                  if (angular.isFunction(watcher)) {
                    watcher();
                  }
                  debouncedUpdatePagination();
                  watcher = null;
                }
              }, 0, false);
            }
        );
      }
    }

    function slideTabButtons(x) {
      if (tabsCtrl.pagingOffset === x) {
        // Resolve instantly if no change
        return $$q.when();
      }

      var deferred = $$q.defer();

      tabsCtrl.$$pagingOffset = x;
      tabsParent.css($mdConstant.CSS.TRANSFORM, 'translate3d(' + x + 'px,0,0)');
      tabsParent.on($mdConstant.CSS.TRANSITIONEND, onTabsParentTransitionEnd);

      return deferred.promise;

      function onTabsParentTransitionEnd(ev) {
        // Make sure this event didn't bubble up from an animation in a child element.
        if (ev.target === tabsParent[0]) {
          tabsParent.off($mdConstant.CSS.TRANSITIONEND, onTabsParentTransitionEnd);
          deferred.resolve();
        }
      }
    }

    function shouldStretchTabs() {
      switch (scope.stretchTabs) {
        case 'never':  return false;
        case 'always': return true;
        default:       return $mdMedia('sm');
      }
    }

    function calculateTabData(noAdjust) {
      var clientWidth = element.parent().prop('offsetWidth');
      var tabsWidth = clientWidth - PAGINATORS_WIDTH - 1;
      var $tabs = angular.element(tabs);
      var totalWidth = 0;
      var max = 0;
      var tabData = [];
      var pages = [];
      var currentPage;

      $tabs.css('max-width', '');
      angular.forEach(tabs, function (tab, index) {
        var tabWidth = Math.min(tabsWidth, tab.offsetWidth);
        var data = {
          element: tab,
          left: totalWidth,
          width: tabWidth,
          right: totalWidth + tabWidth,
          filler: 0
        };

        //-- This calculates the page for each tab.  The first page will use the clientWidth, which
        //   does not factor in the pagination items.  After the first page, tabsWidth is used
        //   because at this point, we know that the pagination buttons will be shown.
        data.page = Math.ceil(data.right / ( pages.length === 1 && index === tabs.length - 1 ? clientWidth : tabsWidth )) - 1;

        if (data.page >= pages.length) {
          data.filler = (tabsWidth * data.page) - data.left;
          data.right += data.filler;
          data.left += data.filler;
          currentPage = {
            left: data.left,
            firstTabIndex: index,
            lastTabIndex: index,
            tabs: [ data ]
          };
          pages.push(currentPage);
        } else {
          currentPage.lastTabIndex = index;
          currentPage.tabs.push(data);
        }
        totalWidth = data.right;
        max = Math.max(max, tabWidth);
        tabData.push(data);
      });
      $tabs.css('max-width', tabsWidth + 'px');

      if (!noAdjust && shouldStretchTabs()) {
        return adjustForStretchedTabs();
      } else {
        return {
          width: totalWidth,
          max: max,
          tabs: tabData,
          pages: pages,
          tabElements: tabs
        };
      }


      function adjustForStretchedTabs() {
        var canvasWidth = pages.length === 1 ? clientWidth : tabsWidth;
        var tabsPerPage = Math.min(Math.floor(canvasWidth / max), tabs.length);
        var tabWidth    = Math.floor(canvasWidth / tabsPerPage);
        $tabs.css('width', tabWidth + 'px');
        return calculateTabData(true);
      }
    }

    function getPageForTab(tab) {
      var tabIndex = tabsCtrl.indexOf(tab);
      if (tabIndex === -1) return 0;

      var sizeData = state.tabData;

      return sizeData ? sizeData.tabs[tabIndex].page : 0;
    }

    function setPage(page) {
      if (page === state.page) return;

      var lastPage = state.tabData.pages.length - 1;

      if (page < 0) page = 0;
      if (page > lastPage) page = lastPage;

      state.hasPrev = page > 0;
      state.hasNext = page < lastPage;

      state.page = page;

      scope.$broadcast('$mdTabsPaginationChanged');

      return slideTabButtons(-state.tabData.pages[page].left);
    }
  }

}
})();
