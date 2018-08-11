angular
    .module('material.components.autocomplete')
    .directive('mdAutocomplete', MdAutocomplete);

/**
 * @ngdoc directive
 * @name mdAutocomplete
 * @module material.components.autocomplete
 *
 * @description
 * `<md-autocomplete>` is a special input component with a drop-down of all possible matches to a
 *     custom query. This component allows you to provide real-time suggestions as the user types
 *     in the input area.
 *
 * To start, you will need to specify the required parameters and provide a template for your
 *     results. The content inside `md-autocomplete` will be treated as a template.
 *
 * In more complex cases, you may want to include other content such as a message to display when
 *     no matches were found.  You can do this by wrapping your template in `md-item-template` and
 *     adding a tag for `md-not-found`.  An example of this is shown below.
 *
 * To reset the displayed value you must clear both values for `md-search-text` and
 * `md-selected-item`.
 *
 * ### Validation
 *
 * You can use `ng-messages` to include validation the same way that you would normally validate;
 *     however, if you want to replicate a standard input with a floating label, you will have to
 *     do the following:
 *
 * - Make sure that your template is wrapped in `md-item-template`
 * - Add your `ng-messages` code inside of `md-autocomplete`
 * - Add your validation properties to `md-autocomplete` (ie. `required`)
 * - Add a `name` to `md-autocomplete` (to be used on the generated `input`)
 *
 * There is an example below of how this should look.
 *
 * ### Snapping Drop-Down
 *
 * You can cause the autocomplete drop-down to snap to an ancestor element by applying the
 *     `md-autocomplete-snap` attribute to that element. You can also snap to the width of
 *     the `md-autocomplete-snap` element by setting the attribute's value to `width`
 *     (ie. `md-autocomplete-snap="width"`).
 *
 * ### Notes
 *
 * **Autocomplete Dropdown Items Rendering**
 *
 * The `md-autocomplete` uses the the <a ng-href="api/directive/mdVirtualRepeat">
 *   mdVirtualRepeat</a> directive for displaying the results inside of the dropdown.<br/>
 *
 * > When encountering issues regarding the item template please take a look at the
 *   <a ng-href="api/directive/mdVirtualRepeatContainer">VirtualRepeatContainer</a> documentation.
 *
 * **Autocomplete inside of a Virtual Repeat**
 *
 * When using the `md-autocomplete` directive inside of a
 * <a ng-href="api/directive/mdVirtualRepeatContainer">VirtualRepeatContainer</a> the dropdown items
 * might not update properly, because caching of the results is enabled by default.
 *
 * The autocomplete will then show invalid dropdown items, because the Virtual Repeat only updates
 * the scope bindings rather than re-creating the `md-autocomplete`. This means that the previous
 * cached results will be used.
 *
 * > To avoid such problems, ensure that the autocomplete does not cache any results via
 * `md-no-cache="true"`:
 *
 * <hljs lang="html">
 *   <md-autocomplete
 *       md-no-cache="true"
 *       md-selected-item="selectedItem"
 *       md-items="item in items"
 *       md-search-text="searchText"
 *       md-item-text="item.display">
 *     <span>{{ item.display }}</span>
 *   </md-autocomplete>
 * </hljs>
 *
 *
 * @param {expression} md-items An expression in the format of `item in results` to iterate over
 *     matches for your search.<br/><br/>
 *     The `results` expression can be also a function, which returns the results synchronously
 *     or asynchronously (per Promise).
 * @param {expression=} md-selected-item-change An expression to be run each time a new item is
 *     selected.
 * @param {expression=} md-search-text-change An expression to be run each time the search text
 *     updates.
 * @param {expression=} md-search-text A model to bind the search query text to.
 * @param {object=} md-selected-item A model to bind the selected item to.
 * @param {expression=} md-item-text An expression that will convert your object to a single string.
 * @param {string=} placeholder Placeholder text that will be forwarded to the input.
 * @param {boolean=} md-no-cache Disables the internal caching that happens in autocomplete.
 * @param {boolean=} ng-disabled Determines whether or not to disable the input field.
 * @param {boolean=} md-require-match When set to true, the autocomplete will add a validator,
 *     which will evaluate to false, when no item is currently selected.
 * @param {number=} md-min-length Specifies the minimum length of text before autocomplete will
 *     make suggestions.
 * @param {number=} md-delay Specifies the amount of time (in milliseconds) to wait before looking
 *     for results.
 * @param {boolean=} md-clear-button Whether the clear button for the autocomplete input should show
 *     up or not.
 * @param {boolean=} md-autofocus If true, the autocomplete will be automatically focused when a
 *     `$mdDialog`, `$mdBottomsheet` or `$mdSidenav`, which contains the autocomplete, is opening.
 *     <br/><br/>
 *     Also the autocomplete will immediately focus the input element.
 * @param {boolean=} md-no-asterisk When present, asterisk will not be appended to the floating
 *     label.
 * @param {boolean=} md-autoselect If set to true, the first item will be automatically selected
 *     in the dropdown upon open.
 * @param {string=} md-input-name The name attribute given to the input element to be used with
 *     FormController.
 * @param {string=} md-menu-class This class will be applied to the dropdown menu for styling.
 * @param {string=} md-menu-container-class This class will be applied to the parent container
 *     of the dropdown panel.
 * @param {string=} md-input-class This will be applied to the input for styling. This attribute
 *     is only valid when a `md-floating-label` is defined.
 * @param {string=} md-floating-label This will add a floating label to autocomplete and wrap it in
 *     `md-input-container`.
 * @param {string=} md-select-on-focus When present the inputs text will be automatically selected
 *     on focus.
 * @param {string=} md-input-id An ID to be added to the input element.
 * @param {number=} md-input-minlength The minimum length for the input's value for validation.
 * @param {number=} md-input-maxlength The maximum length for the input's value for validation.
 * @param {boolean=} md-select-on-match When set, autocomplete will automatically select
 *     the item if the search text is an exact match. <br/><br/>
 *     An exact match is when only one match is displayed.
 * @param {boolean=} md-match-case-insensitive When set and using `md-select-on-match`, autocomplete
 *     will select on case-insensitive match.
 * @param {string=} md-escape-options Override escape key logic. Default is `blur clear`.<br/>
 *     Options: `blur`, `clear`, `none`.
 * @param {string=} md-dropdown-items Specifies the maximum amount of items to be shown in
 *     the dropdown.<br/><br/>
 *     When the dropdown doesn't fit into the viewport, the dropdown will shrink
 *     as much as possible.
 * @param {string=} md-dropdown-position Overrides the default dropdown position. Options: `top`,
 *    `bottom`.
 * @param {string=} input-aria-describedby A space-separated list of element IDs. This should
 *     contain the IDs of any elements that describe this autocomplete. Screen readers will read the
 *     content of these elements at the end of announcing that the autocomplete has been selected
 *     and describing its current state. The descriptive elements do not need to be visible on the
 *     page.
 * @param {string=} input-aria-labelledby A space-separated list of element IDs. The ideal use case
 *     is that this would contain the ID of a `<label>` element that is associated with this
 *     autocomplete. This will only have affect when `md-floating-label` is not defined.<br><br>
 *     For `<label id="state">US State</label>`, you would set this to
 *     `input-aria-labelledby="state"`.
 * @param {string=} input-aria-label A label that will be applied to the autocomplete's input.
 *    This will be announced by screen readers before the placeholder.
 *    This will only have affect when `md-floating-label` is not defined. If you define both
 *    `input-aria-label` and `input-aria-labelledby`, then `input-aria-label` will take precedence.
 * @param {string=} md-selected-message Attribute to specify the text that the screen reader will
 *    announce after a value is selected. Default is: "selected". If `Alaska` is selected in the
 *    options panel, it will read "Alaska selected". You will want to override this when your app
 *    is running in a non-English locale.
 * @param {boolean=} ng-trim If set to false, the search text will be not trimmed automatically.
 *     Defaults to true.
 * @param {string=} ng-pattern Adds the pattern validator to the ngModel of the search text.
 *     See the [ngPattern Directive](https://docs.angularjs.org/api/ng/directive/ngPattern)
 *     for more details.
 *
 * @usage
 * ### Basic Example
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
 * ### Example with "not found" message
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
 * In this example, our code utilizes `md-item-template` and `md-not-found` to specify the
 *     different parts that make up our component.
 *
 * ### Clear button for the input
 * By default, the clear button is displayed when there is input. This aligns with the spec's
 * [Search Pattern](https://material.io/archive/guidelines/patterns/search.html#search-in-app-search).
 * In floating label mode, when `md-floating-label="My Label"` is applied, the clear button is not
 * displayed by default (see the spec's
 * [Autocomplete Text Field](https://material.io/archive/guidelines/components/text-fields.html#text-fields-layout)).
 *
 * Nevertheless, developers are able to explicitly toggle the clear button for all autocomplete
 * components with `md-clear-button`.
 *
 * <hljs lang="html">
 *   <md-autocomplete ... md-clear-button="true"></md-autocomplete>
 *   <md-autocomplete ... md-clear-button="false"></md-autocomplete>
 * </hljs>
 *
 * In previous versions, the clear button was always hidden when the component was disabled.
 * This changed in `1.1.5` to give the developer control of this behavior. This example
 * will hide the clear button only when the component is disabled.
 *
 * <hljs lang="html">
 *   <md-autocomplete ... ng-disabled="disabled" md-clear-button="!disabled"></md-autocomplete>
 * </hljs>
 *
 * ### Example with validation
 * <hljs lang="html">
 * <form name="autocompleteForm">
 *   <md-autocomplete
 *       required
 *       md-input-name="autocomplete"
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
 * In this example, our code utilizes `md-item-template` and `ng-messages` to specify
 *     input validation for the field.
 *
 * ### Asynchronous Results
 * The autocomplete items expression also supports promises, which will resolve with the query
 * results.
 *
 * <hljs lang="js">
 *   function AppController($scope, $http) {
 *     $scope.query = function(searchText) {
 *       return $http
 *         .get(BACKEND_URL + '/items/' + searchText)
 *         .then(function(data) {
 *           // Map the response object to the data object.
 *           return data;
 *         });
 *     };
 *   }
 * </hljs>
 *
 * <hljs lang="html">
 *   <md-autocomplete
 *       md-selected-item="selectedItem"
 *       md-search-text="searchText"
 *       md-items="item in query(searchText)">
 *     <md-item-template>
 *       <span md-highlight-text="searchText">{{item}}</span>
 *     </md-item-template>
 * </md-autocomplete>
 * </hljs>
 *
 */
function MdAutocomplete ($$mdSvgRegistry) {

  return {
    controller:   'MdAutocompleteCtrl',
    controllerAs: '$mdAutocompleteCtrl',
    scope:        {
      inputName:          '@mdInputName',
      inputMinlength:     '@mdInputMinlength',
      inputMaxlength:     '@mdInputMaxlength',
      searchText:         '=?mdSearchText',
      selectedItem:       '=?mdSelectedItem',
      itemsExpr:          '@mdItems',
      itemText:           '&mdItemText',
      placeholder:        '@placeholder',
      inputAriaDescribedBy: '@?inputAriaDescribedby',
      inputAriaLabelledBy: '@?inputAriaLabelledby',
      inputAriaLabel:     '@?inputAriaLabel',
      noCache:            '=?mdNoCache',
      requireMatch:       '=?mdRequireMatch',
      selectOnMatch:      '=?mdSelectOnMatch',
      matchInsensitive:   '=?mdMatchCaseInsensitive',
      itemChange:         '&?mdSelectedItemChange',
      textChange:         '&?mdSearchTextChange',
      minLength:          '=?mdMinLength',
      delay:              '=?mdDelay',
      autofocus:          '=?mdAutofocus',
      floatingLabel:      '@?mdFloatingLabel',
      autoselect:         '=?mdAutoselect',
      menuClass:          '@?mdMenuClass',
      menuContainerClass: '@?mdMenuContainerClass',
      inputClass:         '@?mdInputClass',
      inputId:            '@?mdInputId',
      escapeOptions:      '@?mdEscapeOptions',
      dropdownItems:      '=?mdDropdownItems',
      dropdownPosition:   '@?mdDropdownPosition',
      clearButton:        '=?mdClearButton',
      selectedMessage:    '@?mdSelectedMessage'
    },
    compile: function(tElement, tAttrs) {
      var attributes = ['md-select-on-focus', 'md-no-asterisk', 'ng-trim', 'ng-pattern'];
      var input = tElement.find('input');

      attributes.forEach(function(attribute) {
        var attrValue = tAttrs[tAttrs.$normalize(attribute)];

        if (attrValue !== null) {
          input.attr(attribute, attrValue);
        }
      });

      return function(scope, element, attrs, ctrl) {
        // Retrieve the state of using a md-not-found template by using our attribute, which will
        // be added to the element in the template function.
        ctrl.hasNotFound = !!element.attr('md-has-not-found');

        // By default the inset autocomplete should show the clear button when not explicitly
        // overwritten or in floating label mode.
        if (!angular.isDefined(attrs.mdClearButton) && !scope.floatingLabel) {
          scope.clearButton = true;
        }
      };
    },
    template:     function (element, attr) {
      var noItemsTemplate = getNoItemsTemplate(),
          itemTemplate    = getItemTemplate(),
          leftover        = element.html(),
          tabindex        = attr.tabindex;
      var menuContainerClass = attr.mdMenuContainerClass ? ' ' + attr.mdMenuContainerClass : '';

      // Set our attribute for the link function above which runs later.
      // We will set an attribute, because otherwise the stored variables will be trashed when
      // removing the element is hidden while retrieving the template. For example when using ngIf.
      if (noItemsTemplate) element.attr('md-has-not-found', true);

      // Always set our tabindex of the autocomplete directive to -1, because our input
      // will hold the actual tabindex.
      element.attr('tabindex', '-1');

      return '\
        <md-autocomplete-wrap\
            ng-class="{ \'md-whiteframe-z1\': !floatingLabel, \
                        \'md-menu-showing\': !$mdAutocompleteCtrl.hidden, \
                        \'md-show-clear-button\': !!clearButton }">\
          ' + getInputElement() + '\
          ' + getClearButton() + '\
          <md-progress-linear\
              class="' + (attr.mdFloatingLabel ? 'md-inline' : '') + '"\
              ng-if="$mdAutocompleteCtrl.loadingIsVisible()"\
              md-mode="indeterminate"></md-progress-linear>\
          <md-virtual-repeat-container\
              md-auto-shrink\
              md-auto-shrink-min="1"\
              ng-mouseenter="$mdAutocompleteCtrl.listEnter()"\
              ng-mouseleave="$mdAutocompleteCtrl.listLeave()"\
              ng-mouseup="$mdAutocompleteCtrl.mouseUp()"\
              ng-hide="$mdAutocompleteCtrl.hidden"\
              class="md-autocomplete-suggestions-container md-whiteframe-z1' + menuContainerClass + '"\
              ng-class="{ \'md-not-found\': $mdAutocompleteCtrl.notFoundVisible() }"\
              role="presentation">\
            <ul class="md-autocomplete-suggestions"\
                ng-class="::menuClass"\
                id="ul-{{$mdAutocompleteCtrl.id}}"\
                role="listbox">\
              <li md-virtual-repeat="item in $mdAutocompleteCtrl.matches"\
                  ng-class="{ selected: $index === $mdAutocompleteCtrl.index }"\
                  ng-attr-id="{{$index === $mdAutocompleteCtrl.index ? \'selected_option\' : undefined}}"\
                  ng-click="$mdAutocompleteCtrl.select($index)"\
                  role="option"\
                  aria-setsize="{{$mdAutocompleteCtrl.matches.length}}"\
                  aria-posinset="{{$index+1}}"\
                  aria-selected="{{$index === $mdAutocompleteCtrl.index ? true : false}}" \
                  md-extra-name="$mdAutocompleteCtrl.itemName">\
                  ' + itemTemplate + '\
                  </li>' + noItemsTemplate + '\
            </ul>\
          </md-virtual-repeat-container>\
        </md-autocomplete-wrap>';

      function getItemTemplate() {
        var templateTag = element.find('md-item-template').detach(),
            html = templateTag.length ? templateTag.html() : element.html();
        if (!templateTag.length) element.empty();
        return '<md-autocomplete-parent-scope md-autocomplete-replace>' + html +
               '</md-autocomplete-parent-scope>';
      }

      function getNoItemsTemplate() {
        var templateTag = element.find('md-not-found').detach(),
            template = templateTag.length ? templateTag.html() : '';
        return template
            ? '<li ng-if="$mdAutocompleteCtrl.notFoundVisible()"\
                         md-autocomplete-parent-scope>' + template + '</li>'
            : '';

      }

      function getInputElement () {
        if (attr.mdFloatingLabel) {
          return '\
            <md-input-container ng-if="floatingLabel">\
              <label>{{floatingLabel}}</label>\
              <input type="search"\
                ' + (tabindex != null ? 'tabindex="' + tabindex + '"' : '') + '\
                id="{{ inputId || \'fl-input-\' + $mdAutocompleteCtrl.id }}"\
                name="{{inputName}}"\
                ng-class="::inputClass"\
                autocomplete="off"\
                ng-required="$mdAutocompleteCtrl.isRequired"\
                ng-readonly="$mdAutocompleteCtrl.isReadonly"\
                ng-minlength="inputMinlength"\
                ng-maxlength="inputMaxlength"\
                ng-disabled="$mdAutocompleteCtrl.isDisabled"\
                ng-model="$mdAutocompleteCtrl.scope.searchText"\
                ng-model-options="{ allowInvalid: true }"\
                ng-keydown="$mdAutocompleteCtrl.keydown($event)"\
                ng-blur="$mdAutocompleteCtrl.blur($event)"\
                ng-focus="$mdAutocompleteCtrl.focus($event)"\
                aria-label="{{floatingLabel}}"\
                aria-autocomplete="list"\
                role="combobox"\
                aria-haspopup="true"\
                aria-expanded="{{!$mdAutocompleteCtrl.hidden}}"\
                aria-owns="ul-{{$mdAutocompleteCtrl.id}}"\
                ng-attr-aria-activedescendant="{{$mdAutocompleteCtrl.index >= 0 ? \'selected_option\' : undefined}}">\
              <div md-autocomplete-parent-scope md-autocomplete-replace>' + leftover + '</div>\
            </md-input-container>';
        } else {
          return '\
            <input type="search"\
              ' + (tabindex != null ? 'tabindex="' + tabindex + '"' : '') + '\
              id="{{ inputId || \'input-\' + $mdAutocompleteCtrl.id }}"\
              name="{{inputName}}"\
              ng-class="::inputClass"\
              ng-if="!floatingLabel"\
              autocomplete="off"\
              ng-required="$mdAutocompleteCtrl.isRequired"\
              ng-disabled="$mdAutocompleteCtrl.isDisabled"\
              ng-readonly="$mdAutocompleteCtrl.isReadonly"\
              ng-minlength="inputMinlength"\
              ng-maxlength="inputMaxlength"\
              ng-model="$mdAutocompleteCtrl.scope.searchText"\
              ng-keydown="$mdAutocompleteCtrl.keydown($event)"\
              ng-blur="$mdAutocompleteCtrl.blur($event)"\
              ng-focus="$mdAutocompleteCtrl.focus($event)"\
              placeholder="{{placeholder}}"\
              aria-label="{{placeholder}}"\
              aria-autocomplete="list"\
              role="combobox"\
              aria-haspopup="true"\
              aria-expanded="{{!$mdAutocompleteCtrl.hidden}}"\
              aria-owns="ul-{{$mdAutocompleteCtrl.id}}"\
              ng-attr-aria-activedescendant="{{$mdAutocompleteCtrl.index >= 0 ? \'selected_option\' : undefined}}">';
        }
      }

      function getClearButton() {
        return '' +
          '<button ' +
              'type="button" ' +
              'aria-label="Clear Input" ' +
              'tabindex="-1" ' +
              'ng-if="clearButton && $mdAutocompleteCtrl.scope.searchText" ' +
              'ng-click="$mdAutocompleteCtrl.clear($event)">' +
            '<md-icon md-svg-src="' + $$mdSvgRegistry.mdClose + '"></md-icon>' +
          '</button>';
        }
    }
  };
}
