angular
    .module('material.components.autocomplete')
    .controller('MdAutocompleteCtrl', MdAutocompleteCtrl);

var ITEM_HEIGHT = 41,
    MAX_HEIGHT = 5.5 * ITEM_HEIGHT,
    MENU_PADDING = 8;

function MdAutocompleteCtrl ($scope, $element, $mdUtil, $mdConstant, $mdTheming, $window,
                             $animate, $rootElement, $attrs, $q) {
  //-- private variables
  var ctrl      = this,
      itemParts = $scope.itemsExpr.split(/ in /i),
      itemExpr  = itemParts[1],
      elements  = null,
      cache     = {},
      noBlur    = false,
      selectedItemWatchers = [],
      hasFocus  = false,
      lastCount = 0;

  //-- public variables with handlers
  defineProperty('hidden', handleHiddenChange, true);

  //-- public variables
  ctrl.scope      = $scope;
  ctrl.parent     = $scope.$parent;
  ctrl.itemName   = itemParts[0];
  ctrl.matches    = [];
  ctrl.loading    = false;
  ctrl.hidden     = true;
  ctrl.index      = null;
  ctrl.messages   = [];
  ctrl.id         = $mdUtil.nextUid();
  ctrl.isDisabled = null;
  ctrl.isRequired = null;

  //-- public methods
  ctrl.keydown    = keydown;
  ctrl.blur       = blur;
  ctrl.focus      = focus;
  ctrl.clear      = clearValue;
  ctrl.select     = select;
  ctrl.listEnter  = onListEnter;
  ctrl.listLeave  = onListLeave;
  ctrl.mouseUp    = onMouseup;
  ctrl.getCurrentDisplayValue         = getCurrentDisplayValue;
  ctrl.registerSelectedItemWatcher    = registerSelectedItemWatcher;
  ctrl.unregisterSelectedItemWatcher  = unregisterSelectedItemWatcher;

  return init();

  //-- initialization methods

  /**
   * Initialize the controller, setup watchers, gather elements
   */
  function init () {
    $mdUtil.initOptionalProperties($scope, $attrs, { searchText: null, selectedItem: null } );
    $mdTheming($element);
    configureWatchers();
    $mdUtil.nextTick(function () {
      gatherElements();
      focusElement();
      moveDropdown();
    });
  }

  /**
   * Calculates the dropdown's position and applies the new styles to the menu element
   * @returns {*}
   */
  function positionDropdown () {
    if (!elements) return $mdUtil.nextTick(positionDropdown, false);
    var hrect  = elements.wrap.getBoundingClientRect(),
        vrect  = elements.snap.getBoundingClientRect(),
        root   = elements.root.getBoundingClientRect(),
        top    = vrect.bottom - root.top,
        bot    = root.bottom - vrect.top,
        left   = hrect.left - root.left,
        width  = hrect.width,
        styles = {
          left:     left + 'px',
          minWidth: width + 'px',
          maxWidth: Math.max(hrect.right - root.left, root.right - hrect.left) - MENU_PADDING + 'px'
        };
    if (top > bot && root.height - hrect.bottom - MENU_PADDING < MAX_HEIGHT) {
      styles.top = 'auto';
      styles.bottom = bot + 'px';
      styles.maxHeight = Math.min(MAX_HEIGHT, hrect.top - root.top - MENU_PADDING) + 'px';
    } else {
      styles.top = top + 'px';
      styles.bottom = 'auto';
      styles.maxHeight = Math.min(MAX_HEIGHT, root.bottom - hrect.bottom - MENU_PADDING) + 'px';
    }
    elements.$.ul.css(styles);
    $mdUtil.nextTick(correctHorizontalAlignment, false);

    /**
     * Makes sure that the menu doesn't go off of the screen on either side.
     */
    function correctHorizontalAlignment () {
      var dropdown = elements.ul.getBoundingClientRect(),
          styles   = {};
      if (dropdown.right > root.right - MENU_PADDING) {
        styles.left = (hrect.right - dropdown.width) + 'px';
      }
      elements.$.ul.css(styles);
    }
  }

  /**
   * Moves the dropdown menu to the body tag in order to avoid z-index and overflow issues.
   */
  function moveDropdown () {
    if (!elements.$.root.length) return;
    $mdTheming(elements.$.ul);
    elements.$.ul.detach();
    elements.$.root.append(elements.$.ul);
    if ($animate.pin) $animate.pin(elements.$.ul, $rootElement);
  }

  /**
   * Sends focus to the input element.
   */
  function focusElement () {
    if ($scope.autofocus) elements.input.focus();
  }

  /**
   * Sets up any watchers used by autocomplete
   */
  function configureWatchers () {
    var wait = parseInt($scope.delay, 10) || 0;
    $attrs.$observe('disabled', function (value) { ctrl.isDisabled = value; });
    $attrs.$observe('required', function (value) { ctrl.isRequired = value !== null; });
    $scope.$watch('searchText', wait ? $mdUtil.debounce(handleSearchText, wait) : handleSearchText);
    $scope.$watch('selectedItem', selectedItemChange);
    angular.element($window).on('resize', positionDropdown);
    $scope.$on('$destroy', cleanup);
  }

  /**
   * Removes any events or leftover elements created by this controller
   */
  function cleanup () {
    angular.element($window).off('resize', positionDropdown);
    elements.$.ul.remove();
  }

  /**
   * Gathers all of the elements needed for this controller
   */
  function gatherElements () {
    elements = {
      main:  $element[0],
      ul:    $element.find('ul')[0],
      input: $element.find('input')[0],
      wrap:  $element.find('md-autocomplete-wrap')[0],
      root:  document.body
    };
    elements.li = elements.ul.getElementsByTagName('li');
    elements.snap = getSnapTarget();
    elements.$ = getAngularElements(elements);
  }

  /**
   * Finds the element that the menu will base its position on
   * @returns {*}
   */
  function getSnapTarget () {
    for (var element = $element; element.length; element = element.parent()) {
      if (angular.isDefined(element.attr('md-autocomplete-snap'))) return element[0];
    }
    return elements.wrap;
  }

  /**
   * Gathers angular-wrapped versions of each element
   * @param elements
   * @returns {{}}
   */
  function getAngularElements (elements) {
    var obj = {};
    for (var key in elements) {
      obj[key] = angular.element(elements[key]);
    }
    return obj;
  }

  //-- event/change handlers

  /**
   * Handles changes to the `hidden` property.
   * @param hidden
   * @param oldHidden
   */
  function handleHiddenChange (hidden, oldHidden) {
    if (!hidden && oldHidden) {
      positionDropdown();
      if (elements) $mdUtil.nextTick(function () { $mdUtil.disableScrollAround(elements.ul); }, false);
    } else if (hidden && !oldHidden) {
      $mdUtil.nextTick(function() { $mdUtil.enableScrolling(); }, false);
    }
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
    noBlur = false;
    if (!hasFocus) ctrl.hidden = true;
  }

  /**
   * When the mouse button is released, send focus back to the input field.
   */
  function onMouseup () {
    elements.input.focus();
  }

  /**
   * Handles changes to the selected item.
   * @param selectedItem
   * @param previousSelectedItem
   */
  function selectedItemChange (selectedItem, previousSelectedItem) {
    if (selectedItem) {
      getDisplayValue(selectedItem).then(function(val) {
        $scope.searchText = val;
        handleSelectedItemChange(selectedItem, previousSelectedItem);
      });
    }

    if (selectedItem !== previousSelectedItem) announceItemChange();
  }

  /**
   * Use the user-defined expression to announce changes each time a new item is selected
   */
  function announceItemChange() {
    angular.isFunction($scope.itemChange) && $scope.itemChange(getItemAsNameVal($scope.selectedItem));
  }

  /**
   * Use the user-defined expression to announce changes each time the search text is changed
   */
  function announceTextChange() {
    angular.isFunction($scope.textChange) && $scope.textChange();
  }

  /**
   * Calls any external watchers listening for the selected item.  Used in conjunction with
   * `registerSelectedItemWatcher`.
   * @param selectedItem
   * @param previousSelectedItem
   */
  function handleSelectedItemChange(selectedItem, previousSelectedItem) {
    selectedItemWatchers.forEach(function (watcher) { watcher(selectedItem, previousSelectedItem); });
  }

  /**
   * Register a function to be called when the selected item changes.
   * @param cb
   */
  function registerSelectedItemWatcher(cb) {
    if (selectedItemWatchers.indexOf(cb) == -1) {
      selectedItemWatchers.push(cb);
    }
  }

  /**
   * Unregister a function previously registered for selected item changes.
   * @param cb
   */
  function unregisterSelectedItemWatcher(cb) {
    var i = selectedItemWatchers.indexOf(cb);
    if (i != -1) {
      selectedItemWatchers.splice(i, 1);
    }
  }

  /**
   * Handles changes to the searchText property.
   * @param searchText
   * @param previousSearchText
   */
  function handleSearchText (searchText, previousSearchText) {
    ctrl.index = getDefaultIndex();
    // do nothing on init
    if (searchText === previousSearchText) return;

    getDisplayValue($scope.selectedItem).then(function(val) {
      // clear selected item if search text no longer matches it
      if (searchText !== val)
      {
        $scope.selectedItem = null;

        // trigger change event if available
        if ( searchText !== previousSearchText ) announceTextChange();

        // cancel results if search text is not long enough
        if (!isMinLengthMet()) {
          ctrl.loading = false;
          ctrl.matches = [];
          ctrl.hidden = shouldHide();
          updateMessages();
        } else {
          handleQuery();
        }
      }
    });

  }

  /**
   * Handles input blur event, determines if the dropdown should hide.
   */
  function blur () {
    hasFocus = false;
    if (!noBlur) ctrl.hidden = true;
  }

  /**
   * Handles input focus event, determines if the dropdown should show.
   */
  function focus () {
    hasFocus = true;
    //-- if searchText is null, let's force it to be a string
    if (!angular.isString($scope.searchText)) $scope.searchText = '';
    if ($scope.minLength > 0) return;
    ctrl.hidden = shouldHide();
    if (!ctrl.hidden) handleQuery();
  }

  /**
   * Handles keyboard input.
   * @param event
   */
  function keydown (event) {
    switch (event.keyCode) {
      case $mdConstant.KEY_CODE.DOWN_ARROW:
        if (ctrl.loading) return;
        event.stopPropagation();
        ctrl.index = Math.min(ctrl.index + 1, ctrl.matches.length - 1);
        updateScroll();
        updateMessages();
        break;
      case $mdConstant.KEY_CODE.UP_ARROW:
        if (ctrl.loading) return;
        event.stopPropagation();
        ctrl.index = ctrl.index < 0 ? ctrl.matches.length - 1 : Math.max(0, ctrl.index - 1);
        updateScroll();
        updateMessages();
        break;
      case $mdConstant.KEY_CODE.TAB:
      case $mdConstant.KEY_CODE.ENTER:
        if (ctrl.hidden || ctrl.loading || ctrl.index < 0 || ctrl.matches.length < 1) return;
        event.stopPropagation();
        select(ctrl.index);
        break;
      case $mdConstant.KEY_CODE.ESCAPE:
        event.stopPropagation();
        ctrl.matches = [];
        ctrl.hidden = true;
        ctrl.index = getDefaultIndex();
        break;
      default:
    }
  }

  //-- getters

  /**
   * Returns the minimum length needed to display the dropdown.
   * @returns {*}
   */
  function getMinLength () {
    return angular.isNumber($scope.minLength) ? $scope.minLength : 1;
  }

  /**
   * Returns the display value for an item.
   * @param item
   * @returns {*}
   */
  function getDisplayValue (item) {
    return $q.when( getItemText(item) || item );

    /**
     * Getter function to invoke user-defined expression (in the directive)
     * to convert your object to a single string.
     */
    function getItemText(item) {
      return (item && $scope.itemText) ? $scope.itemText(getItemAsNameVal(item)) : null;
    }
  }

  /**
   * Returns the locals object for compiling item templates.
   * @param item
   * @returns {{}}
   */
  function getItemAsNameVal (item) {
    if (!item) return undefined;

    var locals = {};
    if (ctrl.itemName) locals[ctrl.itemName] = item;

    return locals;
  }




  /**
   * Returns the default index based on whether or not autoselect is enabled.
   * @returns {number}
   */
  function getDefaultIndex () {
    return $scope.autoselect ? 0 : -1;
  }

  /**
   * Determines if the menu should be hidden.
   * @returns {boolean}
   */
  function shouldHide () {
    if (!isMinLengthMet() || !ctrl.matches.length) return true;
  }

  /**
   * Returns the display value of the current item.
   * @returns {*}
   */
  function getCurrentDisplayValue () {
    return getDisplayValue( ctrl.matches[ctrl.index] );
  }

  /**
   * Determines if the minimum length is met by the search text.
   * @returns {*}
   */
  function isMinLengthMet () {
    return angular.isDefined($scope.searchText) && $scope.searchText.length >= getMinLength();
  }

  //-- actions

  /**
   * Defines a public property with a handler and a default value.
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
   * Selects the item at the given index.
   * @param index
   */
  function select(index) {
    //-- force form to update state for validation
    $mdUtil.nextTick(function() {
      getDisplayValue(ctrl.matches[index]).then(function(val) {
        var ngModel = elements.$.input.controller('ngModel');
        ngModel.$setViewValue(val);
        ngModel.$render();
      }).finally(function() {
        $scope.selectedItem = ctrl.matches[index];
        ctrl.loading = false;
        ctrl.hidden = true;
        ctrl.index = 0;
        ctrl.matches = [];
      });
    }, false);
  }


  /**
   * Clears the searchText value and selected item.
   */
  function clearValue () {
    $scope.searchText = '';
    select(-1);

    // Per http://www.w3schools.com/jsref/event_oninput.asp
    var eventObj = document.createEvent('CustomEvent');
    eventObj.initCustomEvent('input', true, true, {value: $scope.searchText});
    elements.input.dispatchEvent(eventObj);

    elements.input.focus();
  }

  /**
   * Fetches the results for the provided search text.
   * @param searchText
   */
  function fetchResults (searchText) {
    var items = $scope.$parent.$eval(itemExpr),
        term = searchText.toLowerCase();
    if (angular.isArray(items)) {
      handleResults(items);
    } else if (items) {
      $mdUtil.nextTick(function () {
        ctrl.loading = true;
        if (items.success) items.success(handleResults);
        if (items.then)    items.then(handleResults);
        if (items.finally) items.finally(function () { ctrl.loading = false; });
      });
    }
    function handleResults (matches) {
      cache[term] = matches;
      if (searchText !== $scope.searchText) return; //-- just cache the results if old request
      ctrl.matches = matches;
      ctrl.hidden = shouldHide();
      updateMessages();
      positionDropdown();
    }
  }

  /**
   * Updates the ARIA messages
   */
  function updateMessages () {
    getCurrentDisplayValue().then(function(msg) {
      ctrl.messages = [ getCountMessage(), msg ];
    });
  }

  /**
   * Returns the ARIA message for how many results match the current query.
   * @returns {*}
   */
  function getCountMessage () {
    if (lastCount === ctrl.matches.length) return '';
    lastCount = ctrl.matches.length;
    switch (ctrl.matches.length) {
      case 0:  return 'There are no matches available.';
      case 1:  return 'There is 1 match available.';
      default: return 'There are ' + ctrl.matches.length + ' matches available.';
    }
  }

  /**
   * Makes sure that the focused element is within view.
   */
  function updateScroll () {
    if (!elements.li[ctrl.index]) return;
    var li  = elements.li[ctrl.index],
        top = li.offsetTop,
        bot = top + li.offsetHeight,
        hgt = elements.ul.clientHeight;
    if (top < elements.ul.scrollTop) {
      elements.ul.scrollTop = top;
    } else if (bot > elements.ul.scrollTop + hgt) {
      elements.ul.scrollTop = bot - hgt;
    }
  }

  /**
   * Starts the query to gather the results for the current searchText.  Attempts to return cached
   * results first, then forwards the process to `fetchResults` if necessary.
   */
  function handleQuery () {
    var searchText = $scope.searchText,
        term = searchText.toLowerCase();
    //-- if results are cached, pull in cached results
    if (!$scope.noCache && cache[term]) {
      ctrl.matches = cache[term];
      updateMessages();
    } else {
      fetchResults(searchText);
    }
    if (hasFocus) ctrl.hidden = shouldHide();
  }

}
