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
 * Indicates that the associated element should be used as the delete button template for all chips.
 * The associated element must be a child of `md-chips`.
 *
 * The provided button template will be appended to each chip and will remove the associated chip
 * on click.
 *
 * The button is not styled or themed based on the theme set on the `md-chips` component. A theme
 * class and custom icon can be specified in your template.
 *
 * You can also specify the `type` of the button in your template.
 *
 * @usage
 * ### With Standard Chips
 * <hljs lang="html">
 *   <md-chips ...>
 *     <button md-chip-remove class="md-primary" type="button" aria-label="Remove {{$chip}}">
 *       <md-icon md-svg-icon="md-close"></md-icon>
 *     </button>
 *   </md-chips>
 * </hljs>
 *
 * ### With Object Chips
 * <hljs lang="html">
 *   <md-chips ...>
 *     <button md-chip-remove class="md-primary" type="button" aria-label="Remove {{$chip.name}}">
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
      element.attr({ 'tabindex': '-1', 'aria-hidden': 'true' });
      element.find('button').attr('tabindex', '-1');
    });
  }
}
