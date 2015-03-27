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
   * `<md-chips>` is an input component for building lists of strings or objects. The list items are displayed as
   * 'chips'. This component can make use of an <input> element or an <md-autocomplete> element.
   *
   * NOTE(typotter): This component is a WORK IN PROGRESS. If you use it now, it will probably break on you in the
   * future.
   *
   * TODO(typotter):
   * Expand input controls:
   *   Support md-autocomplete
   *   plain <input> tag as child
   *   textarea input
   *   md-input??
   * List Manipulation
   *   delete item via DEL or backspace keys when selected
   * Validation
   *   de-dupe values (or support duplicates, but fix the ng-repeat duplicate key issue)
   *   allow a validation callback
   *   hilighting style for invalid chips
   * Item mutation
   *   Support <md-chip-edit> template, show/hide the edit element on tap/click? double tap/double click?
   * Truncation and Disambiguation (?)
   *   Truncate chip text where possible, but do not truncate entries such that two are indistinguishable.
   * Drag and Drop (?)
   *   Drag and drop chips between related <md-chips> elements.
   *
   *
   * @param {string=|object=} ng-model A model to bind the list of items to
   * @param {string=} placeholder Placeholder text that will be forwarded to the input.
   * @param {string=} secondary-placeholder Placeholder text that will be forwarded to the input, displayed when there
   *    is at least on item in the list
   * @param {boolean=} readonly Disables list manipulation (deleting or adding list items), hiding the input and delete
   *    buttons
   * @param {expression} md-chip-append An expression expected to convert the input string into an object when adding
   *    a chip.
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
      <md-chips-wrap ng-class="{readonly : $mdChipsCtrl.readonly}" class="md-chips">\
        <div role="presentation">\
          <div ng-repeat="$chip in $mdChipsCtrl.items"\
              ng-class="{selected: $mdChipsCtrl.selectedChip == $index}"\
              ng-click="!$mdChipsCtrl.readonly && $mdChipsCtrl.selectChip($index)"\
              class="md-chip">\
          </div>\
          <div ng-if="!$mdChipsCtrl.readonly" class="md-chip-worker"></div>\
        </div>\
      </md-chips-wrap>';

  var CHIP_INPUT_TEMPLATE = '\
        <input\
            placeholder="{{$mdChipsCtrl.items.length == 0 ? $mdChipsCtrl.placeholder : $mdChipsCtrl.secondaryPlaceholder}}"\
            class="md-chip-input"\
            ng-model="$mdChipsCtrl.chipBuffer"\
            ng-focus="$mdChipsCtrl.resetSelectedChip()"\
            ng-keydown="$mdChipsCtrl.defaultInputKeydown($event)">';

  var CHIP_DEFAULT_TEMPLATE = '\
      <md-chip>\
        <span>{{$chip}}</span>\
        <md-button ng-if="!$mdChipsCtrl.readonly"\
            md-chip-remove>x</md-button>\
      </md-chip>';


  /**
   * MDChips Directive Definition
   * @param $mdTheming
   * @param $log
   * @ngInject
   */
  function MdChips ($mdTheming, $log) {
    return {
      template: function(element, attrs) {
        // Clone the element into an attribute. By prepending the attribute
        // name with '$', Angular won't write it into the DOM. The cloned
        // element propagates to the link function via the attrs argument,
        // where various contained-elements can be consumed.
        attrs['$mdUserTemplate'] = element.clone();
        return MD_CHIPS_TEMPLATE;
      },
      require: ['ngModel', 'mdChips'],
      restrict: 'E',
      controller:   'MdChipsCtrl',
      controllerAs: '$mdChipsCtrl',
      bindToController: true,
      compile: compile,
      scope: {
        readonly:             '=readonly',
        placeholder:          '@',
        secondaryPlaceholder: '@',
        mdChipAppend:         '&'
      }
    };
    function compile(element, attr) {
      var userTemplate = attr['$mdUserTemplate'];
      var chipEl = userTemplate.find('md-chip');
      if (chipEl.length === 0) {
        chipEl = angular.element(CHIP_DEFAULT_TEMPLATE);
      } else {
        // Warn if no remove button is included in the template.
        if (!chipEl[0].querySelector('[md-chip-remove]')) {
          $log.warn('md-chip-remove attribute not found in md-chip template.');
        }
      }
      var listNode = angular.element(element[0].querySelector('.md-chip'));
      listNode.append(chipEl);

      // Input Element: Look for an autocomplete or an input.
      var inputEl = userTemplate.find('md-autocomplete');
      var hasAutocomplete = inputEl.length > 0;

      if (!hasAutocomplete) {
        // TODO(typotter): Check for an input or a textarea

        // Default element.
        inputEl = angular.element(CHIP_INPUT_TEMPLATE);
        var workerChip = angular.element(element[0].querySelector('.md-chip-worker'));
        workerChip.append(inputEl);
      }

      return function postLink(scope, element, attrs, controllers) {
        $mdTheming(element);
        var ngModelCtrl = controllers[0];
        var mdChipsCtrl = controllers[1];
        mdChipsCtrl.configureNgModel(ngModelCtrl);

        if (attrs.mdChipAppend) {
          mdChipsCtrl.useMdChipAppendExpression();
        }

        if (hasAutocomplete) {
          // TODO(typotter): Tell the mdChipsCtrl about the mdAutocompleteCtrl and have it
          // watch the selectedItem model.
          $log.error('md-autocomplete not yet supported');
        }
      };
    }
  }
})();
