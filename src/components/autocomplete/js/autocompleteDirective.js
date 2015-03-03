(function () {
  'use strict';
  angular
      .module('material.components.autocomplete')
      .directive('mdAutocomplete', MdAutocomplete);

  /**
   * @ngdoc directive
   * @name mdAutocomplete
   * @module material.components.autocomplete
   *
   * @description
   * `<md-autocomplete>` is a special input component with a drop-down of all possible matches to a custom query.
   * This component allows you to provide real-time suggestions as the user types in the input area.
   *
   * @param {string=} md-search-text A model to bind the search query text to
   * @param {object=} md-selected-item A model to bind the selected item to
   * @param {expression} md-items An expression in the format of `item in items` to iterate over matches for your search.
   * @param {string=} md-item-text An expression that will convert your object to a single string.
   * @param {string=} placeholder Placeholder text that will be forwarded to the input.
   * @param {boolean=} md-no-cache Disables the internal caching that happens in autocomplete
   * @param {expression} md-selected-item-change An expression to be run each time a new item is selected
   * @param {expression} md-search-text-change An expression to be run each time the search text updates
   * @param {boolean=} ng-disabled Determines whether or not to disable the input field
   * @param {number=} md-min-length Specifies the minimum length of text before autocomplete will make suggestions
   * @param {number=} md-delay Specifies the amount of time (in milliseconds) to wait before looking for results
   *
   * @usage
   * <hljs lang="html">
   *   <md-autocomplete
   *       md-selected-item="selectedItem"
   *       md-search-text="searchText"
   *       md-items="item in getMatches(searchText)"
   *       md-item-text="item.display">
   *     <span md-highlight-text="searchText">{{item.display}}</span>
   *   </md-autocomplete>
   * </hljs>
   */

  function MdAutocomplete () {
    return {
      template:     '\
        <md-autocomplete-wrap role="listbox">\
          <input type="text"\
              ng-disabled="isDisabled"\
              ng-model="searchText"\
              ng-keydown="$mdAutocompleteCtrl.keydown($event)"\
              ng-blur="$mdAutocompleteCtrl.blur()"\
              placeholder="{{placeholder}}"\
              aria-label="{{placeholder}}"\
              aria-autocomplete="list"\
              aria-haspopup="true"\
              aria-activedescendant=""\
              aria-expanded="{{!$mdAutocompleteCtrl.hidden}}"/>\
          <button\
              type="button"\
              ng-if="searchText"\
              ng-click="$mdAutocompleteCtrl.clear()">\
            <md-icon md-svg-icon="cancel"></md-icon>\
            <span class="visually-hidden">Clear</span>\
          </button>\
          <md-progress-linear\
              ng-if="$mdAutocompleteCtrl.loading"\
              md-mode="indeterminate"></md-progress-linear>\
        </md-autocomplete-wrap>\
        <ul role="presentation"\
            ng-mouseenter="$mdAutocompleteCtrl.listEnter()"\
            ng-mouseleave="$mdAutocompleteCtrl.listLeave()"\
            ng-mouseup="$mdAutocompleteCtrl.mouseUp()">\
          <li ng-repeat="(index, item) in $mdAutocompleteCtrl.matches"\
              ng-class="{ selected: index === $mdAutocompleteCtrl.index }"\
              ng-show="searchText && !$mdAutocompleteCtrl.hidden"\
              ng-click="$mdAutocompleteCtrl.select(index)"\
              ng-transclude\
              md-autocomplete-list-item="$mdAutocompleteCtrl.itemName">\
          </li>\
        </ul>\
        <aria-status\
            class="visually-hidden"\
            role="status"\
            aria-live="assertive">\
          <p ng-repeat="message in $mdAutocompleteCtrl.messages">{{message.display}}</p>\
        </aria-status>',
      transclude:   true,
      controller:   'MdAutocompleteCtrl',
      controllerAs: '$mdAutocompleteCtrl',
      scope:        {
        searchText:   '=mdSearchText',
        selectedItem: '=mdSelectedItem',
        itemsExpr:    '@mdItems',
        itemText:     '&mdItemText',
        placeholder:  '@placeholder',
        noCache:      '=mdNoCache',
        itemChange:   '&mdSelectedItemChange',
        textChange:   '&mdSearchTextChange',
        isDisabled:   '=ngDisabled',
        minLength:    '=mdMinLength',
        delay:        '=mdDelay'
      }
    };
  }
})();
