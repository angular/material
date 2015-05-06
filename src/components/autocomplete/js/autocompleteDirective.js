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
 * To start, you will need to specify the required parameters and provide a template for your results.
 * The content inside `md-autocomplete` will be treated as a template.
 *
 * In more complex cases, you may want to include other content such as a message to display when
 * no matches were found.  You can do this by wrapping your template in `md-item-template` and adding
 * a tag for `md-not-found`.  An example of this is shown below.
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
 * ###Basic Example
 * <hljs lang="html">
 *   <md-autocomplete
 *       md-selected-item="selectedItem"
 *       md-search-text="searchText"
 *       md-items="item in getMatches(searchText)"
 *       md-item-text="item.display">
 *     <span md-highlight-text="searchText">{{item.display}}</span>
 *   </md-autocomplete>
 * </hljs>
 *
 * ###Example with "not found" message
 * <hljs lang="html">
 * <md-autocomplete
 *     md-selected-item="selectedItem"
 *     md-search-text="searchText"
 *     md-items="item in getMatches(searchText)"
 *     md-item-text="item.display">
 *   <md-item-template>
 *     <span md-highlight-text="searchText">{{item.display}}</span>
 *   </md-item-template>
 *   <md-not-found>
 *     No matches found.
 *   </md-not-found>
 * </md-autocomplete>
 * </hljs>
 *
 * In this example, our code utilizes `md-item-template` and `md-not-found` to specify the different
 * parts that make up our component.
 */

function MdAutocomplete ($mdTheming, $mdUtil) {
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
      minLength:     '=?mdMinLength',
      delay:         '=?mdDelay',
      autofocus:     '=?mdAutofocus',
      floatingLabel: '@?mdFloatingLabel',
      autoselect:    '=?mdAutoselect',
      menuClass:     '@?mdMenuClass'
    },
    template: function (element, attr) {
      var itemTemplate = getItemTemplate(),
          noItemsTemplate = getNoItemsTemplate();
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
              tabindex="-1"\
              ng-if="$mdAutocompleteCtrl.scope.searchText && !isDisabled"\
              ng-click="$mdAutocompleteCtrl.clear()">\
            <md-icon md-svg-icon="md-cancel"></md-icon>\
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
                md-autocomplete-list-item="$mdAutocompleteCtrl.itemName">\
                ' + itemTemplate + '\
            </li>\
            ' + (function () {
              return noItemsTemplate
                  ? '<li ng-if="!$mdAutocompleteCtrl.matches.length && !$mdAutocompleteCtrl.loading\
                         && !$mdAutocompleteCtrl.hidden"\
                         ng-hide="$mdAutocompleteCtrl.hidden"\
                         md-autocomplete-parent-scope>' + noItemsTemplate + '</li>'
                  : '';
            })() + '\
          </ul>\
        </md-autocomplete-wrap>\
        <aria-status\
            class="md-visually-hidden"\
            role="status"\
            aria-live="assertive">\
          <p ng-repeat="message in $mdAutocompleteCtrl.messages">{{message.display}}</p>\
        </aria-status>';

      function getItemTemplate () {
        var templateTag = element.find('md-item-template').remove();
        return templateTag.length ? templateTag.html() : element.html();
      }

      function getNoItemsTemplate () {
        var templateTag = element.find('md-not-found').remove();
        return templateTag.length ? templateTag.html() : '';
      }
    }
  };

  function link (scope, element, attr) {
    attr.$observe('disabled', function (value) { scope.isDisabled = value; });

    $mdUtil.initOptionalProperties(scope, attr, {searchText:null, selectedItem:null} );

    $mdTheming(element);
  }
}
