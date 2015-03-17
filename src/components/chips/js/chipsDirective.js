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
   * `<md-chips>` 
   *
   */

  function MdChips ($compile) {
    return {
      template: function(element, attrs) {
        var userTemplate = element.clone();
        attrs['$mdUserTemplate'] = userTemplate;
        return '\
          <md-chips-wrap ng-class="{readonly : $mdChipsCtrl.readonly}">\
          <ul role="presentation">\
            <li ng-repeat="(index, $chip) in $mdChipsCtrl.items"\
                class="md-chip-list-item">\
            </li>\
            <li ng-if="!$mdChipsCtrl.readonly" class="md-chip-worker"></li>\
          </ul>\
          </md-chips-wrap>';
      },
      require: ['ngModel', 'mdChips'],
      controller:   'MdChipsCtrl',
      controllerAs: '$mdChipsCtrl',
      bindToController: true,
      compile: compile,
      scope: {
        readonly: '=readonly'
      }
    };
    function compile(element, attr) {
      var userTemplate = attr['$mdUserTemplate'];
      var chipEl = userTemplate.find('md-chip');
      if (chipEl.length == 0) {
        chipEl = angular.element('\
            <md-chip>\
              <span>{{$chip}}</span>\
              <button ng-if="!$mdChipsCtrl.readonly"\
                  md-chip-remove>x</button>\
            </md-chip>');
      } else {
        // Warn if no remove button is included in the template.
        if (!chipEl[0].querySelector('[md-chip-remove]')) {
        }
      }
      var listNode = angular.element(element[0].querySelector('li.md-chip-list-item'));
      listNode.append(chipEl);

      // Input Element: Look for an autocomplete or an input.
      var inputEl = userTemplate.find('md-autocomplete');
      var hasAutocomplete = inputEl.length > 0;

      if (!hasAutocomplete) {
        // Default element.
        inputEl = angular.element('\
            <input type="text" \
                ng-model="$mdChipsCtrl.itemBuffer"\
                ng-keydown="$mdChipsCtrl.workerInputKeydown($event)">');
      }

      var workerChip = angular.element(element[0].querySelector('li.md-chip-worker'));
      workerChip.append(inputEl);

      return function postLink(scope, element, attrs, controllers) {
        var ngModelCtrl = controllers[0];
        var mdChipsCtrl = controllers[1];
        mdChipsCtrl.configureNgModel(ngModelCtrl);

        if (hasAutocomplete) {
          // Tell the mdChipsCtrl about the mdAutocompleteCtrl and have it
          // watch the selectedItem model.
        }
      };
    };
  }
})();
