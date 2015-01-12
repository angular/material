(function() {
'use strict';

angular.module('material.components.tabs')
  .controller('$mdTabs', MdTabsController);

function MdTabsController($scope, $element, $mdUtil, $timeout) {

  var tabsList = $mdUtil.iterator([], false);
  var self = this;

  // Properties
  self.$element = $element;
  self.scope = $scope;
  // The section containing the tab content $elements
  var contentArea = self.contentArea = angular.element($element[0].querySelector('.md-tabs-content'));

  // Methods from iterator
  var inRange = self.inRange = tabsList.inRange;
  var indexOf = self.indexOf = tabsList.indexOf;
  var itemAt = self.itemAt = tabsList.itemAt;
  self.count = tabsList.count;

  self.getSelectedItem = getSelectedItem;
  self.getSelectedIndex = getSelectedIndex;
  self.add = add;
  self.remove = remove;
  self.move = move;
  self.select = select;
  self.focus = focus;
  self.deselect = deselect;

  self.next = next;
  self.previous = previous;

  $scope.$on('$destroy', function() {
    deselect(getSelectedItem());
    for (var i = tabsList.count() - 1; i >= 0; i--) {
      remove(tabsList[i], true);
    }
  });

  // Get the selected tab
  function getSelectedItem() {
    return itemAt($scope.selectedIndex);
  }

  function getSelectedIndex() {
    return $scope.selectedIndex;
  }

  // Add a new tab.
  // Returns a method to remove the tab from the list.
  function add(tab, index) {
    tabsList.add(tab, index);

    // Select the new tab if we don't have a selectedIndex, or if the
    // selectedIndex we've been waiting for is this tab
    if (!angular.isDefined(tab.element.attr('md-active')) && ($scope.selectedIndex === -1 || !angular.isNumber($scope.selectedIndex) ||
        $scope.selectedIndex === self.indexOf(tab))) {
      tab.onAdd(self.contentArea, false);
      self.select(tab);
    } else {
      tab.onAdd(self.contentArea, true);
    }

    $scope.$broadcast('$mdTabsChanged');
  }

  function remove(tab, noReselect) {
    if (!tabsList.contains(tab)) return;
    if (noReselect) return;
    var isSelectedItem = getSelectedItem() === tab,
        newTab = previous() || next();

    deselect(tab);
    tabsList.remove(tab);
    tab.onRemove();

    $scope.$broadcast('$mdTabsChanged');

    if (isSelectedItem) { select(newTab); }
  }

  // Move a tab (used when ng-repeat order changes)
  function move(tab, toIndex) {
    var isSelected = getSelectedItem() === tab;

    tabsList.remove(tab);
    tabsList.add(tab, toIndex);
    if (isSelected) select(tab);

    $scope.$broadcast('$mdTabsChanged');
  }

  function select(tab, rightToLeft) {
    if (!tab || tab.isSelected || tab.isDisabled()) return;
    if (!tabsList.contains(tab)) return;

    if (!angular.isDefined(rightToLeft)) {
      rightToLeft = indexOf(tab) < $scope.selectedIndex;
    }
    deselect(getSelectedItem(), rightToLeft);

    $scope.selectedIndex = indexOf(tab);
    tab.isSelected = true;
    tab.onSelect(rightToLeft);

    $scope.$broadcast('$mdTabsChanged');
  }

  function focus(tab) {
    // this variable is watched by pagination
    self.tabToFocus = tab;
  }

  function deselect(tab, rightToLeft) {
    if (!tab || !tab.isSelected) return;
    if (!tabsList.contains(tab)) return;

    $scope.selectedIndex = -1;
    tab.isSelected = false;
    tab.onDeselect(rightToLeft);
  }

  function next(tab, filterFn) {
    return tabsList.next(tab || getSelectedItem(), filterFn || isTabEnabled);
  }
  function previous(tab, filterFn) {
    return tabsList.previous(tab || getSelectedItem(), filterFn || isTabEnabled);
  }

  function isTabEnabled(tab) {
    return tab && !tab.isDisabled();
  }

}
})();
