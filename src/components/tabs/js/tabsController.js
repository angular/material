angular.module('material.components.tabs')
  .controller('materialTabsController', [
    '$scope', 
    '$attrs', 
    '$materialComponentRegistry', 
    '$timeout',
    '$$rAF',
    TabsController
  ]);


/**
 * @ngdoc object
 * @name materialTabsController
 * @module material.components.tabs
 * @description Controller used within `<material-tabs>` to manage tab selection and iteration
 *
 * @private
 */
function TabsController($scope, $attrs, $materialComponentRegistry, $timeout, $$rAF ) {
  var list = Util.iterator([], false),
    componentID = "tabs" + $scope.$id,
    elements = { },
    selected = null,
    self = this;

  $materialComponentRegistry.register( self, $attrs.componentId || componentID );

  // Methods used by <material-tab> and children

  this.add = addTab;
  this.remove = removeTab;
  this.select = selectTab;
  this.selectAt = selectTabAt;
  this.next = selectNext;
  this.previous = selectPrevious;

  // Property for child access
  this.noink = !!$scope.noink;
  this.nobar = !!$scope.nobar;
  this.scope = $scope;

  // Special internal accessor to access scopes and tab `content`
  // Used by TabsDirective::buildContentItems()

  this.$scope = $scope;
  this.$$tabs = findTabs;
  this.$$hash = "";

  this.selectedElement = function() {
    return findElementFor( selected );
  };

  function onTabsChanged() {
    if (onTabsChanged.queued) return;
    onTabsChanged.queued = true;

    $scope.$evalAsync(function() {
      $scope.$broadcast('$materialTabsChanged');
      onTabsChanged.queued = false;
    });
  }

  /**
   * Find the DOM element associated with the tab/scope
   * @param tab
   * @returns {*}
   */
  function findElementFor(tab) {
    if ( angular.isUndefined(tab) ) {
      tab = selected;
    }
    return tab ? elements[ tab.$id ] : undefined;
  }

  /**
   * Publish array of tab scope items
   * NOTE: Tabs are not required to have `contents` and the
   *       node may be undefined.
   * @returns {*} Array
   */
  function findTabs(filterBy) {
    return list.items().filter(filterBy || angular.identity);
  }

  /**
   * Create unique hashKey representing all available
   * tabs.
   */
  function updateHash() {
    self.$$hash = list.items()
      .map(function (it) {
        return it.$id;
      })
      .join(',');
  }

  /**
   * Select specified tab; deselect all others (if any selected)
   * @param tab
   */
  function selectTab(tab, noUpdate) {
    if ( tab == selected ) return;

    var activate = makeActivator(true),
      deactivate = makeActivator(false);

    // Turn off all tabs (if current active)
    angular.forEach(list.items(), deactivate);

    if ( tab != null ) {
      // Activate the specified tab (or next available)
      selected = activate(tab.disabled ? list.next(tab, isEnabled) : tab);

      // update external models and trigger databinding watchers
      $scope.$selIndex = selected ? String(selected.$index || list.indexOf(selected)) : -1;

      // update the tabs ink to indicate the selected tab
      if (!noUpdate) {
        onTabsChanged();
      }
    }

    return selected;
  }

  /**
   * Select tab based on its index position
   * @param index
   */
  function selectTabAt(index, noUpdate) {

    if (list.inRange(index)) {
      var matches = list.findBy("$index", index),
          it = matches ? matches[0] : null;

      if (it != selected) {

        // Tab must be selectable...
        if ( !isEnabled(it) ) {
          it = selectNext(it);
        }

        selectTab( it || list.first(), noUpdate );
      }
    }
  }

  /**
   * Add tab to list and auto-select; default adds item to end of list
   * @param tab
   */
  function addTab(tab, element) {

    if (angular.isUndefined(tab.$index)) {
      tab.$index = list.count();
    }

    // cache materialTab DOM element; these are not materialView elements
    elements[ tab.$id ] = element;

    if (!list.contains(tab)) {
      var pos = list.add(tab, tab.$index);

      // Should we auto-select it?
      if ($scope.$selIndex == pos || tab.active) {
        selectTab(tab);
      } else {
        onTabsChanged();
      }
    }


    updateHash();

    return tab.$index;
  }

  /**
   * Remove the specified tab from the list
   * Auto select the next tab or the previous tab (if last)
   * @param tab
   */
  function removeTab(tab) {
    if (list.contains(tab)) {

      selectTab( list.next(tab, isEnabled) || list.previous(tab, isEnabled) );
      list.remove(tab);

      onTabsChanged();
      // another tab was removed, make sure to update ink bar
      $timeout(function(){
        delete elements[tab.$id];
      },300);

    }

    updateHash();
  }

  /**
   * Select the next tab in the list
   * @returns {*} Tab
   */
  function selectNext(target) {
    var next = list.next( target, isEnabled );

    return next ? selectTab( next ) :
           target.disabled ? selectPrevious(target) : target;
  }

  /**
   * Select the previous tab
   * @returns {*} Tab
   */
  function selectPrevious(target) {
    var previous = list.previous(target, isEnabled );

    return previous ? selectTab( previous ) :
           target.disabled ? selectNext(target) : target;


  }

  /**
   * Validation criteria for list iterator when List::next() or List::previous() is used..:
   * In this case, the list iterator should skip items that are disabled.
   * @param tab
   * @returns {boolean}
   */
  function isEnabled(tab) {
    return tab && !tab.disabled;
  }

  /**
   * Partial application to build function that will
   * mark the specified tab as active or not. This also
   * allows the `updateStatus` function to be used as an iterator.
   *
   * @param active
   */
  function makeActivator(active) {

    return function updateState(tab) {
      if (tab && (active != tab.active)) {
        tab.active = active;

        if (active) {
          selected = tab;

          tab.selected();

        } else {
          if (selected == tab) {
            selected = null;
          }

          tab.deselected();

        }
        return tab;
      }
      return null;
    };
  }

}
