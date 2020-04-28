angular
  .module('material.components.chips')
  .directive('mdChip', MdChip);

/**
 * @ngdoc directive
 * @name mdChip
 * @module material.components.chips
 *
 * @description
 * `<md-chip>` is a component used within `<md-chips>`. It is responsible for rendering an
 * individual chip.
 *
 *
 * @usage
 * <hljs lang="html">
 *   <md-chips>
 *     <md-chip>{{$chip}}</md-chip>
 *   </md-chips>
 * </hljs>
 *
 */

/**
 * MDChip Directive Definition
 *
 * @param $mdTheming
 * @param $mdUtil
 * @param $compile
 * @param $timeout
 * @ngInject
 */
function MdChip($mdTheming, $mdUtil, $compile, $timeout) {
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
