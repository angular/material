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
 * @param $mdInkRipple
 * @ngInject
 */
function MdChip($mdTheming, $mdUtil) {
  var hintTemplate = $mdUtil.processTemplate(DELETE_HINT_TEMPLATE);

  return {
    restrict: 'E',
    require: '^?mdChips',
    compile:  compile
  };

  function compile(element, attr) {
    // Append the delete template
    element.append($mdUtil.processTemplate(hintTemplate));

    return function postLink(scope, element, attr, ctrl) {
      element.addClass('md-chip');
      $mdTheming(element);

      if (ctrl) angular.element(element[0].querySelector('.md-chip-content'))
          .on('blur', function () {
            ctrl.selectedChip = -1;
          });
    };
  }
}
