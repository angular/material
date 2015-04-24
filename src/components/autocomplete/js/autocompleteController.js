angular
    .module('material.components.autocomplete')
    .controller('MdAutocompleteCtrl', MdAutocompleteCtrl);

var ITEM_HEIGHT = 41,
    MAX_HEIGHT = 5.5 * ITEM_HEIGHT,
    MENU_PADDING = 8;

function MdAutocompleteCtrl ($scope, $element, $mdUtil, $mdConstant, $timeout, $mdTheming, $window, $rootElement) {

  //-- private variables

  var self      = this,
      itemParts = $scope.itemsExpr.split(/ in /i),
      itemExpr  = itemParts[1],
      elements  = null,
      promise   = null,
      cache     = {},
      noBlur    = false,
      selectedItemWatchers = [],
      hasFocus  = false;

  //-- public variables

  self.scope    = $scope;
  self.parent   = $scope.$parent;
  self.itemName = itemParts[0];
  self.matches  = [];
  self.loading  = false;
  self.hidden   = true;
  self.index    = null;
  self.messages = [];
  self.id       = $mdUtil.nextUid();

  //-- public methods

  self.keydown  = keydown;
  self.blur     = blur;
  self.focus    = focus;
  self.clear    = clearValue;
  self.select   = select;
  self.getCurrentDisplayValue         = getCurrentDisplayValue;
  self.registerSelectedItemWatcher    = registerSelectedItemWatcher;
  self.unregisterSelectedItemWatcher  = unregisterSelectedItemWatcher;

  self.listEnter = function () { noBlur = true; };
  self.listLeave = function () {
    noBlur = false;
    if (!hasFocus) self.hidden = true;
  };
  self.mouseUp   = function () { elements.input.focus(); };

  return init();

  //-- initialization methods

  function init () {
    configureWatchers();
    $timeout(function () {
      gatherElements();
      focusElement();
      moveDropdown();
    });
  }

  function positionDropdown () {
    if (!elements) return $timeout(positionDropdown, 0, false);
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
    $timeout(correctHorizontalAlignment, 0, false);

    function correctHorizontalAlignment () {
      var dropdown = elements.ul.getBoundingClientRect(),
          styles   = {};
      if (dropdown.right > root.right - MENU_PADDING) {
        styles.left = (hrect.right - dropdown.width) + 'px';
      }
      elements.$.ul.css(styles);
    }
  }

  function moveDropdown () {
    if (!elements.$.root.length) return;
    $mdTheming(elements.$.ul);
    elements.$.ul.detach();
    elements.$.root.append(elements.$.ul);
  }

  function focusElement () {
    if ($scope.autofocus) elements.input.focus();
  }

  function configureWatchers () {
    var wait = parseInt($scope.delay, 10) || 0;
    $scope.$watch('searchText', wait
        ? $mdUtil.debounce(handleSearchText, wait)
        : handleSearchText);
    registerSelectedItemWatcher(selectedItemChange);
    $scope.$watch('selectedItem', handleSelectedItemChange);
    $scope.$watch('$mdAutocompleteCtrl.hidden', function (hidden, oldHidden) {
      if (!hidden && oldHidden) positionDropdown();
    });
    angular.element($window).on('resize', positionDropdown);
  }

  function gatherElements () {
    elements = {
      main:  $element[0],
      ul:    $element.find('ul')[0],
      input: $element.find('input')[0],
      wrap:  $element.find('md-autocomplete-wrap')[0],
      root:  document.body
    };
    elements.snap = getSnapTarget();
    elements.$ = getAngularElements(elements);
  }

  function getSnapTarget () {
    for (var element = $element; element.length; element = element.parent()) {
      if (angular.isDefined(element.attr('md-autocomplete-snap'))) return element[0];
    }
    return elements.wrap;
  }

  function getAngularElements (elements) {
    var obj = {};
    for (var key in elements) {
      obj[key] = angular.element(elements[key]);
    }
    return obj;
  }

  //-- event/change handlers

  function selectedItemChange (selectedItem, previousSelectedItem) {
    if (selectedItem) {
      $scope.searchText = getDisplayValue(selectedItem);
    }
    if ($scope.itemChange && selectedItem !== previousSelectedItem)
      $scope.itemChange(getItemScope(selectedItem));
  }

  function handleSelectedItemChange(selectedItem, previousSelectedItem) {
    for (var i = 0; i < selectedItemWatchers.length; ++i) {
      selectedItemWatchers[i](selectedItem, previousSelectedItem);
    }
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

  function handleSearchText (searchText, previousSearchText) {
    self.index = getDefaultIndex();
    //-- do nothing on init if there is no initial value
    if (!searchText && searchText === previousSearchText) return;
    //-- clear selected item if search text no longer matches it
    if (searchText !== getDisplayValue($scope.selectedItem)) $scope.selectedItem = null;
    else return;
    //-- trigger change event if available
    if ($scope.textChange && searchText !== previousSearchText)
      $scope.textChange(getItemScope($scope.selectedItem));
    //-- cancel results if search text is not long enough
    if (!isMinLengthMet()) {
      self.loading = false;
      self.matches = [];
      self.hidden = shouldHide();
      updateMessages();
    } else {
      handleQuery();
    }
  }

  function blur () {
    hasFocus = false;
    if (!noBlur) self.hidden = true;
  }

  function focus () {
    hasFocus = true;
    //-- if searchText is null, let's force it to be a string
    if (!angular.isString($scope.searchText)) $scope.searchText = '';
    if ($scope.minLength > 0) return;
    self.hidden = shouldHide();
    if (!self.hidden) handleQuery();
  }

  function keydown (event) {
    switch (event.keyCode) {
      case $mdConstant.KEY_CODE.DOWN_ARROW:
        if (self.loading) return;
        event.preventDefault();
        self.index = Math.min(self.index + 1, self.matches.length - 1);
        updateScroll();
        updateSelectionMessage();
        break;
      case $mdConstant.KEY_CODE.UP_ARROW:
        if (self.loading) return;
        event.preventDefault();
        self.index = self.index < 0 ? self.matches.length - 1 : Math.max(0, self.index - 1);
        updateScroll();
        updateSelectionMessage();
        break;
      case $mdConstant.KEY_CODE.ENTER:
        if (self.hidden || self.loading || self.index < 0) return;
        event.preventDefault();
        select(self.index);
        break;
      case $mdConstant.KEY_CODE.ESCAPE:
        self.matches = [];
        self.hidden = true;
        self.index = getDefaultIndex();
        break;
      case $mdConstant.KEY_CODE.TAB:
        break;
      default:
    }
  }

  //-- getters

  function getMinLength () {
    return angular.isNumber($scope.minLength) ? $scope.minLength : 1;
  }

  function getDisplayValue (item) {
    return (item && $scope.itemText) ? $scope.itemText(getItemScope(item)) : item;
  }

  function getItemScope (item) {
    if (!item) return;
    var locals = {};
    if (self.itemName) locals[self.itemName] = item;
    return locals;
  }

  function getDefaultIndex () {
    return $scope.autoselect ? 0 : -1;
  }

  function shouldHide () {
    if (!isMinLengthMet()) return true;
  }

  function getCurrentDisplayValue () {
    return getDisplayValue(self.matches[self.index]);
  }

  function isMinLengthMet () {
    return $scope.searchText.length >= getMinLength();
  }

  //-- actions

  function select (index) {
    $scope.selectedItem = self.matches[index];
    $scope.searchText = getDisplayValue($scope.selectedItem) || $scope.searchText;
    self.hidden = true;
    self.index = 0;
    self.matches = [];
  }

  function clearValue () {
    $scope.searchText = '';
    select(-1);

    // Per http://www.w3schools.com/jsref/event_oninput.asp
    var eventObj = document.createEvent('CustomEvent');
    eventObj.initCustomEvent('input', true, true, {value: $scope.searchText});
    elements.input.dispatchEvent(eventObj);

    elements.input.focus();
  }

  function fetchResults (searchText) {
    var items = $scope.$parent.$eval(itemExpr),
        term = searchText.toLowerCase();
    if (angular.isArray(items)) {
      handleResults(items);
    } else {
      self.loading = true;
      if (items.success) items.success(handleResults);
      if (items.then)    items.then(handleResults);
      if (items.error)   items.error(function () { self.loading = false; });
    }
    function handleResults (matches) {
      cache[term] = matches;
      if (searchText !== $scope.searchText) return; //-- just cache the results if old request
      promise = null;
      self.loading = false;
      self.matches = matches;
      self.hidden = shouldHide();
      updateMessages();
      positionDropdown();
    }
  }

  function updateMessages () {
    if (self.hidden) return;
    switch (self.matches.length) {
      case 0:  return self.messages.splice(0);
      case 1:  return self.messages.push({ display: 'There is 1 match available.' });
      default: return self.messages.push({ display: 'There are '
          + self.matches.length
          + ' matches available.' });
    }
  }

  function updateSelectionMessage () {
    self.messages.push({ display: getCurrentDisplayValue() });
  }

  function updateScroll () {
    var top = ITEM_HEIGHT * self.index,
        bot = top + ITEM_HEIGHT,
        hgt = elements.ul.clientHeight;
    if (top < elements.ul.scrollTop) {
      elements.ul.scrollTop = top;
    } else if (bot > elements.ul.scrollTop + hgt) {
      elements.ul.scrollTop = bot - hgt;
    }
  }

  function handleQuery () {
    var searchText = $scope.searchText,
        term = searchText.toLowerCase();
    //-- cancel promise if a promise is in progress
    if (promise && promise.cancel) {
      promise.cancel();
      promise = null;
    }
    //-- if results are cached, pull in cached results
    if (!$scope.noCache && cache[term]) {
      self.matches = cache[term];
      updateMessages();
    } else {
      fetchResults(searchText);
    }
    self.hidden = shouldHide();
  }

}
