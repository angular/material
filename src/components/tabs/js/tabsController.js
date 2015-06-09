angular
    .module('material.components.tabs')
    .controller('MdTabsController', MdTabsController);

/**
 * @ngInject
 */
function MdTabsController ($scope, $element, $window, $timeout, $mdConstant, $mdTabInkRipple,
                           $mdUtil, $animate) {
  var ctrl       = this,
      locked     = false,
      elements   = getElements(),
      queue      = [],
      destroyed  = false,
      loaded     = false;

  defineProperty('focusIndex', handleFocusIndexChange, $scope.selectedIndex || 0);
  defineProperty('offsetLeft', handleOffsetChange, 0);
  defineProperty('hasContent', handleHasContent, false);

  ctrl.scope = $scope;
  ctrl.parent = $scope.$parent;
  ctrl.tabs = [];
  ctrl.lastSelectedIndex = null;
  ctrl.hasFocus = false;
  ctrl.lastClick = true;
  ctrl.shouldPaginate = false;
  ctrl.shouldCenterTabs = shouldCenterTabs();

  ctrl.redirectFocus = redirectFocus;
  ctrl.attachRipple = attachRipple;
  ctrl.shouldStretchTabs = shouldStretchTabs;
  ctrl.insertTab = insertTab;
  ctrl.removeTab = removeTab;
  ctrl.select = select;
  ctrl.scroll = scroll;
  ctrl.nextPage = nextPage;
  ctrl.previousPage = previousPage;
  ctrl.keydown = keydown;
  ctrl.canPageForward = canPageForward;
  ctrl.canPageBack = canPageBack;
  ctrl.refreshIndex = refreshIndex;
  ctrl.incrementSelectedIndex = incrementSelectedIndex;
  ctrl.updateInkBarStyles = $mdUtil.debounce(updateInkBarStyles, 100);
  ctrl.updateTabOrder = $mdUtil.debounce(updateTabOrder, 100);

  init();

  function init () {
    $scope.$watch('selectedIndex', handleSelectedIndexChange);
    angular.element($window).on('resize', handleWindowResize);
    angular.element(elements.paging).on('DOMSubtreeModified', ctrl.updateInkBarStyles);
    angular.element(elements.paging).on('DOMSubtreeModified', updatePagination);
    $timeout(function () {
      updateHeightFromContent();
      adjustOffset();
      updatePagination();
      loaded = true;
    });
    $scope.$on('$destroy', cleanup);
  }

  function cleanup () {
    destroyed = true;
    angular.element($window).off('resize', handleWindowResize);
    angular.element(elements.paging).off('DOMSubtreeModified', ctrl.updateInkBarStyles);
    angular.element(elements.paging).off('DOMSubtreeModified', updatePagination);
  }

  //-- Change handlers

  function handleHasContent (hasContent) {
    $element[hasContent ? 'removeClass' : 'addClass']('md-no-tab-content');
  }

  function handleOffsetChange (left) {
    var newValue = ctrl.shouldCenterTabs ? '' : '-' + left + 'px';
    angular.element(elements.paging).css('transform', 'translate3d(' + newValue + ', 0, 0)');
    $scope.$broadcast('$mdTabsPaginationChanged');
  }

  function handleFocusIndexChange (newIndex, oldIndex) {
    if (newIndex === oldIndex) return;
    if (!elements.tabs[newIndex]) return;
    adjustOffset();
    redirectFocus();
  }

  function handleSelectedIndexChange (newValue, oldValue) {
    if (newValue === oldValue) return;

    $scope.selectedIndex = getNearestSafeIndex(newValue);
    ctrl.lastSelectedIndex = oldValue;
    ctrl.updateInkBarStyles();
    updateHeightFromContent();
    adjustOffset();
    $scope.$broadcast('$mdTabsChanged');
    ctrl.tabs[oldValue] && ctrl.tabs[oldValue].scope.deselect();
    ctrl.tabs[newValue] && ctrl.tabs[newValue].scope.select();
  }

  function handleResizeWhenVisible () {
    //-- if there is already a watcher waiting for resize, do nothing
    if (handleResizeWhenVisible.watcher) return;
    //-- otherwise, we will abuse the $watch function to check for visible
    handleResizeWhenVisible.watcher = $scope.$watch(function () {
      //-- since we are checking for DOM size, we use $timeout to wait for after the DOM updates
      $timeout(function () {
        //-- if the watcher has already run (ie. multiple digests in one cycle), do nothing
        if (!handleResizeWhenVisible.watcher) return;

        if ($element.prop('offsetParent')) {
          handleResizeWhenVisible.watcher();
          handleResizeWhenVisible.watcher = null;

          //-- we have to trigger our own $apply so that the DOM bindings will update
          handleWindowResize();
        }
      }, 0, false);
    });
  }

  //-- Event handlers / actions

  function keydown (event) {
    switch (event.keyCode) {
      case $mdConstant.KEY_CODE.LEFT_ARROW:
        event.preventDefault();
        incrementSelectedIndex(-1, true);
        break;
      case $mdConstant.KEY_CODE.RIGHT_ARROW:
        event.preventDefault();
        incrementSelectedIndex(1, true);
        break;
      case $mdConstant.KEY_CODE.SPACE:
      case $mdConstant.KEY_CODE.ENTER:
        event.preventDefault();
        if (!locked) $scope.selectedIndex = ctrl.focusIndex;
        break;
    }
    ctrl.lastClick = false;
  }

  function select (index) {
    if (!locked) ctrl.focusIndex = $scope.selectedIndex = index;
    ctrl.lastClick = true;
    ctrl.tabs[index].element.triggerHandler('click');
  }

  function scroll (event) {
    if (!ctrl.shouldPaginate) return;
    event.preventDefault();
    ctrl.offsetLeft = fixOffset(ctrl.offsetLeft - event.wheelDelta);
  }

  function nextPage () {
    var viewportWidth = elements.canvas.clientWidth,
        totalWidth = viewportWidth + ctrl.offsetLeft,
        i, tab;
    for (i = 0; i < elements.tabs.length; i++) {
      tab = elements.tabs[i];
      if (tab.offsetLeft + tab.offsetWidth > totalWidth) break;
    }
    ctrl.offsetLeft = fixOffset(tab.offsetLeft);
  }

  function previousPage () {
    var i, tab;
    for (i = 0; i < elements.tabs.length; i++) {
      tab = elements.tabs[i];
      if (tab.offsetLeft + tab.offsetWidth >= ctrl.offsetLeft) break;
    }
    ctrl.offsetLeft = fixOffset(tab.offsetLeft + tab.offsetWidth - elements.canvas.clientWidth);
  }

  function handleWindowResize () {
    $scope.$apply(function () {
      ctrl.lastSelectedIndex = $scope.selectedIndex;
      ctrl.offsetLeft = fixOffset(ctrl.offsetLeft);
      $timeout(ctrl.updateInkBarStyles, 0, false);
      $timeout(updatePagination);
    });
  }

  function removeTab (tabData) {
    var selectedIndex = $scope.selectedIndex,
        tab = ctrl.tabs.splice(tabData.getIndex(), 1)[0];
    refreshIndex();
    //-- when removing a tab, if the selected index did not change, we have to manually trigger the
    //   tab select/deselect events
    if ($scope.selectedIndex === selectedIndex && !destroyed) {
      tab.scope.deselect();
      ctrl.tabs[$scope.selectedIndex] && ctrl.tabs[$scope.selectedIndex].scope.select();
    }
    $timeout(function () {
      updatePagination();
      ctrl.offsetLeft = fixOffset(ctrl.offsetLeft);
    });
  }

  function insertTab (tabData, index) {
    var proto = {
          getIndex: function () { return ctrl.tabs.indexOf(tab); },
          isActive: function () { return this.getIndex() === $scope.selectedIndex; },
          isLeft:   function () { return this.getIndex() < $scope.selectedIndex; },
          isRight:  function () { return this.getIndex() > $scope.selectedIndex; },
          shouldRender: function () { return !$scope.noDisconnect || this.isActive(); },
          hasFocus: function () { return !ctrl.lastClick && ctrl.hasFocus && this.getIndex() === ctrl.focusIndex; },
          id:       $mdUtil.nextUid()
        },
        tab = angular.extend(proto, tabData);
    if (angular.isDefined(index)) {
      ctrl.tabs.splice(index, 0, tab);
    } else {
      ctrl.tabs.push(tab);
    }
    processQueue();
    updateHasContent();
    //-- if autoselect is enabled, select the newly added tab
    if (loaded && $scope.autoselect) $timeout(function () { select(ctrl.tabs.indexOf(tab)); });
    $timeout(updatePagination);
    return tab;
  }

  //-- Getter methods

  function getElements () {
    var elements      = {};

    //-- gather tab bar elements
    elements.wrapper  = $element[0].getElementsByTagName('md-tabs-wrapper')[0];
    elements.canvas   = elements.wrapper.getElementsByTagName('md-tabs-canvas')[0];
    elements.paging   = elements.canvas.getElementsByTagName('md-pagination-wrapper')[0];
    elements.tabs     = elements.paging.getElementsByTagName('md-tab-item');
    elements.dummies  = elements.canvas.getElementsByTagName('md-dummy-tab');
    elements.inkBar   = elements.paging.getElementsByTagName('md-ink-bar')[0];

    //-- gather tab content elements
    elements.contentsWrapper = $element[0].getElementsByTagName('md-tabs-content-wrapper')[0];
    elements.contents = elements.contentsWrapper.getElementsByTagName('md-tab-content');

    return elements;
  }

  function canPageBack () {
    return ctrl.offsetLeft > 0;
  }

  function canPageForward () {
    var lastTab = elements.tabs[elements.tabs.length - 1];
    return lastTab && lastTab.offsetLeft + lastTab.offsetWidth > elements.canvas.clientWidth + ctrl.offsetLeft;
  }

  function shouldStretchTabs () {
    switch ($scope.stretchTabs) {
      case 'always': return true;
      case 'never':  return false;
      default:       return !ctrl.shouldPaginate && $window.matchMedia('(max-width: 600px)').matches;
    }
  }

  function shouldCenterTabs () {
    return $scope.centerTabs && !ctrl.shouldPaginate;
  }

  function shouldPaginate () {
    if ($scope.noPagination || !loaded) return false;
    var canvasWidth = $element.prop('clientWidth');
    angular.forEach(elements.tabs, function (tab) { canvasWidth -= tab.offsetWidth; });
    return canvasWidth < 0;
  }

  function getNearestSafeIndex(newIndex) {
    var maxOffset = Math.max(ctrl.tabs.length - newIndex, newIndex),
        i, tab;
    for (i = 0; i <= maxOffset; i++) {
      tab = ctrl.tabs[newIndex + i];
      if (tab && (tab.scope.disabled !== true)) return tab.getIndex();
      tab = ctrl.tabs[newIndex - i];
      if (tab && (tab.scope.disabled !== true)) return tab.getIndex();
    }
    return newIndex;
  }

  //-- Utility methods

  function defineProperty (key, handler, value) {
    Object.defineProperty(ctrl, key, {
      get: function () { return value; },
      set: function (newValue) {
        var oldValue = value;
        value = newValue;
        handler(newValue, oldValue);
      }
    });
  }

  function updatePagination () {
    ctrl.shouldPaginate = shouldPaginate();
    ctrl.shouldCenterTabs = shouldCenterTabs();
  }

  function updateTabOrder () {
    var selectedItem = ctrl.tabs[$scope.selectedIndex],
        focusItem = ctrl.tabs[ctrl.focusIndex];
    ctrl.tabs = ctrl.tabs.sort(function (a, b) {
      return a.index - b.index;
    });
    $scope.selectedIndex = ctrl.tabs.indexOf(selectedItem);
    ctrl.focusIndex = ctrl.tabs.indexOf(focusItem);
  }

  function incrementSelectedIndex (inc, focus) {
    var newIndex,
        index = focus ? ctrl.focusIndex : $scope.selectedIndex;
    for (newIndex = index + inc;
         ctrl.tabs[newIndex] && ctrl.tabs[newIndex].scope.disabled;
         newIndex += inc) {}
    if (ctrl.tabs[newIndex]) {
      if (focus) ctrl.focusIndex = newIndex;
      else $scope.selectedIndex = newIndex;
    }
  }

  function redirectFocus () {
    elements.dummies[ctrl.focusIndex].focus();
  }

  function adjustOffset () {
    if (ctrl.shouldCenterTabs) return;
    var tab = elements.tabs[ctrl.focusIndex],
        left = tab.offsetLeft,
        right = tab.offsetWidth + left;
    ctrl.offsetLeft = Math.max(ctrl.offsetLeft, fixOffset(right - elements.canvas.clientWidth));
    ctrl.offsetLeft = Math.min(ctrl.offsetLeft, fixOffset(left));
  }

  function processQueue () {
    queue.forEach(function (func) { $timeout(func); });
    queue = [];
  }

  function updateHasContent () {
    var hasContent = false;
    angular.forEach(ctrl.tabs, function (tab) {
      if (tab.template) hasContent = true;
    });
    ctrl.hasContent = hasContent;
  }

  function refreshIndex () {
    $scope.selectedIndex = getNearestSafeIndex($scope.selectedIndex);
    ctrl.focusIndex = getNearestSafeIndex(ctrl.focusIndex);
  }

  function updateHeightFromContent () {
    if (!$scope.dynamicHeight) return $element.css('height', '');
    if (!ctrl.tabs.length) return queue.push(updateHeightFromContent);
    var tabContent    = elements.contents[$scope.selectedIndex],
        contentHeight = tabContent ? tabContent.offsetHeight : 0,
        tabsHeight    = elements.wrapper.offsetHeight,
        newHeight     = contentHeight + tabsHeight,
        currentHeight = $element.prop('clientHeight');
    if (currentHeight === newHeight) return;
    locked = true;
    $animate
        .animate(
          $element,
          { height: currentHeight + 'px' },
          { height: newHeight + 'px'}
        )
        .then(function () {
          $element.css('height', '');
          locked = false;
        });
  }

  function updateInkBarStyles () {
    if (!elements.tabs[$scope.selectedIndex]) return;
    if (!ctrl.tabs.length) return queue.push(ctrl.updateInkBarStyles);
    //-- if the element is not visible, we will not be able to calculate sizes until it is
    //-- we should treat that as a resize event rather than just updating the ink bar
    if (!$element.prop('offsetParent')) return handleResizeWhenVisible();
    var index = $scope.selectedIndex,
        totalWidth = elements.paging.offsetWidth,
        tab = elements.tabs[index],
        left = tab.offsetLeft,
        right = totalWidth - left - tab.offsetWidth;
    updateInkBarClassName();
    angular.element(elements.inkBar).css({ left: left + 'px', right: right + 'px' });
  }

  function updateInkBarClassName () {
    var newIndex = $scope.selectedIndex,
        oldIndex = ctrl.lastSelectedIndex,
        ink = angular.element(elements.inkBar);
    ink.removeClass('md-left md-right');
    if (!angular.isNumber(oldIndex)) return;
    if (newIndex < oldIndex) {
      ink.addClass('md-left');
    } else if (newIndex > oldIndex) {
      ink.addClass('md-right');
    }
  }

  function fixOffset (value) {
    if (!elements.tabs.length || !ctrl.shouldPaginate) return 0;
    var lastTab = elements.tabs[elements.tabs.length - 1],
        totalWidth = lastTab.offsetLeft + lastTab.offsetWidth;
    value = Math.max(0, value);
    value = Math.min(totalWidth - elements.canvas.clientWidth, value);
    return value;
  }

  function attachRipple (scope, element) {
    var options = { colorElement: angular.element(elements.inkBar) };
    $mdTabInkRipple.attach(scope, element, options);
  }
}
