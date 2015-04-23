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
 * <strong>Custom `<md-chip-template>` template</strong>
 * A custom template may be provided to render the content of each chip. This is achieved by
 * specifying an `<md-chip-template>` element as a child of `<md-chips>`. Note: Any attributes on
 * `<md-chip-template>` will be dropped as only the innerHTML is used for the chip template. The
 * variables `$chip` and `$index` are available in the scope of `<md-chip-template>`, representing
 * the chip object and its index in the list of chips, respectively.
 * To override the chip delete control, include an element (ideally a button) with the attribute
 * `md-chip-remove`. A click listener to remove the chip will be added automatically. The element
 * is also placed as a sibling to the chip content (on which there are also click listeners) to
 * avoid a nested ng-click situation.
 *
 * <h3> Pending Features </h3>
 * <ul style="padding-left:20px;">
 *
 *   <ul>Style
 *     <li>Colours for hover, press states (ripple?).</li>
 *   </ul>
 *
 *   <ul>List Manipulation
 *     <li>delete item via DEL or backspace keys when selected</li>
 *   </ul>
 *
 *   <ul>Validation
 *     <li>de-dupe values (or support duplicates, but fix the ng-repeat duplicate key issue)</li>
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
 *  <span style="font-size:.8em;text-align:center">
 *    Warning: This component is a WORK IN PROGRESS. If you use it now,
 *    it will probably break on you in the future.
 *  </span>
 *
 * @param {string=|object=} ng-model A model to bind the list of items to
 * @param {string=} placeholder Placeholder text that will be forwarded to the input.
 * @param {string=} secondary-placeholder Placeholder text that will be forwarded to the input,
 *    displayed when there is at least on item in the list
 * @param {boolean=} readonly Disables list manipulation (deleting or adding list items), hiding
 *    the input and delete buttons
 * @param {expression} md-on-append An expression expected to convert the input string into an
 *    object when adding a chip.
 * @param {string=} delete-hint A string read by screen readers instructing users that pressing
 *    the delete key will remove the chip.
 * @param {string=} delete-button-label A label for the delete button. Also hidden and read by
 *    screen readers.
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
 */


var MD_CHIPS_TEMPLATE = '\
    <md-chips-wrap\
        ng-if="!$mdChipsCtrl.readonly || $mdChipsCtrl.items.length > 0"\
        ng-keydown="$mdChipsCtrl.chipKeydown($event)"\
        ng-class="{ \'md-focused\': $mdChipsCtrl.hasFocus() }"\
        class="md-chips">\
      <md-chip ng-repeat="$chip in $mdChipsCtrl.items"\
          index="{{$index}}"\
          ng-class="{\'md-focused\': $mdChipsCtrl.selectedChip == $index}">\
        <div class="md-chip-content"\
            tabindex="-1"\
            aria-hidden="true"\
            ng-focus="!$mdChipsCtrl.readonly && $mdChipsCtrl.selectChip($index)"\
            md-chip-transclude="$mdChipsCtrl.chipContentsTemplate"></div>\
        <div class="md-chip-remove-container"\
            md-chip-transclude="$mdChipsCtrl.chipRemoveTemplate"></div>\
      </md-chip>\
      <div ng-if="!$mdChipsCtrl.readonly && $mdChipsCtrl.ngModelCtrl"\
          class="md-chip-input-container"\
          md-chip-transclude="$mdChipsCtrl.chipInputTemplate"></div>\
      </div>\
    </md-chips-wrap>';

var CHIP_INPUT_TEMPLATE = '\
      <input\
          tabindex="0"\
          placeholder="{{$mdChipsCtrl.getPlaceholder()}}"\
          aria-label="{{$mdChipsCtrl.getPlaceholder()}}"\
          ng-model="$mdChipsCtrl.chipBuffer"\
          ng-focus="$mdChipsCtrl.onInputFocus()"\
          ng-blur="$mdChipsCtrl.onInputBlur()"\
          ng-keydown="$mdChipsCtrl.inputKeydown($event)">';

var CHIP_DEFAULT_TEMPLATE = '\
    <span>{{$chip}}</span>';

var CHIP_REMOVE_TEMPLATE = '\
    <button\
        class="md-chip-remove"\
        ng-if="!$mdChipsCtrl.readonly"\
        ng-click="$mdChipsCtrl.removeChipAndFocusInput($$replacedScope.$index)"\
        aria-hidden="true"\
        tabindex="-1">\
      <md-icon md-svg-icon="close"></md-icon>\
      <span class="md-visually-hidden">\
        {{$mdChipsCtrl.deleteButtonLabel}}\
      </span>\
    </button>';

/**
 * MDChips Directive Definition
 */
function MdChips ($mdTheming, $mdUtil, $compile, $timeout) {
  return {
    template: function(element, attrs) {
      // Clone the element into an attribute. By prepending the attribute
      // name with '$', Angular won't write it into the DOM. The cloned
      // element propagates to the link function via the attrs argument,
      // where various contained-elements can be consumed.
      attrs['$mdUserTemplate'] = element.clone();
      return MD_CHIPS_TEMPLATE;
    },
    require: ['mdChips'],
    restrict: 'E',
    controller: 'MdChipsCtrl',
    controllerAs: '$mdChipsCtrl',
    bindToController: true,
    compile: compile,
    scope: {
      readonly: '=readonly',
      placeholder: '@',
      secondaryPlaceholder: '@',
      mdOnAppend: '&',
      deleteHint: '@',
      deleteButtonLabel: '@',
      requireMatch: '=?mdRequireMatch'
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

    // Set the chip remove, chip contents and chip input templates. The link function will put
    // them on the scope for transclusion later.
    var chipRemoveTemplate   = getTemplateByQuery('[md-chip-remove]') || CHIP_REMOVE_TEMPLATE,
        chipContentsTemplate = getTemplateByQuery('md-chip-template') || CHIP_DEFAULT_TEMPLATE,
        chipInputTemplate    = getTemplateByQuery('md-autocomplete')
            || getTemplateByQuery('input')
            || CHIP_INPUT_TEMPLATE,
        staticChips = userTemplate.find('md-chip');

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
      mdChipsCtrl.chipContentsTemplate = chipContentsTemplate;
      mdChipsCtrl.chipRemoveTemplate   = chipRemoveTemplate;
      mdChipsCtrl.chipInputTemplate    = chipInputTemplate;

      element
          .attr({ ariaHidden: true, tabindex: -1 })
          .on('focus', function () { mdChipsCtrl.onFocus(); });

      if (attr.ngModel) {
        mdChipsCtrl.configureNgModel(element.controller('ngModel'));

        // If an `md-on-append` attribute was set, tell the controller to use the expression
        // when appending chips.
        if (attrs.mdOnAppend) mdChipsCtrl.useMdOnAppendExpression();

        // The md-autocomplete and input elements won't be compiled until after this directive
        // is complete (due to their nested nature). Wait a tick before looking for them to
        // configure the controller.
        if (chipInputTemplate != CHIP_INPUT_TEMPLATE) {
          $timeout(function() {
            if (chipInputTemplate.indexOf('<md-autocomplete') === 0)
              mdChipsCtrl
                  .configureAutocomplete(element.find('md-autocomplete')
                      .controller('mdAutocomplete'));
            mdChipsCtrl.configureUserInput(element.find('input'));
          });
        }
      }

      // Compile with the parent's scope and prepend any static chips to the wrapper.
      if (staticChips.length > 0) {
        var compiledStaticChips = $compile(staticChips)(scope.$parent);
        $timeout(function() { element.find('md-chips-wrap').prepend(compiledStaticChips); });
      }
    };
  }
}
