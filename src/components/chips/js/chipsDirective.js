(function () {
  'use strict';
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
          ng-if="!$mdChipsCtrl.readonly || $mdChipsCtrl.items.length > 0" class="md-chips">\
        <md-chip ng-repeat="$chip in $mdChipsCtrl.items"\
            index="{{$index}}"\
            ng-class="{selected: $mdChipsCtrl.selectedChip == $index}">\
          <div class="md-chip-content"\
              ng-click="!$mdChipsCtrl.readonly && $mdChipsCtrl.selectChip($index)"\
              ng-keydown="$mdChipsCtrl.chipKeydown($index, $event)"></div>\
        </md-chip>\
        <div\
            ng-if="!$mdChipsCtrl.readonly && $mdChipsCtrl.ngModelCtrl" \
            class="md-chip-input-container"></div>\
      </md-chips-wrap>';

  var CHIP_INPUT_TEMPLATE = '\
        <input\
            placeholder="{{$mdChipsCtrl.getPlaceholder()}}"\
            aria-label="{{$mdChipsCtrl.getPlaceholder()}}"\
            ng-model="$mdChipsCtrl.chipBuffer"\
            ng-focus="$mdChipsCtrl.resetSelectedChip()"\
            ng-keydown="$mdChipsCtrl.inputKeydown($event)">';

  var CHIP_DEFAULT_TEMPLATE = '\
      <span>{{$chip}}</span>';

  var CHIP_REMOVE_TEMPLATE = '\
      <md-button \
          class="md-chip-remove"\
          ng-if="!$mdChipsCtrl.readonly"\
          ng-click="$mdChipsCtrl.removeChip($index)"\
          tabindex="-1">\
        <md-icon md-svg-icon="close"></md-icon>\
        <span class="md-visually-hidden">\
          {{$mdChipsCtrl.deleteButtonLabel}}\
        </span>\
      </md-button>';

  //ng-blur="$mdChipsCtrl.resetSelectedChip()"\

  /**
   * MDChips Directive Definition
   *
   * @param $mdTheming
   * @param $log
   * @param $compile
   * @param $timeout
   * @returns {*}
   * @ngInject
   */
  function MdChips ($mdTheming, $log, $compile, $timeout) {
    return {
      template: function(element, attrs) {
        // Clone the element into an attribute. By prepending the attribute
        // name with '$', Angular won't write it into the DOM. The cloned
        // element propagates to the link function via the attrs argument,
        // where various contained-elements can be consumed.
        attrs['$mdUserTemplate'] = element.clone();
        attrs['tabindex'] = '-1';


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
        deleteButtonLabel: '@'
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


      // Variables needed in `post-link`'s closure:
      var hasNgModel = !!attr['ngModel'],
          transcludeInputElement = null,
          hasAutocomplete = false,
          staticChips = userTemplate.find('md-chip');

      if (hasNgModel) {
        // Extract a chip template or use the default.
        var chipHtml,
            chipTemplate = userTemplate.find('md-chip-template'),
            chipRemoveHtml = CHIP_REMOVE_TEMPLATE;

        if (chipTemplate.length === 0) {
          chipHtml = CHIP_DEFAULT_TEMPLATE;
        } else {
          // If there is a user-provided md-chip-remove, pluck it out and us it instead of the
          // default.
          var chipRemoveEl = angular.element(chipTemplate[0].querySelector('[md-chip-remove]'));
          if (chipRemoveEl.length > 0) {
            chipRemoveHtml = chipRemoveEl[0].outerHTML;
            chipHtml = chipTemplate[0].innerHTML.replace(chipRemoveHtml, '');
          } else {
            chipHtml = chipTemplate[0].innerHTML;
          }
        }

        var chipContentNode = angular.element(element[0].querySelector('.md-chip-content'));
        chipContentNode.append(chipHtml);

        var chipNode = element.find('md-chip');
        chipNode.append(chipRemoveHtml);


        // Input Element: Look for an autocomplete or an input.
        var userInput = userTemplate.find('md-autocomplete');
        if (userInput.length > 0) {
          hasAutocomplete = true;
          transcludeInputElement = userInput[0];
        } else {
          // Look for a plain input.
          userInput = userTemplate.find('input');

          if (userInput.length > 0) {
            transcludeInputElement = userInput[0];
          } else {
            // No user provided input.
            // Default element can be appended now as it is compiled with mdChips' scope.
            getInputContainer(element).append(angular.element(CHIP_INPUT_TEMPLATE));
          }
        }
      }


      /**
       * Configures controller and transcludes elements if necessary.
       */
      return function postLink(scope, element, attrs, controllers) {
        $mdTheming(element);
        element.attr('tabindex', '-1');

        if (hasNgModel) {
          var mdChipsCtrl = controllers[0];
          var ngModelCtrl = element.controller('ngModel');

          mdChipsCtrl.configureNgModel(ngModelCtrl);

          // If an `md-on-append` attribute was set, tell the controller to use the expression
          // when appending chips.
          if (attrs['mdOnAppend']) {
            mdChipsCtrl.useMdOnAppendExpression();
          }

          // Transclude the input element with the parent scope if it exists into the input
          // container.
          if (transcludeInputElement) {
            var transcludedElement = $compile(transcludeInputElement)(scope.$parent);

            if (hasAutocomplete) {
              var mdAutocompleteCtrl = transcludedElement.controller('mdAutocomplete');
              mdChipsCtrl.configureMdAutocomplete(mdAutocompleteCtrl);
            } else {
              mdChipsCtrl.configureUserInput(angular.element(transcludeInputElement));
            }

            // The `ng-if` directive removes the children from the DOM for the rest of this tick, so
            // do the append the element via a timeout. see http://goo.gl/zIWfuw
            $timeout(function() {
              var inputContainer = getInputContainer(element);
              inputContainer.append(transcludedElement);
            });

          }
        }

        // Compile with the parent's scope and prepend any static chips to the wrapper.
        if (staticChips.length > 0) {
          var compiledStaticChips = $compile(staticChips)(scope.$parent);
          $timeout(function() {
            element.find('md-chips-wrap').prepend(compiledStaticChips);
          });
        }
      };
    }
    function getInputContainer(el) {
      return angular.element(el[0].querySelector('.md-chip-input-container'));
    }
  }
})();
