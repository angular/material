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
    template: 
      '<h2 class="material-subheader">' +
        '<span class="material-subheader-content"></span>' +
      '</h2>',
    compile: function(element, attr, transclude) {
      var outerHTML = element[0].outerHTML;
      return function postLink(scope, element, attr) {
        function getContent(el) {
          return angular.element(el[0].querySelector('.material-subheader-content'));
        }

        // Transclude the user-given contents of the subheader
        // the conventional way.
        transclude(scope, function(clone) {
          getContent(element).append(clone);
        });

        // Create another clone, that uses the outer and inner contents
        // of the element, that will be 'stickied' as the user scrolls.
        transclude(scope, function(clone) {
          var stickyClone = $compile(angular.element(outerHTML))(scope);
          getContent(stickyClone).append(clone);
          $materialSticky(scope, element, stickyClone);
        });
      };
    }
  };
}
