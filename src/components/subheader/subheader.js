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
angular
  .module('material.components.subheader', [
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

function MdSubheaderDirective($mdSticky, $compile, $mdTheming, $mdUtil) {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    template: (
    '<div class="md-subheader _md">' +
    '  <div class="md-subheader-inner">' +
    '    <div class="md-subheader-content"></div>' +
    '  </div>' +
    '</div>'
    ),
    link: function postLink(scope, element, attr, controllers, transclude) {
      $mdTheming(element);
      element.addClass('_md');
      
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
          // If the user adds an ng-if or ng-repeat directly to the md-subheader element, the
          // compiled clone below will only be a comment tag (since they replace their elements with
          // a comment) which cannot be properly passed to the $mdSticky; so we wrap it in our own
          // DIV to ensure we have something $mdSticky can use
          var wrapper = $compile('<div class="md-subheader-wrapper">' + outerHTML + '</div>')(scope);

          // Delay initialization until after any `ng-if`/`ng-repeat`/etc has finished before
          // attempting to create the clone
          $mdUtil.nextTick(function() {
            // Append our transcluded clone into the wrapper.
            // We don't have to recompile the element again, because the clone is already
            // compiled in it's transclusion scope. If we recompile the outerHTML of the new clone, we would lose
            // our ngIf's and other previous registered bindings / properties.
            getContent(wrapper).append(clone);
          });

          // Make the element sticky and provide the stickyClone our self, to avoid recompilation of the subheader
          // element.
          $mdSticky(scope, element, wrapper);
        });
      }
    }
  }
}
