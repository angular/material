angular.module('material.components.tabs')

.controller('$mdTabs', [
  '$scope', 
  '$element',
  '$mdUtil',
  MdTabsController
]);

function MdTabsController(scope, element, $mdUtil) {

  var tabsList = $mdUtil.iterator([], false);
  var self = this;

  // Properties
  self.element = element;
  // The section containing the tab content elements
  self.contentArea = angular.element(element[0].querySelector('.tabs-content'));

  // Methods from iterator
  self.inRange = tabsList.inRange;
  self.indexOf = tabsList.indexOf;
  self.itemAt = tabsList.itemAt;
  self.count = tabsList.count;
  
  self.selected = selected;
  self.add = add;
  self.remove = remove;
  self.move = move;
  self.select = select;
  self.deselect = deselect;

  self.next = next;
  self.previous = previous;

  self.swipe = swipe;

  scope.$on('$destroy', function() {
    self.deselect(self.selected());
    for (var i = tabsList.count() - 1; i >= 0; i--) {
      self.remove(tabsList[i], true);
    }
  });

  // Get the selected tab
  function selected() {
    return self.itemAt(scope.selectedIndex);
  }

  // Add a new tab.
  // Returns a method to remove the tab from the list.
  function add(tab, index) {

    tabsList.add(tab, index);
    tab.onAdd(self.contentArea);

    // Register swipe feature
    tab.$$onSwipe = swipe;

    // Select the new tab if we don't have a selectedIndex, or if the
    // selectedIndex we've been waiting for is this tab
    if (scope.selectedIndex === -1 || scope.selectedIndex === self.indexOf(tab)) {
      self.select(tab);
    }
    scope.$broadcast('$mdTabsChanged');
  }

  function remove(tab, noReselect) {
    if (!tabsList.contains(tab)) return;

    if (noReselect) {

    } else if (self.selected() === tab) {
      if (tabsList.count() > 1) {
        self.select(self.previous() || self.next());
      } else {
        self.deselect(tab);
      }
    }

    tabsList.remove(tab);
    tab.onRemove();

    scope.$broadcast('$mdTabsChanged');
  }

  // Move a tab (used when ng-repeat order changes)
  function move(tab, toIndex) {
    var isSelected = self.selected() === tab;

    tabsList.remove(tab);
    tabsList.add(tab, toIndex);
    if (isSelected) self.select(tab);

    scope.$broadcast('$mdTabsChanged');
  }

  function select(tab) {
    if (!tab || tab.isSelected || tab.isDisabled()) return;
    if (!tabsList.contains(tab)) return;

    self.deselect(self.selected());

    scope.selectedIndex = self.indexOf(tab);
    tab.isSelected = true;
    tab.onSelect();
  }
  function deselect(tab) {
    if (!tab || !tab.isSelected) return;
    if (!tabsList.contains(tab)) return;

    scope.selectedIndex = -1;
    tab.isSelected = false;
    tab.onDeselect();
  }

  function next(tab, filterFn) {
    return tabsList.next(tab || self.selected(), filterFn || isTabEnabled);
  }
  function previous(tab, filterFn) {
    return tabsList.previous(tab || self.selected(), filterFn || isTabEnabled);
  }

  function isTabEnabled(tab) {
    return tab && !tab.isDisabled();
  }

  /*
   * attach a swipe listen
   * if it's not selected, abort
   * check the direction
   *   if it is right
   *   it pan right
   *     Now select
   */

  function swipe(direction) {
    if ( !self.selected() ) return;

    // check the direction
    switch(direction) {

      case "swiperight":  // if it is right
      case "panright"  :  // it pan right
        // Now do this...
        self.select( self.previous() );
        break;

      case "swipeleft":
      case "panleft"  :
        self.select( self.next() );
        break;
    }

  }

}
