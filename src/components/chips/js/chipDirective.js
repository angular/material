angular
  .module('material.components.chips')
  .directive('mdChip', MdChip);

/**
 * @ngdoc directive
 * @name mdChip
 * @module material.components.chips
 *
 * @description
 * `<md-chip>` is a component used within `<md-chips>` and is responsible for rendering individual
 * chips.
 *
 *
 * @usage
 * <hljs lang="html">
 *   <md-chip>{{$chip}}</md-chip>
 * </hljs>
 *
 */

// This hint text is hidden within a chip but used by screen readers to
// inform the user how they can interact with a chip.
var DELETE_HINT_TEMPLATE = '\
    <span ng-if="!$mdChipsCtrl.readonly" class="md-visually-hidden">\
      {{$mdChipsCtrl.deleteHint}}\
    </span>';

/**
 * MDChip Directive Definition
 *
 * @param $mdTheming
 * @param $mdUtil
 * @ngInject
 */
function MdChip($mdTheming, $mdUtil, $compile, $timeout) {
  var deleteHintTemplate = $mdUtil.processTemplate(DELETE_HINT_TEMPLATE);

  return {
    restrict: 'E',
    require: ['^?mdChips', 'mdChip'],
    link: postLink,
    controller: 'MdChipCtrl'
  };

  function postLink(scope, element, attr, ctrls) {
    var chipsController = ctrls.shift();
    var chipController = ctrls.shift();
    var chipContentElement = angular.element(element[0].querySelector('.md-chip-content'));

    $mdTheming(element);

    if (chipsController) {
      chipController.init(chipsController);

      // Append our delete hint to the div.md-chip-content (which does not exist at compile time)
      chipContentElement.append($compile(deleteHintTemplate)(scope));

      // When a chip is blurred, make sure to unset (or reset) the selected chip so that tabbing
      // through elements works properly
      chipContentElement.on('blur', function() {
        chipsController.resetSelectedChip();
        chipsController.$scope.$applyAsync();
      });
    }

    // Use $timeout to ensure we run AFTER the element has been added to the DOM so we can focus it.
    $timeout(function() {
      if (!chipsController) {
        return;
      }

      if (chipsController.shouldFocusLastChip) {
        chipsController.focusLastChipThenInput();
      }
    });
  }
}
