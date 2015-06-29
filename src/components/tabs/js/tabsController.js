angular
    .module('material.components.tabs')
    .controller('MdTabsController', MdTabsController);

/**
 * @ngInject
 */
function MdTabsController ($scope, $element, $window, $timeout, $mdConstant, $mdTabInkRipple,
                           $mdUtil, $animate, $attrs, $compile, $mdTheming) {
  //-- define private properties
  var ctrl       = this,
      locked     = false,
      elements   = getElements(),
      queue      = [],
      destroyed  = false,
      loaded     = false;

  //-- define public properties with change handlers
  defineProperty('focusIndex', handleFocusIndexChange, $scope.selectedIndex || 0);
  defineProperty('offsetLeft', handleOffsetChange, 0);
  defineProperty('hasContent', handleHasContent, false);

  //-- define public properties
  ctrl.scope = $scope;
  ctrl.parent = $scope.$parent;
  ctrl.tabs = [];
  ctrl.lastSelectedIndex = null;
  ctrl.hasFocus = false;
  ctrl.lastClick = true;
  ctrl.shouldPaginate = false;
  ctrl.shouldCenterTabs = shouldCenterTabs();

  //-- define public methods
  ctrl.updatePagination = $mdUtil.debounce(updatePagination, 100);
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

  /**
   * Perform initialization for the controller, setup events and watcher(s)
   */
  function init () {
    $scope.selectedIndex = $scope.selectedIndex || 0;
    compileTemplate();
    configureWatchers();
    bindEvents();
    $mdTheming($element);
    $timeout(function () {
      updateHeightFromContent();
      adjustOffset();
      updatePagination();
      ctrl.tabs[$scope.selectedIndex] && ctrl.tabs[$scope.selectedIndex].scope.select();
      loaded = true;
    });
  }

  function compileTemplate () {
    var template = $attrs.$mdTabsTemplate,
        element  = angular.element(elements.data);
    element.html(template);
    $compile(element.contents())(ctrl.parent);
    delete $attrs.$mdTabsTemplate;
  }

  function bindEvents () {
    angular.element($window).on('resize', handleWindowResize);
  }

  function configureWatchers () {
    $mdUtil.initOptionalProperties($scope, $attrs);
    $attrs.$observe('mdNoBar', function (value) { $scope.noInkBar = angular.isDefined(value); });
    $scope.$watch('selectedIndex', handleSelectedIndexChange);
    $scope.$watch('dynamicHeight', function (value) {
      if (value) $element.addClass('md-dynamic-height');
      else $element.removeClass('md-dynamic-height');
    });
    $scope.$on('$destroy', cleanup);
  }

  /**
   * Remove any events defined by this controller
   */
  function cleanup () {
    destroyed = true;
    angular.element($window).off('resize', handleWindowResize);
    angular.element(elements.paging).off('DOMSubtreeModified', ctrl.updateInkBarStyles);
    angular.element(elements.paging).off('DOMSubtreeModified', updatePagination);
  }

  //-- Change handlers

  /**
   * Add/remove the `md-no-tab-content` class depending on `ctrl.hasContent`
   * @param hasContent
   */
  function handleHasContent (hasContent) {
    $element[hasContent ? 'removeClass' : 'addClass']('md-no-tab-content');
  }

  /**
   * Apply ctrl.offsetLeft to the paging element when it changes
   * @param left
   */
  function handleOffsetChange (left) {
    var newValue = ctrl.shouldCenterTabs ? '' : '-' + left + 'px';
    angular.element(elements.paging).css($mdConstant.CSS.TRANSFORM, 'translate3d(' + newValue + ', 0, 0)');
    $scope.$broadcast('$mdTabsPaginationChanged');
  }

  /**
   * Update the UI whenever `ctrl.focusIndex` is updated
   * @param newIndex
   * @param oldIndex
   */
  function handleFocusIndexChange (newIndex, oldIndex) {
    if (newIndex === oldIndex) return;
    if (!elements.tabs[newIndex]) return;
    adjustOffset();
    redirectFocus();
  }

  /**
   * Update the UI whenever the selected index changes. Calls user-defined select/deselect methods.
   * @param newValue
   * @param oldValue
   */
  function handleSelectedIndexChange (newValue, oldValue) {
    if (newValue === oldValue) return;

    $scope.selectedIndex = getNearestSafeIndex(newValue);
    ctrl.lastSelectedIndex = oldValue;
    ctrl.updateInkBarStyles();
    updateHeightFromContent();
    adjustOffset(newValue);
    $scope.$broadcast('$mdTabsChanged');
    ctrl.tabs[oldValue] && ctrl.tabs[oldValue].scope.deselect();
    ctrl.tabs[newValue] && ctrl.tabs[newValue].scope.select();
  }

  /**
   * Queues up a call to `handleWindowResize` when a resize occurs while the tabs component is
   * hidden.
   */
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

  /**
   * Handle user keyboard interactions
   * @param event
   */
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

  /**
   * Update the selected index and trigger a click event on the original `md-tab` element in order
   * to fire user-added click events.
   * @param index
   */
  function select (index) {
    if (!locked) ctrl.focusIndex = $scope.selectedIndex = index;
    ctrl.lastClick = true;
    ctrl.tabs[index].element.triggerHandler('click');
  }

  /**
   * When pagination is on, this makes sure the selected index is in view.
   * @param event
   */
  function scroll (event) {
    if (!ctrl.shouldPaginate) return;
    event.preventDefault();
    ctrl.offsetLeft = fixOffset(ctrl.offsetLeft - event.wheelDelta);
  }

  /**
   * Slides the tabs over approximately one page forward.
   */
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

  /**
   * Slides the tabs over approximately one page backward.
   */
  function previousPage () {
    var i, tab;
    for (i = 0; i < elements.tabs.length; i++) {
      tab = elements.tabs[i];
      if (tab.offsetLeft + tab.offsetWidth >= ctrl.offsetLeft) break;
    }
    ctrl.offsetLeft = fixOffset(tab.offsetLeft + tab.offsetWidth - elements.canvas.clientWidth);
  }

  /**
   * Update size calculations when the window is resized.
   */
  function handleWindowResize () {
    $scope.$apply(function () {
      ctrl.lastSelectedIndex = $scope.selectedIndex;
      ctrl.offsetLeft = fixOffset(ctrl.offsetLeft);
      $timeout(ctrl.updateInkBarStyles, 0, false);
      $timeout(updatePagination);
    });
  }

  /**
   * Remove a tab from the data and select the nearest valid tab.
   * @param tabData
   */
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

  /**
   * Create an entry in the tabs array for a new tab at the specified index.
   * @param tabData
   * @param index
   * @returns {*}
   */
  function insertTab (tabData, index) {
    var proto = {
          getIndex: function () { return ctrl.tabs.indexOf(tab); },
          isActive: function () { return this.getIndex() === $scope.selectedIndex; },
          isLeft:   function () { return this.getIndex() < $scope.selectedIndex; },
          isRight:  function () { return this.getIndex() > $scope.selectedIndex; },
          shouldRender: function () { return !$scope.noDisconnect || this.isActive(); },
          hasFocus: function () { return !ctrl.lastClick
              && ctrl.hasFocus && this.getIndex() === ctrl.focusIndex; },
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

  /**
   * Gathers references to all of the DOM elements used by this controller.
   * @returns {{}}
   */
  function getElements () {
    var elements      = {};

    //-- gather tab bar elements
    elements.wrapper  = $element[0].getElementsByTagName('md-tabs-wrapper')[0];
    elements.data     = $element[0].getElementsByTagName('md-tab-data')[0];
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

  /**
   * Determines whether or not the left pagination arrow should be enabled.
   * @returns {boolean}
   */
  function canPageBack () {
    return ctrl.offsetLeft > 0;
  }

  /**
   * Determines whether or not the right pagination arrow should be enabled.
   * @returns {*|boolean}
   */
  function canPageForward () {
    var lastTab = elements.tabs[elements.tabs.length - 1];
    return lastTab && lastTab.offsetLeft + lastTab.offsetWidth > elements.canvas.clientWidth +
        ctrl.offsetLeft;
  }

  /**
   * Determines if the UI should stretch the tabs to fill the available space.
   * @returns {*}
   */
  function shouldStretchTabs () {
    switch ($scope.stretchTabs) {
      case 'always': return true;
      case 'never':  return false;
      default:       return !ctrl.shouldPaginate
          && $window.matchMedia('(max-width: 600px)').matches;
    }
  }

  /**
   * Determines if the tabs should appear centered.
   * @returns {string|boolean}
   */
  function shouldCenterTabs () {
    return $scope.centerTabs && !ctrl.shouldPaginate;
  }

  /**
   * Determines if pagination is necessary to display the tabs within the available space.
   * @returns {boolean}
   */
  function shouldPaginate () {
    if ($scope.noPagination || !loaded) return false;
    var canvasWidth = $element.prop('clientWidth');
    angular.forEach(elements.dummies, function (tab) { canvasWidth -= tab.offsetWidth; });
    return canvasWidth < 0;
  }

  /**
   * Finds the nearest tab index that is available.  This is primarily used for when the active
   * tab is removed.
   * @param newIndex
   * @returns {*}
   */
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

  /**
   * Defines a property using a getter and setter in order to trigger a change handler without
   * using `$watch` to observe changes.
   * @param key
   * @param handler
   * @param value
   */
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

  /**
   * Updates whether or not pagination should be displayed.
   */
  function updatePagination () {
    ctrl.shouldPaginate = shouldPaginate();
    ctrl.shouldCenterTabs = shouldCenterTabs();
    $timeout(function () {
      adjustOffset($scope.selectedIndex);
    });
  }

  /**
   * Re-orders the tabs and updates the selected and focus indexes to their new positions.
   * This is triggered by `tabDirective.js` when the user's tabs have been re-ordered.
   */
  function updateTabOrder () {
    var selectedItem = ctrl.tabs[$scope.selectedIndex],
        focusItem = ctrl.tabs[ctrl.focusIndex];
    ctrl.tabs = ctrl.tabs.sort(function (a, b) {
      return a.index - b.index;
    });
    $scope.selectedIndex = ctrl.tabs.indexOf(selectedItem);
    ctrl.focusIndex = ctrl.tabs.indexOf(focusItem);
  }

  /**
   * This moves the selected or focus index left or right.  This is used by the keydown handler.
   * @param inc
   */
  function incrementSelectedIndex (inc) {
    var newIndex,
        index = ctrl.focusIndex;
    for (newIndex = index + inc;
         ctrl.tabs[newIndex] && ctrl.tabs[newIndex].scope.disabled;
         newIndex += inc) {}
    if (ctrl.tabs[newIndex]) {
      ctrl.focusIndex = newIndex;
    }
  }

  /**
   * This is used to forward focus to dummy elements.  This method is necessary to avoid aniation
   * issues when attempting to focus an item that is out of view.
   */
  function redirectFocus () {
    elements.dummies[ctrl.focusIndex].focus();
  }

  /**
   * Forces the pagination to move the focused tab into view.
   */
  function adjustOffset (index) {
    if (!elements.tabs[index]) return;
    if (ctrl.shouldCenterTabs) return;
    if (index == null) index = ctrl.focusIndex;
    var tab = elements.tabs[index],
        left = tab.offsetLeft,
        right = tab.offsetWidth + left;
    ctrl.offsetLeft = Math.max(ctrl.offsetLeft, fixOffset(right - elements.canvas.clientWidth));
    ctrl.offsetLeft = Math.min(ctrl.offsetLeft, fixOffset(left));
  }

  /**
   * Iterates through all queued functions and clears the queue.  This is used for functions that
   * are called before the UI is ready, such as size calculations.
   */
  function processQueue () {
    queue.forEach(function (func) { $timeout(func); });
    queue = [];
  }

  /**
   * Determines if the tab content area is needed.
   */
  function updateHasContent () {
    var hasContent = false;
    angular.forEach(ctrl.tabs, function (tab) {
      if (tab.template) hasContent = true;
    });
    ctrl.hasContent = hasContent;
  }

  /**
   * Moves the indexes to their nearest valid values.
   */
  function refreshIndex () {
    $scope.selectedIndex = getNearestSafeIndex($scope.selectedIndex);
    ctrl.focusIndex = getNearestSafeIndex(ctrl.focusIndex);
  }

  /**
   * Calculates the content height of the current tab.
   * @returns {*}
   */
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

  /**
   * Repositions the ink bar to the selected tab.
   * @returns {*}
   */
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

  /**
   * Adds left/right classes so that the ink bar will animate properly.
   */
  function updateInkBarClassName () {
    var newIndex = $scope.selectedIndex,
        oldIndex = ctrl.lastSelectedIndex,
        ink = angular.element(elements.inkBar);
    if (!angular.isNumber(oldIndex)) return;
    ink
        .toggleClass('md-left', newIndex < oldIndex)
        .toggleClass('md-right', newIndex > oldIndex);
  }

  /**
   * Takes an offset value and makes sure that it is within the min/max allowed values.
   * @param value
   * @returns {*}
   */
  function fixOffset (value) {
    if (!elements.tabs.length || !ctrl.shouldPaginate) return 0;
    var lastTab = elements.tabs[elements.tabs.length - 1],
        totalWidth = lastTab.offsetLeft + lastTab.offsetWidth;
    value = Math.max(0, value);
    value = Math.min(totalWidth - elements.canvas.clientWidth, value);
    return value;
  }

  /**
   * Attaches a ripple to the tab item element.
   * @param scope
   * @param element
   */
  function attachRipple (scope, element) {
    var options = { colorElement: angular.element(elements.inkBar) };
    $mdTabInkRipple.attach(scope, element, options);
  }
}
