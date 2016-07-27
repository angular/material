angular
    .module('material.components.chips')
    .directive('mdChipRemove', MdChipRemove);

/**
 * @ngdoc directive
 * @name mdChipRemove
 * @restrict A
 * @module material.components.chips
 *
 * @description
 * Designates an element to be used as the delete button for a chip. <br/>
 * This element is passed as a child of the `md-chips` element.
 *
 * The designated button will be just appended to the chip and removes the given chip on click.<br/>
 * By default the button is not being styled by the `md-chips` component.
 *
 * @usage
 * <hljs lang="html">
 *   <md-chips>
 *     <button md-chip-remove="">
 *       <md-icon md-svg-icon="md-close"></md-icon>
 *     </button>
 *   </md-chips>
 * </hljs>
 */


/**
 * MdChipRemove Directive Definition.
 * 
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
