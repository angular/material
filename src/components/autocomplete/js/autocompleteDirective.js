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
   * @param {expression} md-items An expression in the format of `item in items` to iterate over matches for your search.
   * @param {expression} md-selected-item-change An expression to be run each time a new item is selected
   * @param {expression} md-search-text-change An expression to be run each time the search text updates
   * @param {string=} md-search-text A model to bind the search query text to
   * @param {object=} md-selected-item A model to bind the selected item to
   * @param {string=} md-item-text An expression that will convert your object to a single string.
   * @param {string=} placeholder Placeholder text that will be forwarded to the input.
   * @param {boolean=} md-no-cache Disables the internal caching that happens in autocomplete
   * @param {boolean=} ng-disabled Determines whether or not to disable the input field
   * @param {number=} md-min-length Specifies the minimum length of text before autocomplete will make suggestions
   * @param {number=} md-delay Specifies the amount of time (in milliseconds) to wait before looking for results
   * @param {boolean=} md-autofocus If true, will immediately focus the input element
   * @param {boolean=} md-autoselect If true, the first item will be selected by default
   * @param {string=} md-menu-class This will be applied to the dropdown menu for styling
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

  function MdAutocomplete ($mdTheming) {
    return {
      controller:   'MdAutocompleteCtrl',
      controllerAs: '$mdAutocompleteCtrl',
      link:         link,
      scope:        {
        name:          '@',
        searchText:    '=?mdSearchText',
        selectedItem:  '=?mdSelectedItem',
        itemsExpr:     '@mdItems',
        itemText:      '&mdItemText',
        placeholder:   '@placeholder',
        noCache:       '=?mdNoCache',
        itemChange:    '&?mdSelectedItemChange',
        textChange:    '&?mdSearchTextChange',
        isDisabled:    '=?ngDisabled',
        minLength:     '=?mdMinLength',
        delay:         '=?mdDelay',
        autofocus:     '=?mdAutofocus',
        floatingLabel: '@?mdFloatingLabel',
        autoselect:    '=?mdAutoselect',
        menuClass:     '@?mdMenuClass'
      },
      template: function (element, attr) {
        //-- grab the original HTML for custom transclusion before Angular attempts to parse it
        //-- the HTML is being stored on the attr object so that it is available to postLink
        attr.$mdAutocompleteTemplate = element.html();
        //-- return the replacement template, which will wipe out the original HTML
        return '\
          <md-autocomplete-wrap role="listbox">\
            <md-input-container ng-if="floatingLabel">\
              <label>{{floatingLabel}}</label>\
              <input type="text"\
                  id="fl-input-{{$mdAutocompleteCtrl.id}}"\
                  name="{{name}}"\
                  autocomplete="off"\
                  ng-disabled="isDisabled"\
                  ng-model="$mdAutocompleteCtrl.scope.searchText"\
                  ng-keydown="$mdAutocompleteCtrl.keydown($event)"\
                  ng-blur="$mdAutocompleteCtrl.blur()"\
                  ng-focus="$mdAutocompleteCtrl.focus()"\
                  aria-owns="ul-{{$mdAutocompleteCtrl.id}}"\
                  aria-label="{{floatingLabel}}"\
                  aria-autocomplete="list"\
                  aria-haspopup="true"\
                  aria-activedescendant=""\
                  aria-expanded="{{!$mdAutocompleteCtrl.hidden}}"/>\
                \
            </md-input-container>\
            <input type="text"\
                id="input-{{$mdAutocompleteCtrl.id}}"\
                name="{{name}}"\
                ng-if="!floatingLabel"\
                autocomplete="off"\
                ng-disabled="isDisabled"\
                ng-model="$mdAutocompleteCtrl.scope.searchText"\
                ng-keydown="$mdAutocompleteCtrl.keydown($event)"\
                ng-blur="$mdAutocompleteCtrl.blur()"\
                ng-focus="$mdAutocompleteCtrl.focus()"\
                placeholder="{{placeholder}}"\
                aria-owns="ul-{{$mdAutocompleteCtrl.id}}"\
                aria-label="{{placeholder}}"\
                aria-autocomplete="list"\
                aria-haspopup="true"\
                aria-activedescendant=""\
                aria-expanded="{{!$mdAutocompleteCtrl.hidden}}"/>\
            <button\
                type="button"\
                ng-if="$mdAutocompleteCtrl.scope.searchText && !isDisabled"\
                ng-click="$mdAutocompleteCtrl.clear()">\
              <md-icon md-svg-icon="cancel"></md-icon>\
              <span class="md-visually-hidden">Clear</span>\
            </button>\
            <md-progress-linear\
                ng-if="$mdAutocompleteCtrl.loading"\
                md-mode="indeterminate"></md-progress-linear>\
            <ul role="presentation"\
                class="md-autocomplete-suggestions {{menuClass || \'\'}}"\
                id="ul-{{$mdAutocompleteCtrl.id}}"\
                ng-mouseenter="$mdAutocompleteCtrl.listEnter()"\
                ng-mouseleave="$mdAutocompleteCtrl.listLeave()"\
                ng-mouseup="$mdAutocompleteCtrl.mouseUp()">\
              <li ng-repeat="(index, item) in $mdAutocompleteCtrl.matches"\
                  ng-class="{ selected: index === $mdAutocompleteCtrl.index }"\
                  ng-hide="$mdAutocompleteCtrl.hidden"\
                  ng-click="$mdAutocompleteCtrl.select(index)"\
                  md-autocomplete-list-item-template="contents"\
                  md-autocomplete-list-item="$mdAutocompleteCtrl.itemName">\
              </li>\
            </ul>\
          </md-autocomplete-wrap>\
          <aria-status\
              class="md-visually-hidden"\
              role="status"\
              aria-live="assertive">\
            <p ng-repeat="message in $mdAutocompleteCtrl.messages">{{message.display}}</p>\
          </aria-status>';
      }
    };

    function link (scope, element, attr) {
      scope.contents = attr.$mdAutocompleteTemplate;
      delete attr.$mdAutocompleteTemplate;
      angular.forEach(scope.$$isolateBindings, function (binding, key) {
        if (binding.optional && angular.isUndefined(scope[key])) {
          scope[key] = attr.hasOwnProperty(attr.$normalize(binding.attrName));
        }
      });
      $mdTheming(element);
    }
  }
})();
