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
   * `<md-autocomplete>` allows you to provide real-time suggestions as the user types.
   *
   * @param {string=} md-search-text A model to bind the search text to
   * @param {object=} md-selected-item A model to bind the selected item to
   * @param {expression=} md-items An expression in the format of `item in items` to iterate over matches for your search.
   * @param {string=} md-item-text A property on your object used to convert your object to a string
   * @param {placeholder=} Placeholder text that will be forwarded to the input.
   *
   * @usage
   * <hljs lang="html">
   *   <md-autocomplete
   *       md-selected-item="selectedItem"
   *       md-search-text="searchText"
   *       md-items="item in getMatches(searchText)"
   *       md-item-text="display">
   *     <span md-highlight-text="searchText">{{item.display}}</span>
   *   </md-autocomplete>
   * </hlhs>
   */

  function MdAutocomplete () {
    return {
      template: '\
        <md-autocomplete-wrap role="listbox">\
          <input type="text"\
              ng-model="searchText"\
              ng-keydown="$mdAutocompleteCtrl.keydown($event)"\
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
              <span aria-hidden="true">X</span>\
              <span class="visually-hidden">Clear</span>\
              </button>\
          <md-progress-linear ng-if="$mdAutocompleteCtrl.loading" md-mode="indeterminate"></md-progress-linear>\
        </md-autocomplete-wrap>\
        <ul role="presentation">\
          <li ng-repeat="(index, item) in $mdAutocompleteCtrl.matches"\
              ng-class="{ selected: index === $mdAutocompleteCtrl.index }"\
              ng-if="searchText && !$mdAutocompleteCtrl.hidden"\
              ng-click="$mdAutocompleteCtrl.select(index)"\
              ng-transclude\
              md-autocomplete-list-item="$mdAutocompleteCtrl.itemName">\
          </li>\
        </ul>\
        <aria-status\
            class="visually-hidden"\
            aria-atomic="true"\
            role="status"\
            aria-live="polite">\
          <p ng-repeat="item in $mdAutocompleteCtrl.matches">{{item.display}}</p>\
        </aria-status>',
      transclude: true,
      controller: 'MdAutocompleteCtrl',
      controllerAs: '$mdAutocompleteCtrl',
      scope: {
        searchText: '=mdSearchText',
        selectedItem: '=mdSelectedItem',
        itemsExpr: '@mdItems',
        itemText: '@mdItemText',
        placeholder: '@placeholder'
      }
    };
  }
})();
