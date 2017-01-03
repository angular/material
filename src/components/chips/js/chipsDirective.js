  angular
      .module('material.components.chips')
      .directive('mdChips', MdChips);

  /**
   * @ngdoc directive
   * @name mdChips
   * @module material.components.chips
   *
   * @description
   * `<md-chips>` is an input component for building lists of strings or objects. The list items are
   * displayed as 'chips'. This component can make use of an `<input>` element or an 
   * `<md-autocomplete>` element.
   *
   * ### Custom templates
   * A custom template may be provided to render the content of each chip. This is achieved by
   * specifying an `<md-chip-template>` element containing the custom content as a child of
   * `<md-chips>`.
   *
   * Note: Any attributes on
   * `<md-chip-template>` will be dropped as only the innerHTML is used for the chip template. The
   * variables `$chip` and `$index` are available in the scope of `<md-chip-template>`, representing
   * the chip object and its index in the list of chips, respectively.
   * To override the chip delete control, include an element (ideally a button) with the attribute
   * `md-chip-remove`. A click listener to remove the chip will be added automatically. The element
   * is also placed as a sibling to the chip content (on which there are also click listeners) to
   * avoid a nested ng-click situation.
   *
   * <!-- Note: We no longer want to include this in the site docs; but it should remain here for
   * future developers and those looking at the documentation.
   *
   * <h3> Pending Features </h3>
   * <ul style="padding-left:20px;">
   *
   *   <ul>Style
   *     <li>Colours for hover, press states (ripple?).</li>
   *   </ul>
   *
   *   <ul>Validation
   *     <li>allow a validation callback</li>
   *     <li>hilighting style for invalid chips</li>
   *   </ul>
   *
   *   <ul>Item mutation
   *     <li>Support `
   *       <md-chip-edit>` template, show/hide the edit element on tap/click? double tap/double
   *       click?
   *     </li>
   *   </ul>
   *
   *   <ul>Truncation and Disambiguation (?)
   *     <li>Truncate chip text where possible, but do not truncate entries such that two are
   *     indistinguishable.</li>
   *   </ul>
   *
   *   <ul>Drag and Drop
   *     <li>Drag and drop chips between related `<md-chips>` elements.
   *     </li>
   *   </ul>
   * </ul>
   *
   * //-->
   *
   * Sometimes developers want to limit the amount of possible chips.<br/>
   * You can specify the maximum amount of chips by using the following markup.
   *
   * <hljs lang="html">
   *   <md-chips
   *       ng-model="myItems"
   *       placeholder="Add an item"
   *       md-max-chips="5">
   *   </md-chips>
   * </hljs>
   *
   * In some cases, you have an autocomplete inside of the `md-chips`.<br/>
   * When the maximum amount of chips has been reached, you can also disable the autocomplete selection.<br/>
   * Here is an example markup.
   *
   * <hljs lang="html">
   *   <md-chips ng-model="myItems" md-max-chips="5">
   *     <md-autocomplete ng-hide="myItems.length > 5" ...></md-autocomplete>
   *   </md-chips>
   * </hljs>
   *
   * ### Accessibility
   *
   * The `md-chips` component supports keyboard and screen reader users since Version 1.1.2. In
   * order to achieve this, we modified the chips behavior to select newly appended chips for
   * `300ms` before re-focusing the input and allowing the user to type.
   *
   * For most users, this delay is small enough that it will not be noticeable but allows certain
   * screen readers to function properly (JAWS and NVDA in particular).
   *
   * We introduced a new `md-chip-append-delay` option to allow developers to better control this
   * behavior.
   *
   * Please refer to the documentation of this option (below) for more information.
   *
   * @param {string=|object=} ng-model A model to which the list of items will be bound.
   * @param {string=} placeholder Placeholder text that will be forwarded to the input.
   * @param {string=} secondary-placeholder Placeholder text that will be forwarded to the input,
   *    displayed when there is at least one item in the list
   * @param {boolean=} md-removable Enables or disables the deletion of chips through the
   *    removal icon or the Delete/Backspace key. Defaults to true.
   * @param {boolean=} readonly Disables list manipulation (deleting or adding list items), hiding
   *    the input and delete buttons. If no `ng-model` is provided, the chips will automatically be
   *    marked as readonly.<br/><br/>
   *    When `md-removable` is not defined, the `md-remove` behavior will be overwritten and disabled.
   * @param {string=} md-enable-chip-edit Set this to "true" to enable editing of chip contents. The user can 
   *    go into edit mode with pressing "space", "enter", or double clicking on the chip. Chip edit is only
   *    supported for chips with basic template.
   * @param {number=} md-max-chips The maximum number of chips allowed to add through user input.
   *    <br/><br/>The validation property `md-max-chips` can be used when the max chips
   *    amount is reached.
   * @param {boolean=} md-add-on-blur When set to true, remaining text inside of the input will
   *    be converted into a new chip on blur.
   * @param {expression} md-transform-chip An expression of form `myFunction($chip)` that when called
   *    expects one of the following return values:
   *    - an object representing the `$chip` input string
   *    - `undefined` to simply add the `$chip` input string, or
   *    - `null` to prevent the chip from being appended
   * @param {expression=} md-on-add An expression which will be called when a chip has been
   *    added.
   * @param {expression=} md-on-remove An expression which will be called when a chip has been
   *    removed.
   * @param {expression=} md-on-select An expression which will be called when a chip is selected.
   * @param {boolean} md-require-match If true, and the chips template contains an autocomplete,
   *    only allow selection of pre-defined chips (i.e. you cannot add new ones).
   * @param {string=} input-aria-label A string read by screen readers to identify the input.
   * @param {string=} container-hint A string read by screen readers informing users of how to
   *    navigate the chips. Used in readonly mode.
   * @param {string=} delete-hint A string read by screen readers instructing users that pressing
   *    the delete key will remove the chip.
   * @param {string=} delete-button-label A label for the delete button. Also hidden and read by
   *    screen readers.
   * @param {expression=} md-separator-keys An array of key codes used to separate chips.
   * @param {string=} md-chip-append-delay The number of milliseconds that the component will select
   *    a newly appended chip before allowing a user to type into the input. This is **necessary**
   *    for keyboard accessibility for screen readers. It defaults to 300ms and any number less than
   *    300 can cause issues with screen readers (particularly JAWS and sometimes NVDA).
   *
   *    _Available since Version 1.1.2._
   *
   *    **Note:** You can safely set this to `0` in one of the following two instances:
   *
   *    1. You are targeting an iOS or Safari-only application (where users would use VoiceOver) or
   *    only ChromeVox users.
   *
   *    2. If you have utilized the `md-separator-keys` to disable the `enter` keystroke in
   *    favor of another one (such as `,` or `;`).
   *
   * @usage
   * <hljs lang="html">
   *   <md-chips
   *       ng-model="myItems"
   *       placeholder="Add an item"
   *       readonly="isReadOnly">
   *   </md-chips>
   * </hljs>
   *
   * <h3>Validation</h3>
   * When using [ngMessages](https://docs.angularjs.org/api/ngMessages), you can show errors based
   * on our custom validators.
   * <hljs lang="html">
   *   <form name="userForm">
   *     <md-chips
   *       name="fruits"
   *       ng-model="myItems"
   *       placeholder="Add an item"
   *       md-max-chips="5">
   *     </md-chips>
   *     <div ng-messages="userForm.fruits.$error" ng-if="userForm.$dirty">
   *       <div ng-message="md-max-chips">You reached the maximum amount of chips</div>
   *    </div>
   *   </form>
   * </hljs>
   *
   */

  var MD_CHIPS_TEMPLATE = '\
      <md-chips-wrap\
          id="{{$mdChipsCtrl.wrapperId}}"\
          tabindex="{{$mdChipsCtrl.readonly ? 0 : -1}}"\
          ng-keydown="$mdChipsCtrl.chipKeydown($event)"\
          ng-class="{ \'md-focused\': $mdChipsCtrl.hasFocus(), \
                      \'md-readonly\': !$mdChipsCtrl.ngModelCtrl || $mdChipsCtrl.readonly,\
                      \'md-removable\': $mdChipsCtrl.isRemovable() }"\
          aria-setsize="{{$mdChipsCtrl.items.length}}"\
          class="md-chips">\
        <span ng-if="$mdChipsCtrl.readonly" class="md-visually-hidden">\
          {{$mdChipsCtrl.containerHint}}\
        </span>\
        <md-chip ng-repeat="$chip in $mdChipsCtrl.items"\
            index="{{$index}}"\
            ng-class="{\'md-focused\': $mdChipsCtrl.selectedChip == $index, \'md-readonly\': !$mdChipsCtrl.ngModelCtrl || $mdChipsCtrl.readonly}">\
          <div class="md-chip-content"\
              tabindex="{{$mdChipsCtrl.ariaTabIndex == $index ? 0 : -1}}"\
              id="{{$mdChipsCtrl.contentIdFor($index)}}"\
              role="option"\
              aria-selected="{{$mdChipsCtrl.selectedChip == $index}}" \
              aria-posinset="{{$index}}"\
              ng-click="!$mdChipsCtrl.readonly && $mdChipsCtrl.focusChip($index)"\
              ng-focus="!$mdChipsCtrl.readonly && $mdChipsCtrl.selectChip($index)"\
              md-chip-transclude="$mdChipsCtrl.chipContentsTemplate"></div>\
          <div ng-if="$mdChipsCtrl.isRemovable()"\
               class="md-chip-remove-container"\
               tabindex="-1"\
               md-chip-transclude="$mdChipsCtrl.chipRemoveTemplate"></div>\
        </md-chip>\
        <div class="md-chip-input-container" ng-if="!$mdChipsCtrl.readonly && $mdChipsCtrl.ngModelCtrl">\
          <div md-chip-transclude="$mdChipsCtrl.chipInputTemplate"></div>\
        </div>\
      </md-chips-wrap>';

  var CHIP_INPUT_TEMPLATE = '\
        <input\
            class="md-input"\
            tabindex="0"\
            aria-label="{{$mdChipsCtrl.inputAriaLabel}}" \
            placeholder="{{$mdChipsCtrl.getPlaceholder()}}"\
            ng-model="$mdChipsCtrl.chipBuffer"\
            ng-focus="$mdChipsCtrl.onInputFocus()"\
            ng-blur="$mdChipsCtrl.onInputBlur()"\
            ng-keydown="$mdChipsCtrl.inputKeydown($event)">';

  var CHIP_DEFAULT_TEMPLATE = '\
      <span>{{$chip}}</span>';

  var CHIP_REMOVE_TEMPLATE = '\
      <button\
          class="md-chip-remove"\
          ng-if="$mdChipsCtrl.isRemovable()"\
          ng-click="$mdChipsCtrl.removeChipAndFocusInput($$replacedScope.$index)"\
          type="button"\
          tabindex="-1">\
        <md-icon md-svg-src="{{ $mdChipsCtrl.mdCloseIcon }}"></md-icon>\
        <span class="md-visually-hidden">\
          {{$mdChipsCtrl.deleteButtonLabel}}\
        </span>\
      </button>';

  /**
   * MDChips Directive Definition
   */
  function MdChips ($mdTheming, $mdUtil, $compile, $log, $timeout, $$mdSvgRegistry) {
    // Run our templates through $mdUtil.processTemplate() to allow custom start/end symbols
    var templates = getTemplates();

    return {
      template: function(element, attrs) {
        // Clone the element into an attribute. By prepending the attribute
        // name with '$', Angular won't write it into the DOM. The cloned
        // element propagates to the link function via the attrs argument,
        // where various contained-elements can be consumed.
        attrs['$mdUserTemplate'] = element.clone();
        return templates.chips;
      },
      require: ['mdChips'],
      restrict: 'E',
      controller: 'MdChipsCtrl',
      controllerAs: '$mdChipsCtrl',
      bindToController: true,
      compile: compile,
      scope: {
        readonly: '=readonly',
        removable: '=mdRemovable',
        placeholder: '@',
        secondaryPlaceholder: '@',
        maxChips: '@mdMaxChips',
        transformChip: '&mdTransformChip',
        onAppend: '&mdOnAppend',
        onAdd: '&mdOnAdd',
        onRemove: '&mdOnRemove',
        onSelect: '&mdOnSelect',
        inputAriaLabel: '@',
        containerHint: '@',
        deleteHint: '@',
        deleteButtonLabel: '@',
        separatorKeys: '=?mdSeparatorKeys',
        requireMatch: '=?mdRequireMatch',
        chipAppendDelayString: '@?mdChipAppendDelay'
      }
    };

    /**
     * Builds the final template for `md-chips` and returns the postLink function.
     *
     * Building the template involves 3 key components:
     * static chips
     * chip template
     * input control
     *
     * If no `ng-model` is provided, only the static chip work needs to be done.
     *
     * If no user-passed `md-chip-template` exists, the default template is used. This resulting
     * template is appended to the chip content element.
     *
     * The remove button may be overridden by passing an element with an md-chip-remove attribute.
     *
     * If an `input` or `md-autocomplete` element is provided by the caller, it is set aside for
     * transclusion later. The transclusion happens in `postLink` as the parent scope is required.
     * If no user input is provided, a default one is appended to the input container node in the
     * template.
     *
     * Static Chips (i.e. `md-chip` elements passed from the caller) are gathered and set aside for
     * transclusion in the `postLink` function.
     *
     *
     * @param element
     * @param attr
     * @returns {Function}
     */
    function compile(element, attr) {
      // Grab the user template from attr and reset the attribute to null.
      var userTemplate = attr['$mdUserTemplate'];
      attr['$mdUserTemplate'] = null;

      var chipTemplate = getTemplateByQuery('md-chips>md-chip-template');

      var chipRemoveSelector = $mdUtil
        .prefixer()
        .buildList('md-chip-remove')
        .map(function(attr) {
          return 'md-chips>*[' + attr + ']';
        })
        .join(',');

      // Set the chip remove, chip contents and chip input templates. The link function will put
      // them on the scope for transclusion later.
      var chipRemoveTemplate   = getTemplateByQuery(chipRemoveSelector) || templates.remove,
          chipContentsTemplate = chipTemplate || templates.default,
          chipInputTemplate    = getTemplateByQuery('md-chips>md-autocomplete')
              || getTemplateByQuery('md-chips>input')
              || templates.input,
          staticChips = userTemplate.find('md-chip');

      // Warn of malformed template. See #2545
      if (userTemplate[0].querySelector('md-chip-template>*[md-chip-remove]')) {
        $log.warn('invalid placement of md-chip-remove within md-chip-template.');
      }

      function getTemplateByQuery (query) {
        if (!attr.ngModel) return;
        var element = userTemplate[0].querySelector(query);
        return element && element.outerHTML;
      }

      /**
       * Configures controller and transcludes.
       */
      return function postLink(scope, element, attrs, controllers) {
        $mdUtil.initOptionalProperties(scope, attr);

        $mdTheming(element);
        var mdChipsCtrl = controllers[0];
        if(chipTemplate) {
          // Chip editing functionality assumes we are using the default chip template.
          mdChipsCtrl.enableChipEdit = false;
        }

        mdChipsCtrl.chipContentsTemplate = chipContentsTemplate;
        mdChipsCtrl.chipRemoveTemplate   = chipRemoveTemplate;
        mdChipsCtrl.chipInputTemplate    = chipInputTemplate;

        mdChipsCtrl.mdCloseIcon = $$mdSvgRegistry.mdClose;

        element
            .attr({ tabindex: -1 })
            .on('focus', function () { mdChipsCtrl.onFocus(); });

        if (attr.ngModel) {
          mdChipsCtrl.configureNgModel(element.controller('ngModel'));

          // If an `md-transform-chip` attribute was set, tell the controller to use the expression
          // before appending chips.
          if (attrs.mdTransformChip) mdChipsCtrl.useTransformChipExpression();

          // If an `md-on-append` attribute was set, tell the controller to use the expression
          // when appending chips.
          //
          // DEPRECATED: Will remove in official 1.0 release
          if (attrs.mdOnAppend) mdChipsCtrl.useOnAppendExpression();

          // If an `md-on-add` attribute was set, tell the controller to use the expression
          // when adding chips.
          if (attrs.mdOnAdd) mdChipsCtrl.useOnAddExpression();

          // If an `md-on-remove` attribute was set, tell the controller to use the expression
          // when removing chips.
          if (attrs.mdOnRemove) mdChipsCtrl.useOnRemoveExpression();

          // If an `md-on-select` attribute was set, tell the controller to use the expression
          // when selecting chips.
          if (attrs.mdOnSelect) mdChipsCtrl.useOnSelectExpression();

          // The md-autocomplete and input elements won't be compiled until after this directive
          // is complete (due to their nested nature). Wait a tick before looking for them to
          // configure the controller.
          if (chipInputTemplate != templates.input) {
            // The autocomplete will not appear until the readonly attribute is not true (i.e.
            // false or undefined), so we have to watch the readonly and then on the next tick
            // after the chip transclusion has run, we can configure the autocomplete and user
            // input.
            scope.$watch('$mdChipsCtrl.readonly', function(readonly) {
              if (!readonly) {

                $mdUtil.nextTick(function(){

                  if (chipInputTemplate.indexOf('<md-autocomplete') === 0) {
                    var autocompleteEl = element.find('md-autocomplete');
                    mdChipsCtrl.configureAutocomplete(autocompleteEl.controller('mdAutocomplete'));
                  }

                  mdChipsCtrl.configureUserInput(element.find('input'));
                });
              }
            });
          }

          // At the next tick, if we find an input, make sure it has the md-input class
          $mdUtil.nextTick(function() {
            var input = element.find('input');

            input && input.toggleClass('md-input', true);
          });
        }

        // Compile with the parent's scope and prepend any static chips to the wrapper.
        if (staticChips.length > 0) {
          var compiledStaticChips = $compile(staticChips.clone())(scope.$parent);
          $timeout(function() { element.find('md-chips-wrap').prepend(compiledStaticChips); });
        }
      };
    }

    function getTemplates() {
      return {
        chips: $mdUtil.processTemplate(MD_CHIPS_TEMPLATE),
        input: $mdUtil.processTemplate(CHIP_INPUT_TEMPLATE),
        default: $mdUtil.processTemplate(CHIP_DEFAULT_TEMPLATE),
        remove: $mdUtil.processTemplate(CHIP_REMOVE_TEMPLATE)
      };
    }
  }
