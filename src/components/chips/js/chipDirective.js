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
    <span ng-if="!$mdChipsCtrl.readonly" class="_md-visually-hidden">\
      {{$mdChipsCtrl.deleteHint}}\
    </span>';

/**
 * MDChip Directive Definition
 *
 * @param $mdTheming
 * @param $mdUtil
 * @ngInject
 */
function MdChip($mdTheming, $mdUtil) {
  var hintTemplate = $mdUtil.processTemplate(DELETE_HINT_TEMPLATE);

  return {
    restrict: 'E',
    require: ['^?mdChips', 'mdChip'],
    compile:  compile,
    controller: 'MdChipCtrl'
  };

  function compile(element, attr) {
    // Append the delete template
    element.append($mdUtil.processTemplate(hintTemplate));

    return function postLink(scope, element, attr, ctrls) {
      var chipsController = ctrls.shift();
      var chipController  = ctrls.shift();
      $mdTheming(element);

      if (chipsController) {
        chipController.init(chipsController);

        angular.element(element[0].querySelector('._md-chip-content'))
            .on('blur', function () {
              chipsController.selectedChip = -1;
              chipsController.$scope.$applyAsync();
            });
      }
    };
  }
}
