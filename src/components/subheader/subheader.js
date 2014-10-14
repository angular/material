/**
 * @ngdoc module
 * @name material.components.subheader
 * @description
 * SubHeader module
 */
angular.module('material.components.subheader', [
  'material.components.sticky',
  'material.services.theming'
])
.directive('mdSubheader', [
  '$mdSticky',
  '$compile',
  '$mdTheming',
  MdSubheaderDirective
]);

/**
 * @ngdoc directive
 * @name mdSubheader
 * @module material.components.subheader
 *
 * @restrict E
 *
 * @description
 * The `<md-subheader>` directive is a subheader for a section
 *
 * @usage
 * <hljs lang="html">
 * <md-subheader>Online Friends</md-subheader>
 * </hljs>
 */

function MdSubheaderDirective($mdSticky, $compile, $mdTheming) {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    template: 
      '<h2 class="md-subheader">' +
        '<span class="md-subheader-content"></span>' +
      '</h2>',
    compile: function(element, attr, transclude) {
      var outerHTML = element[0].outerHTML;
      return function postLink(scope, element, attr) {
        $mdTheming(element);
        function getContent(el) {
          return angular.element(el[0].querySelector('.md-subheader-content'));
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
          $mdTheming(stickyClone);
          getContent(stickyClone).append(clone);
          $mdSticky(scope, element, stickyClone);
        });
      };
    }
  };
}
