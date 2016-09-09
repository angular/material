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
 * The `md-subheader` directive creates a sticky subheader for a section.
 *
 * Developers are able to disable the stickiness of the subheader by using the following markup
 *
 * <hljs lang="html">
 *   <md-subheader class="md-no-sticky">Not Sticky</md-subheader>
 * </hljs>
 *
 * ### Notes
 * - The `md-subheader` directive uses the <a ng-href="api/service/$mdSticky">$mdSticky</a> service
 * to make the subheader sticky.
 *
 * > Whenever the current browser doesn't support stickiness natively, the subheader
 * will be compiled twice to create a sticky clone of the subheader.
 *
 * @usage
 * <hljs lang="html">
 * <md-subheader>Online Friends</md-subheader>
 * </hljs>
 */

function MdSubheaderDirective($mdSticky, $mdTheming, $$rAF) {
  return {
    restrict: 'E',
    transclude: true,
    template: '<div ng-transclude></div>',
    link: function postLink(scope, element) {
      $mdTheming(element);
      element.addClass('_md');

      if (!element.hasClass('md-no-sticky')) {
        $$rAF(onElementReady);
      }

      /**
       * Wait for the element to be visible in the DOM.
       * The element may be invisible due to the router or ng-cloak.
       */
      function onElementReady() {
        if (!element[0].offsetParent) {
          $$rAF(onElementReady);
        } else {
          $mdSticky(element);
        }
      }

    }
  };
}
