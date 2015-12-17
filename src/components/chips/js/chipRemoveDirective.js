angular
    .module('material.components.chips')
    .directive('mdChipRemove', MdChipRemove);

/**
 * @ngdoc directive
 * @name mdChipRemove
 * @module material.components.chips
 *
 * @description
 * `<md-chip-remove>`
 * Designates an element to be used as the delete button for a chip. This
 * element is passed as a child of the `md-chips` element.
 *
 * @usage
 * <hljs lang="html">
 *   <md-chips><button md-chip-remove>DEL</button></md-chips>
 * </hljs>
 */


/**
 * MdChipRemove Directive Definition.
 * 
 * @param $compile
 * @param $timeout
 * @returns {{restrict: string, require: string[], link: Function, scope: boolean}}
 * @constructor
 */
function MdChipRemove ($timeout) {
  return {
    restrict: 'A',
    require: '^mdChips',
    scope: false,
    link: postLink
  };

  function postLink(scope, element, attr, ctrl) {
    element.on('click', function(event) {
      scope.$apply(function() {
        ctrl.removeChip(scope.$$replacedScope.$index);
      });
    });

    // Child elements aren't available until after a $timeout tick as they are hidden by an
    // `ng-if`. see http://goo.gl/zIWfuw
    $timeout(function() {
      element.attr({ tabindex: -1, 'aria-hidden': true });
      element.find('button').attr('tabindex', '-1');
    });
  }
}
