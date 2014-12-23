(function () {
  'use strict';

  angular
      .module('material.components.tabs')
      .controller('MdTabsController', MdTabsController);

  function MdTabsController ($scope, $element, $window, $timeout, $mdConstant, $mdInkRipple, $mdUtil) {
    var ctrl = this,
        elements = getElements();

    ctrl.scope = $scope;
    ctrl.parent = $scope.$parent;
    ctrl.tabs = [];
    ctrl.lastSelectedIndex = null;
    ctrl.focusIndex = 0;
    ctrl.offsetLeft = 0;
    ctrl.hasContent = true;
    ctrl.hasFocus = false;
    ctrl.lastClick = false;

    ctrl.redirectFocus = redirectFocus;
    ctrl.attachRipple = attachRipple;
    ctrl.shouldStretchTabs = shouldStretchTabs;
    ctrl.shouldPaginate = shouldPaginate;
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
    ctrl.updateInkBarStyles = updateInkBarStyles;

    init();

    function init () {
      $scope.$watch('selectedIndex', handleSelectedIndexChange);
      $scope.$watch('$mdTabsCtrl.focusIndex', handleFocusIndexChange);
      $scope.$watch('$mdTabsCtrl.offsetLeft', handleOffsetChange);
      angular.element($window).on('resize', function () { $scope.$apply(handleWindowResize); });
      $timeout(updateInkBarStyles, 0, false);
    }

    function getElements () {
      var elements = {};
      elements.canvas = $element[0].getElementsByTagName('md-tabs-canvas')[0];
      elements.wrapper = elements.canvas.getElementsByTagName('md-pagination-wrapper')[0];
      elements.tabs    = elements.wrapper.getElementsByTagName('md-tab-item');
      elements.dummies = elements.canvas.getElementsByTagName('md-dummy-tab');
      elements.inkBar  = elements.wrapper.getElementsByTagName('md-ink-bar')[0];
      return elements;
    }

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
          $scope.selectedIndex = ctrl.focusIndex;
          break;
      }
      ctrl.lastClick = false;
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

    function handleOffsetChange (left) {
      angular.element(elements.wrapper).css('left', '-' + left + 'px');
      $scope.$broadcast('$mdTabsPaginationChanged');
    }

    function handleFocusIndexChange (newIndex, oldIndex) {
      if (newIndex === oldIndex) return;
      if (!elements.tabs[newIndex]) return;
      adjustOffset();
      redirectFocus();
    }

    function redirectFocus () {
      elements.dummies[ctrl.focusIndex].focus();
    }

    function adjustOffset () {
      var tab = elements.tabs[ctrl.focusIndex],
          left = tab.offsetLeft,
          right = tab.offsetWidth + left;
      ctrl.offsetLeft = Math.max(ctrl.offsetLeft, fixOffset(right - elements.canvas.clientWidth));
      ctrl.offsetLeft = Math.min(ctrl.offsetLeft, fixOffset(left));
    }

    function handleWindowResize () {
      ctrl.lastSelectedIndex = $scope.selectedIndex;
      updateInkBarStyles();
      ctrl.offsetLeft = fixOffset(ctrl.offsetLeft);
    }

    function insertTab (tabData, index) {
      var proto = {
            getIndex: function () { return ctrl.tabs.indexOf(tab); },
            isActive: function () { return this.getIndex() === $scope.selectedIndex; },
            isLeft:   function () { return this.getIndex() < $scope.selectedIndex; },
            isRight:  function () { return this.getIndex() > $scope.selectedIndex; },
            hasFocus: function () { return !ctrl.lastClick && ctrl.hasFocus && this.getIndex() === ctrl.focusIndex; },
            id:       $mdUtil.nextUid()
          },
          tab = angular.extend(proto, tabData);
      if (!angular.isString(tabData.template)) {
        ctrl.hasContent = false;
      }
      if (angular.isDefined(index)) {
        ctrl.tabs.splice(index, 0, tab);
      } else {
        ctrl.tabs.push(tab);
      }
      return tab;
    }

    function removeTab (tabData) {
      ctrl.tabs.splice(tabData.getIndex(), 1);
      refreshIndex();
      $timeout(function () {
        updateInkBarStyles();
        ctrl.offsetLeft = fixOffset(ctrl.offsetLeft);
      });
    }

    function refreshIndex () {
      $scope.selectedIndex = getNearestSafeIndex($scope.selectedIndex);
      ctrl.focusIndex = getNearestSafeIndex(ctrl.focusIndex);
    }

    function handleSelectedIndexChange (newValue, oldValue) {
      if (newValue === oldValue) return;
      $scope.selectedIndex = getNearestSafeIndex(newValue);
      ctrl.lastSelectedIndex = oldValue;
      updateInkBarStyles();
      $scope.$broadcast('$mdTabsChanged');
    }

    function updateInkBarStyles () {
      if (!ctrl.tabs.length) return;
      var index = $scope.selectedIndex,
          totalWidth = elements.wrapper.offsetWidth,
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

    function shouldStretchTabs () {
      switch ($scope.stretchTabs) {
        case 'always': return true;
        case 'never':  return false;
        default:       return !shouldPaginate() && $window.matchMedia('(max-width: 600px)').matches;
      }
    }

    function shouldPaginate () {
      var canvasWidth = $element.prop('clientWidth');
      angular.forEach(elements.tabs, function (tab) { canvasWidth -= tab.offsetWidth; });
      return canvasWidth <= 0;
    }

    function select (index) {
      ctrl.focusIndex = $scope.selectedIndex = index;
      ctrl.lastClick = true;
    }

    function scroll (event) {
      if (!shouldPaginate()) return;
      event.preventDefault();
      ctrl.offsetLeft = fixOffset(ctrl.offsetLeft - event.wheelDelta);
    }

    function fixOffset (value) {
      var lastTab = elements.tabs[elements.tabs.length - 1],
          totalWidth = lastTab.offsetLeft + lastTab.offsetWidth;
      value = Math.max(0, value);
      value = Math.min(totalWidth - elements.canvas.clientWidth, value);
      return value;
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

    function canPageBack () {
      return ctrl.offsetLeft > 0;
    }

    function canPageForward () {
      var lastTab = elements.tabs[elements.tabs.length - 1];
      return lastTab && lastTab.offsetLeft + lastTab.offsetWidth > elements.canvas.clientWidth + ctrl.offsetLeft;
    }

    function attachRipple (scope, element) {
      var options = { colorElement: angular.element(elements.inkBar) };
      $mdInkRipple.attachTabBehavior(scope, element, options);
    }
  }
})();