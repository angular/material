angular
    .module('material.components.tabs')
    .controller('MdTabsController', MdTabsController);

/**
 * @ngInject
 */
function MdTabsController ($scope, $element, $window, $mdConstant, $mdTabInkRipple, $mdUtil,
                           $animateCss, $attrs, $compile, $mdTheming, $mdInteraction, $timeout,
                           MdTabsPaginationService) {
  // define private properties
  var ctrl      = this,
      locked    = false,
      queue     = [],
      destroyed = false,
      loaded    = false;

  // Define public methods
  ctrl.$onInit            = $onInit;
  ctrl.updatePagination   = $mdUtil.debounce(updatePagination, 100);
  ctrl.redirectFocus      = redirectFocus;
  ctrl.attachRipple       = attachRipple;
  ctrl.insertTab          = insertTab;
  ctrl.removeTab          = removeTab;
  ctrl.select             = select;
  ctrl.scroll             = scroll;
  ctrl.nextPage           = nextPage;
  ctrl.previousPage       = previousPage;
  ctrl.keydown            = keydown;
  ctrl.canPageForward     = canPageForward;
  ctrl.canPageBack        = canPageBack;
  ctrl.refreshIndex       = refreshIndex;
  ctrl.incrementIndex     = incrementIndex;
  ctrl.getTabElementIndex = getTabElementIndex;
  ctrl.updateInkBarStyles = $mdUtil.debounce(updateInkBarStyles, 100);
  ctrl.updateTabOrder     = $mdUtil.debounce(updateTabOrder, 100);
  ctrl.getFocusedTabId    = getFocusedTabId;

  // For AngularJS 1.4 and older, where there are no lifecycle hooks but bindings are pre-assigned,
  // manually call the $onInit hook.
  if (angular.version.major === 1 && angular.version.minor <= 4) {
    this.$onInit();
  }

  /**
   * AngularJS Lifecycle hook for newer AngularJS versions.
   * Bindings are not guaranteed to have been assigned in the controller, but they are in the
   * $onInit hook.
   */
  function $onInit() {
    // Define one-way bindings
    defineOneWayBinding('stretchTabs', handleStretchTabs);

    // Define public properties with change handlers
    defineProperty('focusIndex', handleFocusIndexChange, ctrl.selectedIndex || 0);
    defineProperty('offsetLeft', handleOffsetChange, 0);
    defineProperty('hasContent', handleHasContent, false);
    defineProperty('maxTabWidth', handleMaxTabWidth, getMaxTabWidth());
    defineProperty('shouldPaginate', handleShouldPaginate, false);

    // Define boolean attributes
    defineBooleanAttribute('noInkBar', handleInkBar);
    defineBooleanAttribute('dynamicHeight', handleDynamicHeight);
    defineBooleanAttribute('noPagination');
    defineBooleanAttribute('swipeContent');
    defineBooleanAttribute('noDisconnect');
    defineBooleanAttribute('autoselect');
    defineBooleanAttribute('noSelectClick');
    defineBooleanAttribute('centerTabs', handleCenterTabs, false);
    defineBooleanAttribute('enableDisconnect');

    // Define public properties
    ctrl.scope             = $scope;
    ctrl.parent            = $scope.$parent;
    ctrl.tabs              = [];
    ctrl.lastSelectedIndex = null;
    ctrl.hasFocus          = false;
    ctrl.styleTabItemFocus = false;
    ctrl.shouldCenterTabs  = shouldCenterTabs();
    ctrl.tabContentPrefix  = 'tab-content-';
    ctrl.navigationHint = 'Use the left and right arrow keys to navigate between tabs';

    // Setup the tabs controller after all bindings are available.
    setupTabsController();
  }

  /**
   * Perform setup for the controller, setup events and watcher(s)
   */
  function setupTabsController () {
    ctrl.selectedIndex = ctrl.selectedIndex || 0;
    compileTemplate();
    configureWatchers();
    bindEvents();
    $mdTheming($element);
    $mdUtil.nextTick(function () {
      updateHeightFromContent();
      adjustOffset();
      updateInkBarStyles();
      ctrl.tabs[ ctrl.selectedIndex ] && ctrl.tabs[ ctrl.selectedIndex ].scope.select();
      loaded = true;
      updatePagination();
    });
  }

  /**
   * Compiles the template provided by the user.  This is passed as an attribute from the tabs
   * directive's template function.
   */
  function compileTemplate () {
    var template = $attrs.$mdTabsTemplate,
        element  = angular.element($element[0].querySelector('md-tab-data'));

    element.html(template);
    $compile(element.contents())(ctrl.parent);
    delete $attrs.$mdTabsTemplate;
  }

  /**
   * Binds events used by the tabs component.
   */
  function bindEvents () {
    angular.element($window).on('resize', handleWindowResize);
    $scope.$on('$destroy', cleanup);
  }

  /**
   * Configure watcher(s) used by Tabs
   */
  function configureWatchers () {
    $scope.$watch('$mdTabsCtrl.selectedIndex', handleSelectedIndexChange);
  }

  /**
   * Creates a one-way binding manually rather than relying on AngularJS's isolated scope
   * @param key
   * @param handler
   */
  function defineOneWayBinding (key, handler) {
    var attr = $attrs.$normalize('md-' + key);
    if (handler) defineProperty(key, handler);
    $attrs.$observe(attr, function (newValue) { ctrl[ key ] = newValue; });
  }

  /**
   * Defines boolean attributes with default value set to true. I.e. md-stretch-tabs with no value
   * will be treated as being truthy.
   * @param {string} key
   * @param {Function} handler
   */
  function defineBooleanAttribute (key, handler) {
    var attr = $attrs.$normalize('md-' + key);
    if (handler) defineProperty(key, handler);
    if ($attrs.hasOwnProperty(attr)) updateValue($attrs[attr]);
    $attrs.$observe(attr, updateValue);
    function updateValue (newValue) {
      ctrl[ key ] = newValue !== 'false';
    }
  }

  /**
   * Remove any events defined by this controller
   */
  function cleanup () {
    destroyed = true;
    angular.element($window).off('resize', handleWindowResize);
  }

  // Change handlers

  /**
   * Toggles stretch tabs class and updates inkbar when tab stretching changes.
   */
  function handleStretchTabs () {
    var elements = getElements();
    angular.element(elements.wrapper).toggleClass('md-stretch-tabs', shouldStretchTabs());
    updateInkBarStyles();
  }

  /**
   * Update the value of ctrl.shouldCenterTabs.
   */
  function handleCenterTabs () {
    ctrl.shouldCenterTabs = shouldCenterTabs();
  }

  /**
   * @param {number} newWidth new max tab width in pixels
   * @param {number} oldWidth previous max tab width in pixels
   */
  function handleMaxTabWidth (newWidth, oldWidth) {
    if (newWidth !== oldWidth) {
      var elements = getElements();

      // Set the max width for the real tabs
      angular.forEach(elements.tabs, function(tab) {
        tab.style.maxWidth = newWidth + 'px';
      });

      // Set the max width for the dummy tabs too
      angular.forEach(elements.dummies, function(tab) {
        tab.style.maxWidth = newWidth + 'px';
      });

      $mdUtil.nextTick(ctrl.updateInkBarStyles);
    }
  }

  function handleShouldPaginate (newValue, oldValue) {
    if (newValue !== oldValue) {
      ctrl.maxTabWidth      = getMaxTabWidth();
      ctrl.shouldCenterTabs = shouldCenterTabs();
      $mdUtil.nextTick(function () {
        ctrl.maxTabWidth = getMaxTabWidth();
        adjustOffset(ctrl.selectedIndex);
      });
    }
  }

  /**
   * Add/remove the `md-no-tab-content` class depending on `ctrl.hasContent`
   * @param {boolean} hasContent
   */
  function handleHasContent (hasContent) {
    $element[ hasContent ? 'removeClass' : 'addClass' ]('md-no-tab-content');
  }

  /**
   * Apply ctrl.offsetLeft to the paging element when it changes
   * @param {string|number} left
   */
  function handleOffsetChange (left) {
    var elements = getElements();
    var newValue = ((ctrl.shouldCenterTabs || isRtl() ? '' : '-') + left + 'px');

    // Fix double-negative which can happen with RTL support
    newValue = newValue.replace('--', '');

    angular.element(elements.paging).css($mdConstant.CSS.TRANSFORM, 'translate(' + newValue + ', 0)');
    $scope.$broadcast('$mdTabsPaginationChanged');
  }

  /**
   * Update the UI whenever `ctrl.focusIndex` is updated
   * @param {number} newIndex
   * @param {number} oldIndex
   */
  function handleFocusIndexChange (newIndex, oldIndex) {
    if (newIndex === oldIndex) return;
    if (!getElements().tabs[ newIndex ]) return;
    adjustOffset();
    redirectFocus();
  }

  /**
   * Update the UI whenever the selected index changes. Calls user-defined select/deselect methods.
   * @param {number} newValue selected index's new value
   * @param {number} oldValue selected index's previous value
   */
  function handleSelectedIndexChange (newValue, oldValue) {
    if (newValue === oldValue) return;

    ctrl.selectedIndex     = getNearestSafeIndex(newValue);
    ctrl.lastSelectedIndex = oldValue;
    ctrl.updateInkBarStyles();
    updateHeightFromContent();
    adjustOffset(newValue);
    $scope.$broadcast('$mdTabsChanged');
    ctrl.tabs[ oldValue ] && ctrl.tabs[ oldValue ].scope.deselect();
    ctrl.tabs[ newValue ] && ctrl.tabs[ newValue ].scope.select();
  }

  function getTabElementIndex(tabEl){
    var tabs = $element[0].getElementsByTagName('md-tab');
    return Array.prototype.indexOf.call(tabs, tabEl[0]);
  }

  /**
   * Queues up a call to `handleWindowResize` when a resize occurs while the tabs component is
   * hidden.
   */
  function handleResizeWhenVisible () {
    // if there is already a watcher waiting for resize, do nothing
    if (handleResizeWhenVisible.watcher) return;
    // otherwise, we will abuse the $watch function to check for visible
    handleResizeWhenVisible.watcher = $scope.$watch(function () {
      // since we are checking for DOM size, we use $mdUtil.nextTick() to wait for after the DOM updates
      $mdUtil.nextTick(function () {
        // if the watcher has already run (ie. multiple digests in one cycle), do nothing
        if (!handleResizeWhenVisible.watcher) return;

        if ($element.prop('offsetParent')) {
          handleResizeWhenVisible.watcher();
          handleResizeWhenVisible.watcher = null;

          handleWindowResize();
        }
      }, false);
    });
  }

  // Event handlers / actions

  /**
   * Handle user keyboard interactions
   * @param {KeyboardEvent} event keydown event
   */
  function keydown (event) {
    switch (event.keyCode) {
      case $mdConstant.KEY_CODE.LEFT_ARROW:
        event.preventDefault();
        incrementIndex(-1, true);
        break;
      case $mdConstant.KEY_CODE.RIGHT_ARROW:
        event.preventDefault();
        incrementIndex(1, true);
        break;
      case $mdConstant.KEY_CODE.SPACE:
      case $mdConstant.KEY_CODE.ENTER:
        event.preventDefault();
        if (!locked) select(ctrl.focusIndex);
        break;
      case $mdConstant.KEY_CODE.TAB:
        // On tabbing out of the tablist, reset hasFocus to reset ng-focused and
        // its md-focused class if the focused tab is not the active tab.
        if (ctrl.focusIndex !== ctrl.selectedIndex) {
          ctrl.focusIndex = ctrl.selectedIndex;
        }
        break;
    }
  }

  /**
   * Update the selected index. Triggers a click event on the original `md-tab` element in order
   * to fire user-added click events if canSkipClick or `md-no-select-click` are false.
   * @param index
   * @param canSkipClick Optionally allow not firing the click event if `md-no-select-click` is also true.
   */
  function select (index, canSkipClick) {
    if (!locked) ctrl.focusIndex = ctrl.selectedIndex = index;
    // skip the click event if noSelectClick is enabled
    if (canSkipClick && ctrl.noSelectClick) return;
    // nextTick is required to prevent errors in user-defined click events
    $mdUtil.nextTick(function () {
      ctrl.tabs[ index ].element.triggerHandler('click');
    }, false);
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
    if (!ctrl.canPageForward()) { return; }

    var newOffset = MdTabsPaginationService.increasePageOffset(getElements(), ctrl.offsetLeft);

    ctrl.offsetLeft = fixOffset(newOffset);
  }

  /**
   * Slides the tabs over approximately one page backward.
   */
  function previousPage () {
    if (!ctrl.canPageBack()) { return; }

    var newOffset = MdTabsPaginationService.decreasePageOffset(getElements(), ctrl.offsetLeft);

    // Set the new offset
    ctrl.offsetLeft = fixOffset(newOffset);
  }

  /**
   * Update size calculations when the window is resized.
   */
  function handleWindowResize () {
    ctrl.lastSelectedIndex = ctrl.selectedIndex;
    ctrl.offsetLeft        = fixOffset(ctrl.offsetLeft);

    $mdUtil.nextTick(function () {
      ctrl.updateInkBarStyles();
      updatePagination();
    });
  }

  /**
   * Hides or shows the tabs ink bar.
   * @param {boolean} hide A Boolean (not just truthy/falsy) value to determine whether the class
   * should be added or removed.
   */
  function handleInkBar (hide) {
    angular.element(getElements().inkBar).toggleClass('ng-hide', hide);
  }

  /**
   * Enables or disables tabs dynamic height.
   * @param {boolean} value A Boolean (not just truthy/falsy) value to determine whether the class
   * should be added or removed.
   */
  function handleDynamicHeight (value) {
    $element.toggleClass('md-dynamic-height', value);
  }

  /**
   * Remove a tab from the data and select the nearest valid tab.
   * @param {Object} tabData tab to remove
   */
  function removeTab (tabData) {
    if (destroyed) return;
    var selectedIndex = ctrl.selectedIndex,
        tab           = ctrl.tabs.splice(tabData.getIndex(), 1)[ 0 ];
    refreshIndex();
    // when removing a tab, if the selected index did not change, we have to manually trigger the
    //   tab select/deselect events
    if (ctrl.selectedIndex === selectedIndex) {
      tab.scope.deselect();
      ctrl.tabs[ ctrl.selectedIndex ] && ctrl.tabs[ ctrl.selectedIndex ].scope.select();
    }
    $mdUtil.nextTick(function () {
      updatePagination();
      ctrl.offsetLeft = fixOffset(ctrl.offsetLeft);
    });
  }

  /**
   * Create an entry in the tabs array for a new tab at the specified index.
   * @param {Object} tabData tab to insert
   * @param {number} index location to insert the new tab
   * @returns {*}
   */
  function insertTab (tabData, index) {
    var hasLoaded = loaded;
    var proto     = {
          getIndex:     function () { return ctrl.tabs.indexOf(tab); },
          isActive:     function () { return this.getIndex() === ctrl.selectedIndex; },
          isLeft:       function () { return this.getIndex() < ctrl.selectedIndex; },
          isRight:      function () { return this.getIndex() > ctrl.selectedIndex; },
          shouldRender: function () { return !ctrl.noDisconnect || this.isActive(); },
          hasFocus:     function () {
            return ctrl.styleTabItemFocus
                && ctrl.hasFocus && this.getIndex() === ctrl.focusIndex;
          },
          id:           $mdUtil.nextUid(),
          hasContent: !!(tabData.template && tabData.template.trim())
        },
        tab       = angular.extend(proto, tabData);
    if (angular.isDefined(index)) {
      ctrl.tabs.splice(index, 0, tab);
    } else {
      ctrl.tabs.push(tab);
    }

    processQueue();
    updateHasContent();
    $mdUtil.nextTick(function () {
      updatePagination();
      setAriaControls(tab);

      // if autoselect is enabled, select the newly added tab
      if (hasLoaded && ctrl.autoselect) $mdUtil.nextTick(function () {
        $mdUtil.nextTick(function () { select(ctrl.tabs.indexOf(tab)); });
      });
    });
    return tab;
  }

  // Getter methods

  /**
   * Gathers references to all of the DOM elements used by this controller.
   * @returns {Object}
   */
  function getElements () {
    var elements = {};
    var node = $element[0];

    // gather tab bar elements
    elements.wrapper = node.querySelector('md-tabs-wrapper');
    elements.canvas  = elements.wrapper.querySelector('md-tabs-canvas');
    elements.paging  = elements.canvas.querySelector('md-pagination-wrapper');
    elements.inkBar  = elements.paging.querySelector('md-ink-bar');
    elements.nextButton = node.querySelector('md-next-button');
    elements.prevButton = node.querySelector('md-prev-button');

    elements.contents = node.querySelectorAll('md-tabs-content-wrapper > md-tab-content');
    elements.tabs    = elements.paging.querySelectorAll('md-tab-item');
    elements.dummies = elements.canvas.querySelectorAll('md-dummy-tab');

    return elements;
  }

  /**
   * Determines whether or not the left pagination arrow should be enabled.
   * @returns {boolean}
   */
  function canPageBack () {
    // This works for both LTR and RTL
    return ctrl.offsetLeft > 0;
  }

  /**
   * Determines whether or not the right pagination arrow should be enabled.
   * @returns {*|boolean}
   */
  function canPageForward () {
    var elements = getElements();
    var lastTab = elements.tabs[ elements.tabs.length - 1 ];

    if (isRtl()) {
      return ctrl.offsetLeft < elements.paging.offsetWidth - elements.canvas.offsetWidth;
    }

    return lastTab && lastTab.offsetLeft + lastTab.offsetWidth > elements.canvas.clientWidth +
        ctrl.offsetLeft;
  }

  /**
   * Returns currently focused tab item's element ID
   */
  function getFocusedTabId() {
    var focusedTab = ctrl.tabs[ctrl.focusIndex];
    if (!focusedTab || !focusedTab.id) {
      return null;
    }
    return 'tab-item-' + focusedTab.id;
  }

  /**
   * Determines if the UI should stretch the tabs to fill the available space.
   * @returns {*}
   */
  function shouldStretchTabs () {
    switch (ctrl.stretchTabs) {
      case 'always':
        return true;
      case 'never':
        return false;
      default:
        return !ctrl.shouldPaginate
            && $window.matchMedia('(max-width: 600px)').matches;
    }
  }

  /**
   * Determines if the tabs should appear centered.
   * @returns {boolean}
   */
  function shouldCenterTabs () {
    return ctrl.centerTabs && !ctrl.shouldPaginate;
  }

  /**
   * Determines if pagination is necessary to display the tabs within the available space.
   * @returns {boolean} true if pagination is necessary, false otherwise
   */
  function shouldPaginate () {
    var shouldPaginate;
    if (ctrl.noPagination || !loaded) return false;
    var canvasWidth = $element.prop('clientWidth');

    angular.forEach(getElements().tabs, function (tab) {
      canvasWidth -= tab.offsetWidth;
    });

    shouldPaginate = canvasWidth < 0;
    // Work around width calculation issues on IE11 when pagination is enabled
    if (shouldPaginate) {
      getElements().paging.style.width = '999999px';
    } else {
      getElements().paging.style.width = undefined;
    }
    return shouldPaginate;
  }

  /**
   * Finds the nearest tab index that is available.  This is primarily used for when the active
   * tab is removed.
   * @param newIndex
   * @returns {*}
   */
  function getNearestSafeIndex (newIndex) {
    if (newIndex === -1) return -1;
    var maxOffset = Math.max(ctrl.tabs.length - newIndex, newIndex),
        i, tab;
    for (i = 0; i <= maxOffset; i++) {
      tab = ctrl.tabs[ newIndex + i ];
      if (tab && (tab.scope.disabled !== true)) return tab.getIndex();
      tab = ctrl.tabs[ newIndex - i ];
      if (tab && (tab.scope.disabled !== true)) return tab.getIndex();
    }
    return newIndex;
  }

  // Utility methods

  /**
   * Defines a property using a getter and setter in order to trigger a change handler without
   * using `$watch` to observe changes.
   * @param {PropertyKey} key
   * @param {Function} handler
   * @param {any} value
   */
  function defineProperty (key, handler, value) {
    Object.defineProperty(ctrl, key, {
      get: function () { return value; },
      set: function (newValue) {
        var oldValue = value;
        value        = newValue;
        handler && handler(newValue, oldValue);
      }
    });
  }

  /**
   * Updates whether or not pagination should be displayed.
   */
  function updatePagination () {
    ctrl.maxTabWidth = getMaxTabWidth();
    ctrl.shouldPaginate = shouldPaginate();
  }

  /**
   * @param {Array<HTMLElement>} tabs tab item elements for use in computing total width
   * @returns {number} the width of the tabs in the specified array in pixels
   */
  function calcTabsWidth(tabs) {
    var width = 0;

    angular.forEach(tabs, function (tab) {
      //-- Uses the larger value between `getBoundingClientRect().width` and `offsetWidth`.  This
      //   prevents `offsetWidth` value from being rounded down and causing wrapping issues, but
      //   also handles scenarios where `getBoundingClientRect()` is inaccurate (ie. tabs inside
      //   of a dialog)
      width += Math.max(tab.offsetWidth, tab.getBoundingClientRect().width);
    });

    return Math.ceil(width);
  }

  /**
   * @returns {number} either the max width as constrained by the container or the max width from
   * the 2017 version of the Material Design spec.
   */
  function getMaxTabWidth() {
    var elements = getElements(),
      containerWidth = elements.canvas.clientWidth,

      // See https://material.io/archive/guidelines/components/tabs.html#tabs-specs
      specMax = 264;

    // Do the spec maximum, or the canvas width; whichever is *smaller* (tabs larger than the canvas
    // width can break the pagination) but not less than 0
    return Math.max(0, Math.min(containerWidth - 1, specMax));
  }

  /**
   * Re-orders the tabs and updates the selected and focus indexes to their new positions.
   * This is triggered by `tabDirective.js` when the user's tabs have been re-ordered.
   */
  function updateTabOrder () {
    var selectedItem   = ctrl.tabs[ ctrl.selectedIndex ],
        focusItem      = ctrl.tabs[ ctrl.focusIndex ];
    ctrl.tabs          = ctrl.tabs.sort(function (a, b) {
      return a.index - b.index;
    });
    ctrl.selectedIndex = ctrl.tabs.indexOf(selectedItem);
    ctrl.focusIndex    = ctrl.tabs.indexOf(focusItem);
  }

  /**
   * This moves the selected or focus index left or right. This is used by the keydown handler.
   * @param {number} inc amount to increment
   * @param {boolean} focus true to increment the focus index, false to increment the selected index
   */
  function incrementIndex (inc, focus) {
    var newIndex,
        key   = focus ? 'focusIndex' : 'selectedIndex',
        index = ctrl[ key ];
    for (newIndex = index + inc;
         ctrl.tabs[ newIndex ] && ctrl.tabs[ newIndex ].scope.disabled;
         newIndex += inc) { /* do nothing */ }

    newIndex = (index + inc + ctrl.tabs.length) % ctrl.tabs.length;

    if (ctrl.tabs[ newIndex ]) {
      ctrl[ key ] = newIndex;
    }
  }

  /**
   * This is used to forward focus to tab container elements. This method is necessary to avoid
   * animation issues when attempting to focus an item that is out of view.
   */
  function redirectFocus () {
    ctrl.styleTabItemFocus = ($mdInteraction.getLastInteractionType() === 'keyboard');
    getElements().tabs[ ctrl.focusIndex ].focus();
  }

  /**
   * Forces the pagination to move the focused tab into view.
   * @param {number=} index of tab to have its offset adjusted
   */
  function adjustOffset (index) {
    var elements = getElements();

    if (!angular.isNumber(index)) index = ctrl.focusIndex;
    if (!elements.tabs[ index ]) return;
    if (ctrl.shouldCenterTabs) return;
    var tab         = elements.tabs[ index ],
        left        = tab.offsetLeft,
        right       = tab.offsetWidth + left,
        extraOffset = 32;

    // If we are selecting the first tab (in LTR and RTL), always set the offset to 0
    if (index === 0) {
      ctrl.offsetLeft = 0;
      return;
    }

    if (isRtl()) {
      var tabWidthsBefore = calcTabsWidth(Array.prototype.slice.call(elements.tabs, 0, index));
      var tabWidthsIncluding = calcTabsWidth(Array.prototype.slice.call(elements.tabs, 0, index + 1));

      ctrl.offsetLeft = Math.min(ctrl.offsetLeft, fixOffset(tabWidthsBefore));
      ctrl.offsetLeft = Math.max(ctrl.offsetLeft, fixOffset(tabWidthsIncluding - elements.canvas.clientWidth));
    } else {
      ctrl.offsetLeft = Math.max(ctrl.offsetLeft, fixOffset(right - elements.canvas.clientWidth + extraOffset));
      ctrl.offsetLeft = Math.min(ctrl.offsetLeft, fixOffset(left));
    }
  }

  /**
   * Iterates through all queued functions and clears the queue. This is used for functions that
   * are called before the UI is ready, such as size calculations.
   */
  function processQueue () {
    queue.forEach(function (func) { $mdUtil.nextTick(func); });
    queue = [];
  }

  /**
   * Determines if the tab content area is needed.
   */
  function updateHasContent () {
    var hasContent = false;
    var i;

    for (i = 0; i < ctrl.tabs.length; i++) {
      if (ctrl.tabs[i].hasContent) {
        hasContent = true;
        break;
      }
    }

    ctrl.hasContent = hasContent;
  }

  /**
   * Moves the indexes to their nearest valid values.
   */
  function refreshIndex () {
    ctrl.selectedIndex = getNearestSafeIndex(ctrl.selectedIndex);
    ctrl.focusIndex    = getNearestSafeIndex(ctrl.focusIndex);
  }

  /**
   * Calculates the content height of the current tab.
   * @returns {*}
   */
  function updateHeightFromContent () {
    if (!ctrl.dynamicHeight) return $element.css('height', '');
    if (!ctrl.tabs.length) return queue.push(updateHeightFromContent);

    var elements = getElements();

    var tabContent    = elements.contents[ ctrl.selectedIndex ],
        contentHeight = tabContent ? tabContent.offsetHeight : 0,
        tabsHeight    = elements.wrapper.offsetHeight,
        newHeight     = contentHeight + tabsHeight,
        currentHeight = $element.prop('clientHeight');

    if (currentHeight === newHeight) return;

    // Adjusts calculations for when the buttons are bottom-aligned since this relies on absolute
    // positioning.  This should probably be cleaned up if a cleaner solution is possible.
    if ($element.attr('md-align-tabs') === 'bottom') {
      currentHeight -= tabsHeight;
      newHeight -= tabsHeight;
      // Need to include bottom border in these calculations
      if ($element.attr('md-border-bottom') !== undefined) {
        ++currentHeight;
      }
    }

    // Lock during animation so the user can't change tabs
    locked = true;

    var fromHeight = { height: currentHeight + 'px' },
        toHeight = { height: newHeight + 'px' };

    // Set the height to the current, specific pixel height to fix a bug on iOS where the height
    // first animates to 0, then back to the proper height causing a visual glitch
    $element.css(fromHeight);

    // Animate the height from the old to the new
    $animateCss($element, {
      from: fromHeight,
      to: toHeight,
      easing: 'cubic-bezier(0.35, 0, 0.25, 1)',
      duration: 0.5
    }).start().done(function () {
      // Then (to fix the same iOS issue as above), disable transitions and remove the specific
      // pixel height so the height can size with browser width/content changes, etc.
      $element.css({
        transition: 'none',
        height: ''
      });

      // In the next tick, re-allow transitions (if we do it all at once, $element.css is "smart"
      // enough to batch it for us instead of doing it immediately, which undoes the original
      // transition: none)
      $mdUtil.nextTick(function() {
        $element.css('transition', '');
      });

      // And unlock so tab changes can occur
      locked = false;
    });
  }

  /**
   * Repositions the ink bar to the selected tab.
   * Parameters are used when calling itself recursively when md-center-tabs is used as we need to
   * run two passes to properly center the tabs. These parameters ensure that we only run two passes
   * and that we don't run indefinitely.
   * @param {number=} previousTotalWidth previous width of pagination wrapper
   * @param {number=} previousWidthOfTabItems previous width of all tab items
   */
  function updateInkBarStyles (previousTotalWidth, previousWidthOfTabItems) {
    if (ctrl.noInkBar) {
      return;
    }
    var elements = getElements();

    if (!elements.tabs[ ctrl.selectedIndex ]) {
      angular.element(elements.inkBar).css({ left: 'auto', right: 'auto' });
      return;
    }

    if (!ctrl.tabs.length) {
      queue.push(ctrl.updateInkBarStyles);
      return;
    }
    // If the element is not visible, we will not be able to calculate sizes until it becomes
    // visible. We should treat that as a resize event rather than just updating the ink bar.
    if (!$element.prop('offsetParent')) {
      handleResizeWhenVisible();
      return;
    }

    var index      = ctrl.selectedIndex,
        totalWidth = elements.paging.offsetWidth,
        tab        = elements.tabs[ index ],
        left       = tab.offsetLeft,
        right      = totalWidth - left - tab.offsetWidth;

    if (ctrl.shouldCenterTabs) {
      // We need to use the same calculate process as in the pagination wrapper, to avoid rounding
      // deviations.
      var totalWidthOfTabItems = calcTabsWidth(elements.tabs);

      if (totalWidth > totalWidthOfTabItems &&
          previousTotalWidth !== totalWidth &&
          previousWidthOfTabItems !== totalWidthOfTabItems) {
        $timeout(updateInkBarStyles, 0, true, totalWidth, totalWidthOfTabItems);
      }
    }
    updateInkBarClassName();
    angular.element(elements.inkBar).css({ left: left + 'px', right: right + 'px' });
  }

  /**
   * Adds left/right classes so that the ink bar will animate properly.
   */
  function updateInkBarClassName () {
    var elements = getElements();
    var newIndex = ctrl.selectedIndex,
        oldIndex = ctrl.lastSelectedIndex,
        ink      = angular.element(elements.inkBar);
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
    var elements = getElements();

    if (!elements.tabs.length || !ctrl.shouldPaginate) return 0;

    var lastTab    = elements.tabs[ elements.tabs.length - 1 ],
        totalWidth = lastTab.offsetLeft + lastTab.offsetWidth;

    if (isRtl()) {
      value = Math.min(elements.paging.offsetWidth - elements.canvas.clientWidth, value);
      value = Math.max(0, value);
    } else {
      value = Math.max(0, value);
      value = Math.min(totalWidth - elements.canvas.clientWidth, value);
    }

    return value;
  }

  /**
   * Attaches a ripple to the tab item element.
   * @param scope
   * @param element
   */
  function attachRipple (scope, element) {
    var elements = getElements();
    var options = { colorElement: angular.element(elements.inkBar) };
    $mdTabInkRipple.attach(scope, element, options);
  }

  /**
   * Sets the `aria-controls` attribute to the elements that correspond to the passed-in tab.
   * @param tab
   */
  function setAriaControls (tab) {
    if (tab.hasContent) {
      var nodes = $element[0].querySelectorAll('[md-tab-id="' + tab.id + '"]');
      angular.element(nodes).attr('aria-controls', ctrl.tabContentPrefix + tab.id);
    }
  }

  function isRtl() {
    return ($mdUtil.bidi() === 'rtl');
  }
}
