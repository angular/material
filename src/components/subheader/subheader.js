/**
 * @ngdoc module
 * @name material.components.subheader
 * @description
 * SubHeader module
 */
angular.module('material.components.subheader', [
  'material.components.sticky'
])
.directive('materialSubheader', [
  '$materialSticky',
  '$compile',
  MaterialSubheaderDirective
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

function MaterialSubheaderDirective($materialSticky, $compile) {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    template: '<h2 class="material-subheader"></h2>',
    compile: function(element, attr, transclude) {
      var outerHTML = element[0].outerHTML;
      return function postLink(scope, element, attr) {

        // Transclude the user-given contents of the subheader
        // the conventional way.
        transclude(scope, function(clone) {
          element.append(clone);
        });

        // Create another clone, that uses the outer and inner contents
        // of the element, that will be 'stickied' as the user scrolls.
        transclude(scope, function(clone) {
          var stickyClone = $compile(angular.element(outerHTML))(scope);
          stickyClone.append(clone);
          $materialSticky(scope, element, stickyClone);
        });
      };
    }
  };
}
