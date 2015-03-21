(function () {
  'use strict';
  angular
      .module('material.components.autocomplete')
      .controller('MdAutocompleteCtrl', MdAutocompleteCtrl);

  function MdAutocompleteCtrl ($scope, $element, $mdUtil, $mdConstant, $timeout) {

    //-- private variables
    var self = this,
        itemParts = $scope.itemsExpr.split(/ in /i),
        itemExpr = itemParts[1],
        elements = null,
        promise = null,
        cache = {},
        noBlur = false;

    //-- public variables
    self.scope = $scope;
    self.parent = $scope.$parent;
    self.itemName = itemParts[0];
    self.matches = [];
    self.loading = false;
    self.hidden = true;
    self.index = 0;
    self.keydown = keydown;
    self.blur = blur;
    self.clear = clearValue;
    self.select = select;
    self.getCurrentDisplayValue = getCurrentDisplayValue;
    self.fetch = $mdUtil.debounce(fetchResults);
    self.messages = [];
    self.id = $mdUtil.nextUid();

    //-- While the mouse is inside of the dropdown, we don't want to handle input blur
    //-- This is to allow the user to scroll the list without causing it to hide
    self.listEnter = function () { noBlur = true; };
    self.listLeave = function () { noBlur = false; };
    self.mouseUp   = function () { elements.input.focus(); };

    return init();

    //-- start method definitions
    function init () {
      if ($scope.autofocus) elements.input.focus();
      configureWatchers();
      $timeout(gatherElements);
    }

    function gatherElements () {
      elements = {
        main:  $element[0],
        ul:    $element[0].getElementsByTagName('ul')[0],
        input: $element[0].getElementsByTagName('input')[0]
      };
    }

    function getItemScope (item) {
      if (!item) return;
      var locals = {};
      if (self.itemName) locals[self.itemName] = item;
      return locals;
    }

    function configureWatchers () {
      var wait = parseInt($scope.delay, 10) || 0;
      $scope.$watch('searchText', wait
          ? $mdUtil.debounce(handleSearchText, wait)
          : handleSearchText);
      $scope.$watch('selectedItem', function (selectedItem, previousSelectedItem) {
        if (selectedItem) {
          $scope.searchText = getDisplayValue(selectedItem);
        }
        if ($scope.itemChange && selectedItem !== previousSelectedItem)
          $scope.itemChange(getItemScope(selectedItem));
      });
    }

    function handleSearchText (searchText, previousSearchText) {
      self.index = 0;
      //-- do nothing on init if there is no initial value
      if (!searchText && searchText === previousSearchText) return;
      //-- clear selected item if search text no longer matches it
      if (searchText !== getDisplayValue($scope.selectedItem)) $scope.selectedItem = null;
      else return;
      //-- cancel results if search text is not long enough
      if (!searchText || searchText.length < Math.max(parseInt($scope.minLength, 10), 1)) {
        self.loading = false;
        self.matches = [];
        self.hidden = shouldHide();
        updateMessages();
        return;
      }
      var term = searchText.toLowerCase();
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
      if ($scope.textChange && searchText !== previousSearchText)
        $scope.textChange(getItemScope($scope.selectedItem));
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

    function blur () {
      if (!noBlur) self.hidden = true;
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
            self.index = Math.max(0, self.index - 1);
            updateScroll();
            updateSelectionMessage();
            break;
        case $mdConstant.KEY_CODE.ENTER:
            if (self.loading || self.index < 0) return;
            event.preventDefault();
            select(self.index);
            break;
        case $mdConstant.KEY_CODE.ESCAPE:
            self.matches = [];
            self.hidden = true;
            self.index = 0;
            break;
        case $mdConstant.KEY_CODE.TAB:
            break;
        default:
      }
    }

    function clearValue () {
      $scope.searchText = '';
      select(-1);
      elements.input.focus();
    }

    function shouldHide () {
      return self.matches.length === 1
          && $scope.searchText === getDisplayValue(self.matches[0])
          && $scope.selectedItem === self.matches[0];
    }

    function getCurrentDisplayValue () {
      return getDisplayValue(self.matches[self.index]);
    }

    function getDisplayValue (item) {
      return (item && $scope.itemText) ? $scope.itemText(getItemScope(item)) : item;
    }

    function select (index) {
      $scope.selectedItem = self.matches[index];
      $scope.searchText = getDisplayValue($scope.selectedItem) || $scope.searchText;
      self.hidden = true;
      self.index = 0;
      self.matches = [];
    }

    function updateScroll () {
      var top = 41 * self.index,
          bot = top + 41,
          hgt = 41 * 5.5;
      if (top < elements.ul.scrollTop) {
        elements.ul.scrollTop = top;
      } else if (bot > elements.ul.scrollTop + hgt) {
        elements.ul.scrollTop = bot - hgt;
      }
    }

  }
})();
