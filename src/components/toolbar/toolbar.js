/**
 * @ngdoc module
 * @name material.components.toolbar
 */
angular.module('material.components.toolbar', [
  'material.components.content',
  'material.animations'
])
  .directive('materialToolbar', [
    '$$rAF',
    '$materialEffects',
    materialToolbarDirective
  ]);

/**
 * @ngdoc directive
 * @name materialToolbar
 * @restrict E
 * @description
 * `material-toolbar` is used to place a toolbar in your app.
 *
 * Toolbars are usually used above a content area to display the title of the
 * current page, and show relevant action buttons for that page.
 *
 * You can change the height of the toolbar by adding either the
 * `material-medium-tall` or `material-tall` class to the toolbar.
 *
 * @usage
 * <hljs lang="html">
 * <div layout="vertical" layout-fill>
 *   <material-toolbar>
 *
 *     <div class="material-toolbar-tools">
 *       <span>My App's Title</span>
 *
 *       <!-- fill up the space between left and right area -->
 *       <span flex></span>
 *
 *       <material-button>
 *         Right Bar Button
 *       </material-button>
 *     </div>
 *
 *   </material-toolbar>
 *   <material-content>
 *     Hello!
 *   </material-content>
 * </div>
 * </hljs>
 *
 * @param {boolean=} scrollShrink Whether the header should shrink away as 
 * the user scrolls down, and reveal itself as the user scrolls up. 
 *
 * Note: for scrollShrink to work, the toolbar must be a sibling of a 
 * `material-content` element, placed before it. See the scroll shrink demo.
 */ 
function materialToolbarDirective($$rAF, $materialEffects) {

  return {
    restrict: 'E',
    controller: angular.noop,
    link: function(scope, element, attr) {

      if (angular.isDefined(attr.scrollShrink)) {
        setupScrollShrink();
      }

      function setupScrollShrink() {
        //makes it take X times as long for header to dissapear
        var HEIGHT_FACTOR = 2; 
        var height = element.prop("offsetHeight") * HEIGHT_FACTOR;
        // Current "y" position of scroll
        var y = 0;
        // Store the last scroll top position
        var prevScrollTop = 0;

        // Wait for $materialContentLoaded event from materialContent directive.
        // If the materialContent element is a sibling of our toolbar, hook it up
        // to scroll events.
        scope.$on('$materialContentLoaded', onMaterialContentLoad);

        var contentElement;
        function onMaterialContentLoad($event, contentEl) {

          if (Util.elementIsSibling(element, contentEl)) {
            // unhook old content event listener if exists
            contentElement && contentElement.off('scroll', onScroll);
            contentEl.on('scroll', onContentScroll).css('position','relative');
            contentElement = contentEl;
          }

        }

        function onContentScroll(e) {
          shrink(e.target.scrollTop);
          prevScrollTop = e.target.scrollTop;
        }

        // Shrink the given target element based on the scrolling
        // of the scroller element.
        function shrink(scrollTop) {
          y = Math.min(height, Math.max(0, y + scrollTop - prevScrollTop));
          // If we are scrolling back "up", show the header condensed again
          // if (prevScrollTop > scrollTop && scrollTop > margin) {
          //   y = Math.max(y, margin);
          // }
          $$rAF(transform);
        }

        function transform() {
          var translate = y ?
            'translate3d(0,' + (-y / HEIGHT_FACTOR) + 'px, 0)' : 
            '';
          element.css($materialEffects.TRANSFORM_PROPERTY, translate);
          contentElement.css('margin-top', y ?
                             (-y / HEIGHT_FACTOR) + 'px' :
                            '');
        }
      }

    }
  };

}
