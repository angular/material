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
 * ### Validation
 *
 * You can use `ng-messages` to include validation the same way that you would normally validate;
 * however, if you want to replicate a standard input with a floating label, you will have to do the
 * following:
 *
 * - Make sure that your template is wrapped in `md-item-template`
 * - Add your `ng-messages` code inside of `md-autocomplete`
 * - Add your validation properties to `md-autocomplete` (ie. `required`)
 * - Add a `name` to `md-autocomplete` (to be used on the generated `input`)
 *
 * There is an example below of how this should look.
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
 *
 * ### Example with validation
 * <hljs lang="html">
 * <form name="autocompleteForm">
 *   <md-autocomplete
 *       required
 *       input-name="autocomplete"
 *       md-selected-item="selectedItem"
 *       md-search-text="searchText"
 *       md-items="item in getMatches(searchText)"
 *       md-item-text="item.display">
 *     <md-item-template>
 *       <span md-highlight-text="searchText">{{item.display}}</span>
 *     </md-item-template>
 *     <div ng-messages="autocompleteForm.autocomplete.$error">
 *       <div ng-message="required">This field is required</div>
 *     </div>
 *   </md-autocomplete>
 * </form>
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
      inputName:      '@',
      inputMinlength: '@',
      inputMaxlength: '@',
      searchText:     '=?mdSearchText',
      selectedItem:   '=?mdSelectedItem',
      itemsExpr:      '@mdItems',
      itemText:       '&mdItemText',
      placeholder:    '@placeholder',
      noCache:        '=?mdNoCache',
      itemChange:     '&?mdSelectedItemChange',
      textChange:     '&?mdSearchTextChange',
      minLength:      '=?mdMinLength',
      delay:          '=?mdDelay',
      autofocus:      '=?mdAutofocus',
      floatingLabel:  '@?mdFloatingLabel',
      autoselect:     '=?mdAutoselect',
      menuClass:      '@?mdMenuClass'
    },
    template: function (element, attr) {
      var noItemsTemplate = getNoItemsTemplate(),
          itemTemplate = getItemTemplate(),
          leftover = element.html();
      element.empty();

      return '\
        <md-autocomplete-wrap role="listbox">\
          <md-input-container ng-if="floatingLabel">\
            <label>{{floatingLabel}}</label>\
            <div class="md-autocomplete-button-wrapper">\
              <button\
                  type="button"\
                  tabindex="-1"\
                  ng-if="$mdAutocompleteCtrl.scope.searchText && !isDisabled"\
                  ng-click="$mdAutocompleteCtrl.clear()">\
                <md-icon md-svg-icon="md-cancel"></md-icon>\
                <span class="md-visually-hidden">Clear</span>\
              </button>\
            </div>\
            <input type="text"\
                id="fl-input-{{$mdAutocompleteCtrl.id}}"\
                name="{{inputName}}"\
                autocomplete="off"\
                ng-required="isRequired"\
                ng-minlength="inputMinlength"\
                ng-maxlength="inputMaxlength"\
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
            <div md-autocomplete-parent-scope md-autocomplete-replace>' + leftover + '</div>\
          </md-input-container>\
          <div ng-if="!floatingLabel" class="md-autocomplete-button-wrapper">\
            <button\
                type="button"\
                tabindex="-1"\
                ng-if="$mdAutocompleteCtrl.scope.searchText && !isDisabled"\
                ng-click="$mdAutocompleteCtrl.clear()">\
              <md-icon md-svg-icon="md-cancel"></md-icon>\
              <span class="md-visually-hidden">Clear</span>\
            </button>\
          </div>\
          <input type="text"\
              id="input-{{$mdAutocompleteCtrl.id}}"\
              name="{{inputName}}"\
              ng-if="!floatingLabel"\
              ng-required="isRequired"\
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
            ' +
            //-- Add "not found" template if available
            (noItemsTemplate
                ? '<li ng-if="!$mdAutocompleteCtrl.matches.length"\
                      ng-hide="$mdAutocompleteCtrl.hidden"\
                      md-autocomplete-parent-scope>' + noItemsTemplate + '</li>'
                : '' )
            + '\
          </ul>\
        </md-autocomplete-wrap>\
        <aria-status\
            class="md-visually-hidden"\
            role="status"\
            aria-live="assertive">\
          <p ng-repeat="message in $mdAutocompleteCtrl.messages">{{message.display}}</p>\
        </aria-status>';

      function getItemTemplate () {
        var templateTag = element.find('md-item-template').remove(),
            html        = templateTag.length ? templateTag.html() : element.html();
        if (!templateTag.length) element.empty();
        return html;
      }

      function getNoItemsTemplate () {
        var templateTag = element.find('md-not-found').remove();
        return templateTag.length ? templateTag.html() : '';
      }
    }
  };

  function link (scope, element, attr) {
    attr.$observe('disabled', function (value) { scope.isDisabled = value; });
    attr.$observe('required', function (value) { scope.isRequired = value !== null; });

    $mdUtil.initOptionalProperties(scope, attr, {searchText:null, selectedItem:null} );

    $mdTheming(element);
  }
}
