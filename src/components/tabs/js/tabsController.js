angular.module('material.components.tabs')

.controller('$materialTabs', [
  '$scope', 
  '$element',
  MaterialTabsController
]);

function MaterialTabsController(scope, element) {

  var tabs = Util.iterator([], false);
  var self = this;

  // Properties
  self.element = element;
  // The section containing the tab content elements
  self.contentElement = angular.element(element[0].querySelector('.tabs-content'));

  // Methods from iterator
  self.inRange = tabs.inRange;
  self.indexOf = tabs.indexOf;
  self.itemAt = tabs.itemAt;
  self.count = tabs.count;
  
  self.selected = selected;
  self.add = add;
  self.remove = remove;
  self.move = move;
  self.select = select;
  self.deselect = deselect;

  self.next = next;
  self.previous = previous;

  // Get the selected tab
  function selected() {
    return self.itemAt(scope.selectedIndex);
  }

  // Add a new tab.
  // Returns a method to remove the tab from the list.
  function add(tab, index) {
    var newIndex = tabs.add(tab, index);

    tab.setupContent(self.contentElement);

    // Select the new tab if we don't have a selectedIndex, or if the 
    // selectedIndex we've been waiting for is this tab
    if (scope.selectedIndex === -1 || scope.selectedIndex === newIndex) {
      self.select(tab);
    }
    scope.$broadcast('$materialTabsChanged');

    // Dynamic remove function locked to tab just added...
    return function() {
      remove(tab);
    };
  }

  function remove(tab) {
    if (!tabs.contains(tab)) return;

    if (self.selected() === tab) {
      if (tabs.count() > 1) {
        var next = self.previous() || self.next();
          self.select(next);
      } else {
        self.deselect(tab);
      }
    }

    tabs.remove(tab);
    tab.removeContent(self.contentElement);

    scope.$broadcast('$materialTabsChanged');
  }

  // Move a tab (used when ng-repeat order changes)
  function move(tab, toIndex) {
    var isSelected = self.selected() === tab;

    tabs.remove(tab);
    tabs.add(tab, toIndex);
    if (isSelected) self.select(tab);

    scope.$broadcast('$materialTabsChanged');
  }

  function select(tab) {
    if (!tab || tab.isSelected || tab.isDisabled()) return;
    if (self.indexOf(tab) < 0) return;

    self.deselect(self.selected());

    scope.selectedIndex = self.indexOf(tab);
    tab.isSelected = true;
    tab.onSelect();
  }
  function deselect(tab) {
    if (!tab || !tab.isSelected) return;
    if (self.indexOf(tab) < 0) return;

    scope.selectedIndex = -1;
    tab.isSelected = false;
    tab.onDeselect();
  }

  function next(tab, filterFn) {
    return tabs.next(tab || self.selected(), filterFn || isTabEnabled);
  }
  function previous(tab, filterFn) {
    return tabs.previous(tab || self.selected(), filterFn || isTabEnabled);
  }

  function isTabEnabled(tab) {
    return tab && !tab.isDisabled();
  }

}
