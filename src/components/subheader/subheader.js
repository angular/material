/**
 * @ngdoc module
 * @name material.components.subheader
 * @description
 * SubHeader module
 */
angular.module('material.components.subheader', ['material.components.sticky'])

.directive('materialSubheader', [
  '$materialSticky',
  materialSubheaderDirective
]);

/**
 * @ngdoc directive
 * @name materialSubheader
 * @module material.components.subheader
 *
 * @restrict E
 *
 * @description
 * The `<material-subheader>` directive is a subheader for a section
 *
 * @usage
 * <hljs lang="html">
 * <material-subheader>Online Friends</material-subheader>
 * </hljs>
 */

function materialSubheaderDirective($materialSticky) {
  return {
    restrict: 'E',
    compile: function($el, $attr) {
      if(!$attr.role) {
        $el.attr({
          'role' : Constant.ARIA.ROLE.HEADING
        });
      }
      return function link(scope, el, attrs) {
        $materialSticky(el);
      };
    }
  };
}
