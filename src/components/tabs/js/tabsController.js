angular.module('material.components.tabs')
  .factory('$materialTabs', [
    '$materialComponentRegistry',
    TabsService
  ])
  .controller('materialTabsController', [
    '$scope', 
    '$attrs', 
    '$materialComponentRegistry', 
    '$timeout',
    TabsController
  ]);


/**
 * @private
 * @ngdoc service
 * @name $materialTabs
 * @module material.components.tabs
 *
 * @description
 * $materialTabs makes it easy to programmatically interact with a specific Tabs group
 * in an app.
 *
 * @usage
 *
 * ```javascript
 * // Toggle the given sidenav
 * $materialTabs(tabsID).select(0);
 * ```
 */
function TabsService($materialComponentRegistry) {
  return function(handle) {
    var instance = $materialComponentRegistry.get(handle);
    if(!instance) {
      $materialComponentRegistry.notFoundError(handle);
    }

    return {
      /**
       * Select the tab at the specified index
       * @param index
       * @returns {*}
       */
      select: function(index) {
        return instance && instance.selectAt(index);
      }
    };
  };
}


/**
 * @ngdoc object
 * @name materialTabsController
 * @module material.components.tabs
 * @description Controller used within `<material-tabs>` to manage tab selection and iteration
 *
 * @private
 */
function TabsController($scope, $attrs, $materialComponentRegistry, $timeout ) {
  var list = Util.iterator([], false),
    componentID = "tabs" + $scope.$id,
    elements = { },
    selected = null,
    self = this;

  // Property for child access
  self.noink = !!$scope.noink;
  self.nobar = !!$scope.nobar;
  self.scope = $scope;

  // Special internal accessor to access scopes and tab `content`
  // Used by TabsDirective::buildContentItems()

  self.$scope = $scope;
  self.$$tabs = findTabs;
  self.$$hash = "";

  // Methods used by <material-tab> and children

  self.add = addTab;
  self.remove = removeTab;
  self.select = selectTab;
  self.selectAt = selectTabAt;
  self.next = selectNext;
  self.previous = selectPrevious;

  self.focusSelected = focusSelected;
  self.focusNext     = focusNext;
  self.focusPrevious = focusPrevious;

  self.selectedElement = selectedElement;

  $materialComponentRegistry.register( self, $attrs.componentId || componentID );


  /**
   * Accessor to look up the associated
   * @returns {*}
   */
  function selectedElement() {
    return findElementFor( selected );
  };


  /**
   * When the selected tab changes, broadcast notification
   */
  function onSelectedChange() {
    if (onSelectedChange.queued) return;
    onSelectedChange.queued = true;

    $scope.$evalAsync(function() {
      $scope.$broadcast(EVENT.TABS_CHANGED, selected);
      onSelectedChange.queued = false;
    });
  }


  /**
   * Make sure the currently selected tab is
   * focused. Do not! announce focus changes..
   *
   * NOTE: this is primarily used within pagination/ink updates after
   *       tab click handlers. @see tabsDirective.js
   * @returns {*}
   */
  function focusSelected() {
    return focusOn('current');
  }

  /**
   * Focus on the next enabled tab relative to `from`
   * Announce focus change with new focusIndex if appropriate
   * @param from
   */
  function focusNext(from) {
    var focusIndex = focusOn('next', from);
    if ( focusIndex != list.indexOf(selected)) {

      // Announce focus change
      $scope.$broadcast(EVENT.FOCUS_CHANGED, focusIndex);
    }
    return focusIndex;
  }

  /**
   * Focus on the previous enabled tab relative to `from`
   * Announce focus change with new focusIndex if appropriate
   * @param from
   */
  function focusPrevious(from) {
    var focusIndex = focusOn('previous', from );

    if ( focusIndex != list.indexOf(selected)) {
      // Announce focus change
      $scope.$broadcast(EVENT.FOCUS_CHANGED, focusIndex);
    }

    return focusIndex;
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
        onSelectedChange();
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
        onSelectedChange();
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

      onSelectedChange();
      // another tab was removed, make sure to update ink bar
      $timeout(function(){
        delete elements[tab.$id];
      },300);

    }

    updateHash();
  }

  /**
   * Focus on the specified tab (if available)
   * @returns {*} Tab
   */
  function focusOn(which, from) {
    var tab = (which === 'current' ) ? selected :
              (which === 'next')     ? list.next(from || selected, isEnabled) :
              (which === 'previous') ? list.previous(from || selected, isEnabled) : null;

    var el = findElementFor( tab );
    if ( el ) el[0].focus();

    return list.indexOf(tab);
  }

  /**
   * Select the next tab in the list or the
   * @returns {*} Tab
   */
  function selectNext(target) {
    return selectTab( list.next(target, isEnabled) || target );
  }

  /**
   * Select the previous tab
   * @returns {*} Tab
   */
  function selectPrevious(target) {
    return selectTab( list.previous(target, isEnabled) || target );
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
