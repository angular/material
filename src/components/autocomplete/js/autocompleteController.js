(function () {
  'use strict';
  angular
      .module('material.components.autocomplete')
      .controller('MdAutocompleteCtrl', MdAutocompleteCtrl);

  function MdAutocompleteCtrl ($scope, $element, $timeout, $q, $mdUtil, $mdConstant) {

    //-- private variables
    var self = this,
        itemParts = $scope.itemsExpr.split(/ in /i),
        itemExpr = itemParts[1],
        elements = {
          main:  $element[0],
          ul:    $element[0].getElementsByTagName('ul')[0],
          input: $element[0].getElementsByTagName('input')[0]
        },
        promise = null,
        cache = {};

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

    return init();

    //-- start method definitions
    function init () {
      configureWatchers();
      configureAria();
    }

    function configureAria () {
      var ul = angular.element(elements.ul),
          input = angular.element(elements.input),
          id = ul.attr('id') || 'ul_' + $mdUtil.nextUid();
      ul.attr('id', id);
      input.attr('aria-owns', id);
    }

    function getItemScope (item) {
      if (!item) return;
      var locals = {};
      if (self.itemName) locals[self.itemName] = $scope.selectedItem;
      return locals;
    }

    function configureWatchers () {
      $scope.$watch('searchText', function (searchText) {
        self.index = -1;
        if (!searchText) {
          self.loading = false;
          self.matches = [];
          self.hidden = shouldHide();
          return;
        }
        var term = searchText.toLowerCase();
        if (promise && promise.cancel) {
          promise.cancel();
          promise = null;
        }
        if (!$scope.noCache && cache[term]) {
          self.matches = cache[term];
        } else {
          self.fetch(searchText);
        }
        self.hidden = shouldHide();
        if ($scope.textChange) $scope.textChange(getItemScope($scope.selectedItem));
      });
      $scope.$watch('selectedItem', function (selectedItem) {
        if ($scope.itemChange) $scope.itemChange(getItemScope(selectedItem));
      });
    }

    function fetchResults (searchText) {
      var items = $scope.$parent.$eval(itemExpr),
          term = searchText.toLowerCase();
      if (angular.isArray(items)) {
        handleResults(items);
      } else {
        self.loading = true;
        promise = $q.when(items).then(handleResults);
      }
      function handleResults (matches) {
        cache[term] = matches;
        if (searchText !== $scope.searchText) return; //-- just cache the results if old request
        promise = null;
        self.loading = false;
        self.matches = matches;
        self.hidden = shouldHide();
      }
    }

    function blur () {
      self.hidden = true;
    }

    function keydown (event) {
      switch (event.keyCode) {
        case $mdConstant.KEY_CODE.DOWN_ARROW:
            if (self.loading) return;
            event.preventDefault();
            self.index = Math.min(self.index + 1, self.matches.length - 1);
            updateScroll();
            break;
        case $mdConstant.KEY_CODE.UP_ARROW:
            if (self.loading) return;
            event.preventDefault();
            self.index = Math.max(0, self.index - 1);
            updateScroll();
            break;
        case $mdConstant.KEY_CODE.ENTER:
            if (self.loading || self.index < 0) return;
            event.preventDefault();
            select(self.index);
            break;
        case $mdConstant.KEY_CODE.ESCAPE:
            self.matches = [];
            self.hidden = true;
            self.index = -1;
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
      return self.matches.length === 1 && $scope.searchText === getDisplayValue(self.matches[0]);
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
      self.index = -1;
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
