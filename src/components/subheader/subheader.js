/**
 * @ngdoc module
 * @name material.components.subheader
 * @description
 * SubHeader module
 *
 *  Subheaders are special list tiles that delineate distinct sections of a
 *  list or grid list and are typically related to the current filtering or
 *  sorting criteria. Subheader tiles are either displayed inline with tiles or
 *  can be associated with content, for example, in an adjacent column.
 *
 *  Upon scrolling, subheaders remain pinned to the top of the screen and remain
 *  pinned until pushed on or off screen by the next subheader. @see [Material
 *  Design Specifications](https://www.google.com/design/spec/components/subheaders.html)
 *
 *  > To improve the visual grouping of content, use the system color for your subheaders.
 *
 */
angular.module('material.components.subheader', [
  'material.core',
  'material.components.sticky'
])
  .directive('mdSubheader', MdSubheaderDirective);

/**
 * @ngdoc directive
 * @name mdSubheader
 * @module material.components.subheader
 *
 * @restrict E
 *
 * @description
 * The `<md-subheader>` directive is a subheader for a section. By default it is sticky.
 * You can make it not sticky by applying the `md-no-sticky` class to the subheader.
 *
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
        '<div class="md-subheader-inner">' +
          '<span class="md-subheader-content"></span>' +
        '</div>' +
      '</h2>',
    compile: function(element, attr, transclude) {
      return function postLink(scope, element, attr) {
        $mdTheming(element);
        var outerHTML = element[0].outerHTML;

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
        if (!element.hasClass('md-no-sticky')) {
          transclude(scope, function(clone) {
            var stickyClone = $compile(angular.element(outerHTML))(scope);
            getContent(stickyClone).append(clone);
            $mdSticky(scope, element, stickyClone);
          });
        }
      };
    }
  };
}
