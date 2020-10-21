angular
    .module('material.components.autocomplete')
    .controller('MdAutocompleteCtrl', MdAutocompleteCtrl);

var ITEM_HEIGHT   = 48,
    MAX_ITEMS     = 5,
    MENU_PADDING  = 8,
    INPUT_PADDING = 2, // Padding provided by `md-input-container`
    MODE_STANDARD = 'standard',
    MODE_VIRTUAL = 'virtual';

function MdAutocompleteCtrl ($scope, $element, $mdUtil, $mdConstant, $mdTheming, $window,
                             $animate, $rootElement, $attrs, $q, $log, $mdLiveAnnouncer) {

  // Internal Variables.
  var ctrl                 = this,
      itemParts            = $scope.itemsExpr.split(/ in /i),
      itemExpr             = itemParts[ 1 ],
      elements             = null,
      cache                = {},
      noBlur               = false,
      selectedItemWatchers = [],
      hasFocus             = false,
      fetchesInProgress    = 0,
      enableWrapScroll     = null,
      inputModelCtrl       = null,
      debouncedOnResize    = $mdUtil.debounce(onWindowResize),
      mode                 = MODE_VIRTUAL; // default

  /**
   * The root document element. This is used for attaching a top-level click handler to
   * close the options panel when a click outside said panel occurs. We use `documentElement`
   * instead of body because, when scrolling is disabled, some browsers consider the body element
   * to be completely off the screen and propagate events directly to the html element.
   * @type {!Object} angular.JQLite
   */
  ctrl.documentElement = angular.element(document.documentElement);

  // Public Exported Variables with handlers
  defineProperty('hidden', handleHiddenChange, true);

  // Public Exported Variables
  ctrl.scope = $scope;
  ctrl.parent = $scope.$parent;
  ctrl.itemName = itemParts[0];
  ctrl.matches = [];
  ctrl.loading = false;
  ctrl.hidden = true;
  ctrl.index = -1;
  ctrl.activeOption = null;
  ctrl.id = $mdUtil.nextUid();
  ctrl.isDisabled = null;
  ctrl.isRequired = null;
  ctrl.isReadonly = null;
  ctrl.hasNotFound = false;
  ctrl.selectedMessage = $scope.selectedMessage || 'selected';
  ctrl.defaultEscapeOptions = 'clear';

  // Public Exported Methods
  ctrl.keydown = keydown;
  ctrl.blur = blur;
  ctrl.focus = focus;
  ctrl.clear = clearValue;
  ctrl.select = select;
  ctrl.listEnter = onListEnter;
  ctrl.listLeave = onListLeave;
  ctrl.focusInput = focusInputElement;
  ctrl.getCurrentDisplayValue = getCurrentDisplayValue;
  ctrl.registerSelectedItemWatcher = registerSelectedItemWatcher;
  ctrl.unregisterSelectedItemWatcher = unregisterSelectedItemWatcher;
  ctrl.notFoundVisible = notFoundVisible;
  ctrl.loadingIsVisible = loadingIsVisible;
  ctrl.positionDropdown = positionDropdown;

  /**
   * Report types to be used for the $mdLiveAnnouncer
   * @enum {number} Unique flag id.
   */
  var ReportType = {
    Count: 1,
    Selected: 2
  };

  return init();

  // initialization methods

  /**
   * Initialize the controller, setup watchers, gather elements
   */
  function init () {

    $mdUtil.initOptionalProperties($scope, $attrs, {
      searchText: '',
      selectedItem: null,
      clearButton: false,
      disableVirtualRepeat: false,
    });

    $mdTheming($element);
    configureWatchers();
    $mdUtil.nextTick(function () {

      gatherElements();
      moveDropdown();

      // Touch devices often do not send a click event on tap. We still want to focus the input
      // and open the options pop-up in these cases.
      $element.on('touchstart', focusInputElement);

      // Forward all focus events to the input element when autofocus is enabled
      if ($scope.autofocus) {
        $element.on('focus', focusInputElement);
      }
      if ($scope.inputAriaDescribedBy) {
        elements.input.setAttribute('aria-describedby', $scope.inputAriaDescribedBy);
      }
      if (!$scope.floatingLabel) {
        if ($scope.inputAriaLabel) {
          elements.input.setAttribute('aria-label', $scope.inputAriaLabel);
        } else if ($scope.inputAriaLabelledBy) {
          elements.input.setAttribute('aria-labelledby', $scope.inputAriaLabelledBy);
        } else if ($scope.placeholder) {
          // If no aria-label or aria-labelledby references are defined, then just label using the
          // placeholder.
          elements.input.setAttribute('aria-label', $scope.placeholder);
        }
      }
    });
  }

  function updateModelValidators() {
    if (!$scope.requireMatch || !inputModelCtrl) return;

    inputModelCtrl.$setValidity('md-require-match', !!$scope.selectedItem || !$scope.searchText);
  }

  /**
   * Calculates the dropdown's position and applies the new styles to the menu element
   * @returns {*}
   */
  function positionDropdown () {
    if (!elements) {
      return $mdUtil.nextTick(positionDropdown, false, $scope);
    }

    var dropdownHeight = ($scope.dropdownItems || MAX_ITEMS) * ITEM_HEIGHT;
    var hrect  = elements.wrap.getBoundingClientRect(),
        vrect  = elements.snap.getBoundingClientRect(),
        root   = elements.root.getBoundingClientRect(),
        top    = vrect.bottom - root.top,
        bot    = root.bottom - vrect.top,
        left   = hrect.left - root.left,
        width  = hrect.width,
        offset = getVerticalOffset(),
        position = $scope.dropdownPosition,
        styles, enoughBottomSpace, enoughTopSpace;
    var bottomSpace = root.bottom - vrect.bottom - MENU_PADDING + $mdUtil.getViewportTop();
    var topSpace = vrect.top - MENU_PADDING;

    // Automatically determine dropdown placement based on available space in viewport.
    if (!position) {
      enoughTopSpace = topSpace > dropdownHeight;
      enoughBottomSpace = bottomSpace > dropdownHeight;
      if (enoughBottomSpace) {
        position = 'bottom';
      } else if (enoughTopSpace) {
        position = 'top';
      } else {
        position = topSpace > bottomSpace ? 'top' : 'bottom';
      }
    }
    // Adjust the width to account for the padding provided by `md-input-container`
    if ($attrs.mdFloatingLabel) {
      left += INPUT_PADDING;
      width -= INPUT_PADDING * 2;
    }
    styles = {
      left:     left + 'px',
      minWidth: width + 'px',
      maxWidth: Math.max(hrect.right - root.left, root.right - hrect.left) - MENU_PADDING + 'px'
    };

    if (position === 'top') {
      styles.top       = 'auto';
      styles.bottom    = bot + 'px';
      styles.maxHeight = Math.min(dropdownHeight, topSpace) + 'px';
    } else {
      bottomSpace = root.bottom - hrect.bottom - MENU_PADDING + $mdUtil.getViewportTop();

      styles.top       = (top - offset) + 'px';
      styles.bottom    = 'auto';
      styles.maxHeight = Math.min(dropdownHeight, bottomSpace) + 'px';
    }

    elements.$.scrollContainer.css(styles);
    $mdUtil.nextTick(correctHorizontalAlignment, false, $scope);

    /**
     * Calculates the vertical offset for floating label examples to account for ngMessages
     * @returns {number}
     */
    function getVerticalOffset () {
      var offset = 0;
      var inputContainer = $element.find('md-input-container');
      if (inputContainer.length) {
        var input = inputContainer.find('input');
        offset = inputContainer.prop('offsetHeight');
        offset -= input.prop('offsetTop');
        offset -= input.prop('offsetHeight');
        // add in the height left up top for the floating label text
        offset += inputContainer.prop('offsetTop');
      }
      return offset;
    }

    /**
     * Makes sure that the menu doesn't go off of the screen on either side.
     */
    function correctHorizontalAlignment () {
      var dropdown = elements.scrollContainer.getBoundingClientRect(),
          styles   = {};
      if (dropdown.right > root.right) {
        styles.left = (hrect.right - dropdown.width) + 'px';
      }
      elements.$.scrollContainer.css(styles);
    }
  }

  /**
   * Moves the dropdown menu to the body tag in order to avoid z-index and overflow issues.
   */
  function moveDropdown () {
    if (!elements.$.root.length) return;
    $mdTheming(elements.$.scrollContainer);
    elements.$.scrollContainer.detach();
    elements.$.root.append(elements.$.scrollContainer);
    if ($animate.pin) $animate.pin(elements.$.scrollContainer, $rootElement);
  }

  /**
   * Sends focus to the input element.
   */
  function focusInputElement () {
    elements.input.focus();
  }

  /**
   * Update the activeOption based on the selected item in the listbox.
   * The activeOption is used in the template to set the aria-activedescendant attribute, which
   * enables screen readers to properly handle visual focus within the listbox and announce the
   * item's place in the list. I.e. "List item 3 of 50". Anytime that `ctrl.index` changes, this
   * function needs to be called to update the activeOption.
   */
  function updateActiveOption() {
    var selectedOption = elements.scroller.querySelector('.selected');
    if (selectedOption) {
      ctrl.activeOption = selectedOption.id;
    } else {
      ctrl.activeOption = null;
    }
  }

  /**
   * Sets up any watchers used by autocomplete
   */
  function configureWatchers () {
    var wait = parseInt($scope.delay, 10) || 0;

    $attrs.$observe('disabled', function (value) { ctrl.isDisabled = $mdUtil.parseAttributeBoolean(value, false); });
    $attrs.$observe('required', function (value) { ctrl.isRequired = $mdUtil.parseAttributeBoolean(value, false); });
    $attrs.$observe('readonly', function (value) { ctrl.isReadonly = $mdUtil.parseAttributeBoolean(value, false); });

    $scope.$watch('searchText', wait ? $mdUtil.debounce(handleSearchText, wait) : handleSearchText);
    $scope.$watch('selectedItem', selectedItemChange);

    angular.element($window).on('resize', debouncedOnResize);

    $scope.$on('$destroy', cleanup);
  }

  /**
   * Removes any events or leftover elements created by this controller
   */
  function cleanup () {
    if (!ctrl.hidden) {
      $mdUtil.enableScrolling();
    }

    angular.element($window).off('resize', debouncedOnResize);

    if (elements){
      var items = ['ul', 'scroller', 'scrollContainer', 'input'];
      angular.forEach(items, function(key){
        elements.$[key].remove();
      });
    }
  }

  /**
   * Event handler to be called whenever the window resizes.
   */
  function onWindowResize() {
    if (!ctrl.hidden) {
      positionDropdown();
    }
  }

  /**
   * Gathers all of the elements needed for this controller
   */
  function gatherElements () {

    var snapWrap = gatherSnapWrap();

    elements = {
      main:  $element[0],
      scrollContainer: $element[0].querySelector('.md-virtual-repeat-container, .md-standard-list-container'),
      scroller: $element[0].querySelector('.md-virtual-repeat-scroller, .md-standard-list-scroller'),
      ul:    $element.find('ul')[0],
      input: $element.find('input')[0],
      wrap:  snapWrap.wrap,
      snap:  snapWrap.snap,
      root:  document.body,
    };

    elements.li   = elements.ul.getElementsByTagName('li');
    elements.$    = getAngularElements(elements);
    mode = elements.scrollContainer.classList.contains('md-standard-list-container') ? MODE_STANDARD : MODE_VIRTUAL;
    inputModelCtrl = elements.$.input.controller('ngModel');
  }

  /**
   * Gathers the snap and wrap elements
   *
   */
  function gatherSnapWrap() {
    var element;
    var value;
    for (element = $element; element.length; element = element.parent()) {
      value = element.attr('md-autocomplete-snap');
      if (angular.isDefined(value)) break;
    }

    if (element.length) {
      return {
        snap: element[0],
        wrap: (value.toLowerCase() === 'width') ? element[0] : $element.find('md-autocomplete-wrap')[0]
      };
    }

    var wrap = $element.find('md-autocomplete-wrap')[0];
    return {
      snap: wrap,
      wrap: wrap
    };
  }

  /**
   * Gathers angular-wrapped versions of each element
   * @param elements
   * @returns {{}}
   */
  function getAngularElements (elements) {
    var obj = {};
    for (var key in elements) {
      if (elements.hasOwnProperty(key)) obj[ key ] = angular.element(elements[ key ]);
    }
    return obj;
  }

  // event/change handlers

  /**
   * @param {Event} $event
   */
  function preventDefault($event) {
    $event.preventDefault();
  }

  /**
   * @param {Event} $event
   */
  function stopPropagation($event) {
    $event.stopPropagation();
  }

  /**
   * Handles changes to the `hidden` property.
   * @param {boolean} hidden true to hide the options pop-up, false to show it.
   * @param {boolean} oldHidden the previous value of hidden
   */
  function handleHiddenChange (hidden, oldHidden) {
    var scrollContainerElement;

    if (elements) {
      scrollContainerElement = angular.element(elements.scrollContainer);
    }
    if (!hidden && oldHidden) {
      positionDropdown();

      // Report in polite mode, because the screen reader should finish the default description of
      // the input element.
      reportMessages(true, ReportType.Count | ReportType.Selected);

      if (elements) {
        $mdUtil.disableScrollAround(elements.scrollContainer);
        enableWrapScroll = disableElementScrollEvents(elements.wrap);
        if ($mdUtil.isIos) {
          ctrl.documentElement.on('touchend', handleTouchOutsidePanel);
          if (scrollContainerElement) {
            scrollContainerElement.on('touchstart touchmove touchend', stopPropagation);
          }
        }
        ctrl.index = getDefaultIndex();
        $mdUtil.nextTick(function() {
          updateActiveOption();
          updateScroll();
        });
      }
    } else if (hidden && !oldHidden) {
      if ($mdUtil.isIos) {
        ctrl.documentElement.off('touchend', handleTouchOutsidePanel);
        if (scrollContainerElement) {
          scrollContainerElement.off('touchstart touchmove touchend', stopPropagation);
        }
      }
      $mdUtil.enableScrolling();

      if (enableWrapScroll) {
        enableWrapScroll();
        enableWrapScroll = null;
      }
    }
  }

  /**
   * Handling touch events that bubble up to the document is required for closing the dropdown
   * panel on touch outside of the options pop-up panel on iOS.
   * @param {Event} $event
   */
  function handleTouchOutsidePanel($event) {
    ctrl.hidden = true;
    // iOS does not blur the pop-up for touches on the scroll mask, so we have to do it.
    doBlur(true);
  }

  /**
   * Disables scrolling for a specific element.
   * @param {!string|!DOMElement} element to disable scrolling
   * @return {Function} function to call to re-enable scrolling for the element
   */
  function disableElementScrollEvents(element) {
    var elementToDisable = angular.element(element);
    elementToDisable.on('wheel touchmove', preventDefault);

    return function() {
      elementToDisable.off('wheel touchmove', preventDefault);
    };
  }

  /**
   * When the user mouses over the dropdown menu, ignore blur events.
   */
  function onListEnter () {
    noBlur = true;
  }

  /**
   * When the user's mouse leaves the menu, blur events may hide the menu again.
   */
  function onListLeave () {
    if (!hasFocus && !ctrl.hidden) elements.input.focus();
    noBlur = false;
    ctrl.hidden = shouldHide();
  }

  /**
   * Handles changes to the selected item.
   * @param selectedItem
   * @param previousSelectedItem
   */
  function selectedItemChange (selectedItem, previousSelectedItem) {

    updateModelValidators();

    if (selectedItem) {
      getDisplayValue(selectedItem).then(function (val) {
        $scope.searchText = val;
        handleSelectedItemChange(selectedItem, previousSelectedItem);
      });
    } else if (previousSelectedItem && $scope.searchText) {
      getDisplayValue(previousSelectedItem).then(function(displayValue) {
        // Clear the searchText, when the selectedItem is set to null.
        // Do not clear the searchText, when the searchText isn't matching with the previous
        // selected item.
        if (angular.isString($scope.searchText)
          && displayValue.toString().toLowerCase() === $scope.searchText.toLowerCase()) {
          $scope.searchText = '';
        }
      });
    }

    if (selectedItem !== previousSelectedItem) {
      announceItemChange();
    }
  }

  /**
   * Use the user-defined expression to announce changes each time a new item is selected
   */
  function announceItemChange () {
    angular.isFunction($scope.itemChange) &&
      $scope.itemChange(getItemAsNameVal($scope.selectedItem));
  }

  /**
   * Use the user-defined expression to announce changes each time the search text is changed
   */
  function announceTextChange () {
    angular.isFunction($scope.textChange) && $scope.textChange();
  }

  /**
   * Calls any external watchers listening for the selected item.  Used in conjunction with
   * `registerSelectedItemWatcher`.
   * @param selectedItem
   * @param previousSelectedItem
   */
  function handleSelectedItemChange (selectedItem, previousSelectedItem) {
    selectedItemWatchers.forEach(function (watcher) {
      watcher(selectedItem, previousSelectedItem);
    });
  }

  /**
   * Register a function to be called when the selected item changes.
   * @param cb
   */
  function registerSelectedItemWatcher (cb) {
    if (selectedItemWatchers.indexOf(cb) === -1) {
      selectedItemWatchers.push(cb);
    }
  }

  /**
   * Unregister a function previously registered for selected item changes.
   * @param cb
   */
  function unregisterSelectedItemWatcher (cb) {
    var i = selectedItemWatchers.indexOf(cb);
    if (i !== -1) {
      selectedItemWatchers.splice(i, 1);
    }
  }

  /**
   * Handles changes to the searchText property.
   * @param {string} searchText
   * @param {string} previousSearchText
   */
  function handleSearchText (searchText, previousSearchText) {
    ctrl.index = getDefaultIndex();

    // do nothing on init
    if (searchText === previousSearchText) return;

    updateModelValidators();

    getDisplayValue($scope.selectedItem).then(function (val) {
      // clear selected item if search text no longer matches it
      if (searchText !== val) {
        $scope.selectedItem = null;

        // trigger change event if available
        if (searchText !== previousSearchText) {
          announceTextChange();
        }

        // cancel results if search text is not long enough
        if (!isMinLengthMet()) {
          ctrl.matches = [];

          setLoading(false);
          reportMessages(true, ReportType.Count);

        } else {
          handleQuery();
        }
      }
    });

  }

  /**
   * Handles input blur event, determines if the dropdown should hide.
   */
  function blur($event) {
    hasFocus = false;

    if (!noBlur) {
      ctrl.hidden = shouldHide();
      evalAttr('ngBlur', { $event: $event });
    }
  }

  /**
   * Force blur on input element
   * @param {boolean} forceBlur
   */
  function doBlur(forceBlur) {
    if (forceBlur) {
      noBlur = false;
      hasFocus = false;
    }
    elements.input.blur();
  }

  /**
   * Handles input focus event, determines if the dropdown should show.
   */
  function focus($event) {
    hasFocus = true;

    if (isSearchable() && isMinLengthMet()) {
      handleQuery();
    }

    ctrl.hidden = shouldHide();

    evalAttr('ngFocus', { $event: $event });
  }

  /**
   * Handles keyboard input.
   * @param event
   */
  function keydown (event) {
    switch (event.keyCode) {
      case $mdConstant.KEY_CODE.DOWN_ARROW:
        if (ctrl.loading || hasSelection()) return;
        event.stopPropagation();
        event.preventDefault();
        ctrl.index = ctrl.index + 1 > ctrl.matches.length - 1 ? 0 : Math.min(ctrl.index + 1, ctrl.matches.length - 1);
        $mdUtil.nextTick(updateActiveOption);
        updateScroll();
        break;
      case $mdConstant.KEY_CODE.UP_ARROW:
        if (ctrl.loading || hasSelection()) return;
        event.stopPropagation();
        event.preventDefault();
        ctrl.index = ctrl.index - 1 < 0 ? ctrl.matches.length - 1 : Math.max(0, ctrl.index - 1);
        $mdUtil.nextTick(updateActiveOption);
        updateScroll();
        break;
      case $mdConstant.KEY_CODE.TAB:
        // If we hit tab, assume that we've left the list so it will close
        onListLeave();

        if (ctrl.hidden || ctrl.loading || ctrl.index < 0 || ctrl.matches.length < 1) return;
        select(ctrl.index);
        break;
      case $mdConstant.KEY_CODE.ENTER:
        if (ctrl.hidden || ctrl.loading || ctrl.index < 0 || ctrl.matches.length < 1) return;
        if (hasSelection()) return;
        event.stopImmediatePropagation();
        event.preventDefault();
        select(ctrl.index);
        break;
      case $mdConstant.KEY_CODE.ESCAPE:
        event.preventDefault(); // Prevent browser from always clearing input
        if (!shouldProcessEscape()) return;
        event.stopPropagation();

        clearSelectedItem();
        if ($scope.searchText && hasEscapeOption('clear')) {
          clearSearchText();
        }

        // Manually hide (needed for mdNotFound support)
        ctrl.hidden = true;

        if (hasEscapeOption('blur')) {
          // Force the component to blur if they hit escape
          doBlur(true);
        }

        break;
      default:
    }
  }

  // getters

  /**
   * Returns the minimum length needed to display the dropdown.
   * @returns {*}
   */
  function getMinLength () {
    return angular.isNumber($scope.minLength) ? $scope.minLength : 1;
  }

  /**
   * Returns the display value for an item.
   * @param {*} item
   * @returns {*}
   */
  function getDisplayValue (item) {
    return $q.when(getItemText(item) || item).then(function(itemText) {
      if (itemText && !angular.isString(itemText)) {
        $log.warn('md-autocomplete: Could not resolve display value to a string. ' +
          'Please check the `md-item-text` attribute.');
      }

      return itemText;
    });

    /**
     * Getter function to invoke user-defined expression (in the directive)
     * to convert your object to a single string.
     * @param {*} item
     * @returns {string|null}
     */
    function getItemText (item) {
      return (item && $scope.itemText) ? $scope.itemText(getItemAsNameVal(item)) : null;
    }
  }

  /**
   * Returns the locals object for compiling item templates.
   * @param {*} item
   * @returns {Object|undefined}
   */
  function getItemAsNameVal (item) {
    if (!item) {
      return undefined;
    }

    var locals = {};
    if (ctrl.itemName) {
      locals[ ctrl.itemName ] = item;
    }

    return locals;
  }

  /**
   * Returns the default index based on whether or not autoselect is enabled.
   * @returns {number} 0 if autoselect is enabled, -1 if not.
   */
  function getDefaultIndex () {
    return $scope.autoselect ? 0 : -1;
  }

  /**
   * Sets the loading parameter and updates the hidden state.
   * @param value {boolean} Whether or not the component is currently loading.
   */
  function setLoading(value) {
    if (ctrl.loading !== value) {
      ctrl.loading = value;
    }

    // Always refresh the hidden variable as something else might have changed
    ctrl.hidden = shouldHide();
  }

  /**
   * Determines if the menu should be hidden.
   * @returns {boolean} true if the menu should be hidden
   */
  function shouldHide () {
    return !shouldShow();
  }

  /**
   * Determines whether the autocomplete is able to query within the current state.
   * @returns {boolean} true if the query can be run
   */
  function isSearchable() {
    if (ctrl.loading && !hasMatches()) {
      // No query when query is in progress.
      return false;
    } else if (hasSelection()) {
      // No query if there is already a selection
      return false;
    }
    else if (!hasFocus) {
      // No query if the input does not have focus
      return false;
    }
    return true;
  }

  /**
   * @returns {boolean} if the escape keydown should be processed, return true.
   *  Otherwise return false.
   */
  function shouldProcessEscape() {
    return hasEscapeOption('blur') || !ctrl.hidden || ctrl.loading || hasEscapeOption('clear') && $scope.searchText;
  }

  /**
   * @param {string} option check if this option is set
   * @returns {boolean} if the specified escape option is set, return true. Return false otherwise.
   */
  function hasEscapeOption(option) {
    if (!angular.isString($scope.escapeOptions)) {
      return ctrl.defaultEscapeOptions.indexOf(option) !== -1;
    } else {
      return $scope.escapeOptions.toLowerCase().indexOf(option) !== -1;
    }
  }

  /**
   * Determines if the menu should be shown.
   * @returns {boolean} true if the menu should be shown
   */
  function shouldShow() {
    if (ctrl.isReadonly) {
      // Don't show if read only is set
      return false;
    } else if (!isSearchable()) {
      // Don't show if a query is in progress, there is already a selection,
      // or the input is not focused.
      return false;
    }
    return (isMinLengthMet() && hasMatches()) || notFoundVisible();
  }

  /**
   * @returns {boolean} true if the search text has matches.
   */
  function hasMatches() {
    return ctrl.matches.length ? true : false;
  }

  /**
   * @returns {boolean} true if the autocomplete has a valid selection.
   */
  function hasSelection() {
    return ctrl.scope.selectedItem ? true : false;
  }

  /**
   * @returns {boolean} true if the loading indicator is, or should be, visible.
   */
  function loadingIsVisible() {
    return ctrl.loading && !hasSelection();
  }

  /**
   * @returns {*} the display value of the current item.
   */
  function getCurrentDisplayValue () {
    return getDisplayValue(ctrl.matches[ ctrl.index ]);
  }

  /**
   * Determines if the minimum length is met by the search text.
   * @returns {*} true if the minimum length is met by the search text
   */
  function isMinLengthMet () {
    return ($scope.searchText || '').length >= getMinLength();
  }

  // actions

  /**
   * Defines a public property with a handler and a default value.
   * @param {string} key
   * @param {Function} handler function
   * @param {*} defaultValue default value
   */
  function defineProperty (key, handler, defaultValue) {
    Object.defineProperty(ctrl, key, {
      get: function () { return defaultValue; },
      set: function (newValue) {
        var oldValue = defaultValue;
        defaultValue        = newValue;
        handler(newValue, oldValue);
      }
    });
  }

  /**
   * Selects the item at the given index.
   * @param {number} index to select
   */
  function select (index) {
    // force form to update state for validation
    $mdUtil.nextTick(function () {
      getDisplayValue(ctrl.matches[ index ]).then(function (val) {
        var ngModel = elements.$.input.controller('ngModel');
        $mdLiveAnnouncer.announce(val + ' ' + ctrl.selectedMessage, 'assertive');
        ngModel.$setViewValue(val);
        ngModel.$render();
      }).finally(function () {
        $scope.selectedItem = ctrl.matches[ index ];
        setLoading(false);
      });
    }, false);
  }

  /**
   * Clears the searchText value and selected item.
   * @param {Event} $event
   */
  function clearValue ($event) {
    if ($event) {
      $event.stopPropagation();
    }
    clearSelectedItem();
    clearSearchText();
  }

  /**
   * Clears the selected item
   */
  function clearSelectedItem () {
    // Reset our variables
    ctrl.index = -1;
    $mdUtil.nextTick(updateActiveOption);
    ctrl.matches = [];
  }

  /**
   * Clears the searchText value
   */
  function clearSearchText () {
    // Set the loading to true so we don't see flashes of content.
    // The flashing will only occur when an async request is running.
    // So the loading process will stop when the results had been retrieved.
    setLoading(true);

    $scope.searchText = '';

    // Normally, triggering the change / input event is unnecessary, because the browser detects it properly.
    // But some browsers are not detecting it properly, which means that we have to trigger the event.
    // Using the `input` is not working properly, because for example IE11 is not supporting the `input` event.
    // The `change` event is a good alternative and is supported by all supported browsers.
    var eventObj = document.createEvent('CustomEvent');
    eventObj.initCustomEvent('change', true, true, { value: '' });
    elements.input.dispatchEvent(eventObj);

    // For some reason, firing the above event resets the value of $scope.searchText if
    // $scope.searchText has a space character at the end, so we blank it one more time and then
    // focus.
    elements.input.blur();
    $scope.searchText = '';
    elements.input.focus();
  }

  /**
   * Fetches the results for the provided search text.
   * @param searchText
   */
  function fetchResults (searchText) {
    var items = $scope.$parent.$eval(itemExpr),
        term  = searchText.toLowerCase(),
        isList = angular.isArray(items),
        isPromise = !!items.then; // Every promise should contain a `then` property

    if (isList) onResultsRetrieved(items);
    else if (isPromise) handleAsyncResults(items);

    function handleAsyncResults(items) {
      if (!items) return;

      items = $q.when(items);
      fetchesInProgress++;
      setLoading(true);

      $mdUtil.nextTick(function () {
          items
            .then(onResultsRetrieved)
            .finally(function(){
              if (--fetchesInProgress === 0) {
                setLoading(false);
              }
            });
      },true, $scope);
    }

    function onResultsRetrieved(matches) {
      cache[term] = matches;

      // Just cache the results if the request is now outdated.
      // The request becomes outdated, when the new searchText has changed during the result fetching.
      if ((searchText || '') !== ($scope.searchText || '')) {
        return;
      }

      handleResults(matches);
    }
  }


  /**
   * Reports given message types to supported screen readers.
   * @param {boolean} isPolite Whether the announcement should be polite.
   * @param {!number} types Message flags to be reported to the screen reader.
   */
  function reportMessages(isPolite, types) {
    var politeness = isPolite ? 'polite' : 'assertive';
    var messages = [];

    if (types & ReportType.Selected && ctrl.index !== -1) {
      messages.push(getCurrentDisplayValue());
    }

    if (types & ReportType.Count) {
      messages.push($q.resolve(getCountMessage()));
    }

    $q.all(messages).then(function(data) {
      $mdLiveAnnouncer.announce(data.join(' '), politeness);
    });
  }

  /**
   * @returns {string} the ARIA message for how many results match the current query.
   */
  function getCountMessage () {
    switch (ctrl.matches.length) {
      case 0:
        return 'There are no matches available.';
      case 1:
        return 'There is 1 match available.';
      default:
        return 'There are ' + ctrl.matches.length + ' matches available.';
    }
  }

  /**
   * Makes sure that the focused element is within view.
   */
  function updateScroll () {
    if (!elements.li[0]) return;
    if (mode === MODE_STANDARD) {
      updateStandardScroll();
    } else {
      updateVirtualScroll();
    }
  }

  function updateVirtualScroll() {
    // elements in virtual scroll have consistent heights
    var optionHeight = elements.li[0].offsetHeight,
        top = optionHeight * Math.max(0, ctrl.index),
        bottom = top + optionHeight,
        containerHeight = elements.scroller.clientHeight,
        scrollTop = elements.scroller.scrollTop;

    if (top < scrollTop) {
      scrollTo(top);
    } else if (bottom > scrollTop + containerHeight) {
      scrollTo(bottom - containerHeight);
    }
  }

  function updateStandardScroll() {
    // elements in standard scroll have variable heights
    var selected =  elements.li[Math.max(0, ctrl.index)];
    var containerHeight = elements.scrollContainer.offsetHeight,
        top = selected && selected.offsetTop || 0,
        bottom = top + selected.clientHeight,
        scrollTop = elements.scrollContainer.scrollTop;

    if (top < scrollTop) {
      scrollTo(top);
    } else if (bottom > scrollTop + containerHeight) {
      scrollTo(bottom - containerHeight);
    }
  }

  function isPromiseFetching() {
    return fetchesInProgress !== 0;
  }

  function scrollTo (offset) {
    if (mode === MODE_STANDARD) {
      elements.scrollContainer.scrollTop = offset;
    } else {
      elements.$.scrollContainer.controller('mdVirtualRepeatContainer').scrollTo(offset);
    }
  }

  function notFoundVisible () {
    var textLength = (ctrl.scope.searchText || '').length;

    return ctrl.hasNotFound && !hasMatches() && (!ctrl.loading || isPromiseFetching()) && textLength >= getMinLength() && (hasFocus || noBlur) && !hasSelection();
  }

  /**
   * Starts the query to gather the results for the current searchText.  Attempts to return cached
   * results first, then forwards the process to `fetchResults` if necessary.
   */
  function handleQuery () {
    var searchText = $scope.searchText || '';
    var term = searchText.toLowerCase();

    // If caching is enabled and the current searchText is stored in the cache
    if (!$scope.noCache && cache[term]) {
      // The results should be handled as same as a normal un-cached request does.
      handleResults(cache[term]);
    } else {
      fetchResults(searchText);
    }

    ctrl.hidden = shouldHide();
  }

  /**
   * Handles the retrieved results by showing them in the autocompletes dropdown.
   * @param results Retrieved results
   */
  function handleResults(results) {
    ctrl.matches = results;
    ctrl.hidden  = shouldHide();

    // If loading is in progress, then we'll end the progress. This is needed for example,
    // when the `clear` button was clicked, because there we always show the loading process, to prevent flashing.
    if (ctrl.loading) setLoading(false);

    if ($scope.selectOnMatch) selectItemOnMatch();

    positionDropdown();
    reportMessages(true, ReportType.Count);
  }

  /**
   * If there is only one matching item and the search text matches its display value exactly,
   * automatically select that item.  Note: This function is only called if the user uses the
   * `md-select-on-match` flag.
   */
  function selectItemOnMatch () {
    var searchText = $scope.searchText,
        matches    = ctrl.matches,
        item       = matches[ 0 ];
    if (matches.length === 1) getDisplayValue(item).then(function (displayValue) {
      var isMatching = searchText === displayValue;
      if ($scope.matchInsensitive && !isMatching) {
        isMatching = searchText.toLowerCase() === displayValue.toLowerCase();
      }

      if (isMatching) {
        select(0);
      }
    });
  }

  /**
   * Evaluates an attribute expression against the parent scope.
   * @param {String} attr Name of the attribute to be evaluated.
   * @param {Object?} locals Properties to be injected into the evaluation context.
   */
 function evalAttr(attr, locals) {
    if ($attrs[attr]) {
      $scope.$parent.$eval($attrs[attr], locals || {});
    }
  }

}
