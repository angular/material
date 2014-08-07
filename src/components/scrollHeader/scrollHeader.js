/**
 * @ngdoc module
 * @name material.components.scrollHeader
 *
 * @description
 * Scrollable content
 */
angular.module('material.components.scrollHeader', [
  'material.components.content',
  'material.services.registry'
])
  .directive('scrollHeader', [
    '$materialContent', 
    '$timeout', 
    materialScrollHeader 
  ]);

/**
 * @ngdoc directive
 * @name scrollHeader
 * @module material.components.scrollHeader
 * @restrict A
 * @description
 * Scrollable header
 */
function materialScrollHeader($materialContent, $timeout) {

  return {
    restrict: 'A',
    link: function($scope, $element, $attr) {
      var target = $element[0],

        // Full height of the target
        height = target.offsetHeight,

        // Condensed height is set through condensedHeight or defaults to 1/3 the 
        // height of the target
        condensedHeight = $attr.condensedHeight || (height / 3),

        // Calculate the difference between the full height and the condensed height
        margin = height - condensedHeight,

        // Current "y" position of scroll
        y = 0,
      
        // Store the last scroll top position
        prevScrollTop = 0;

      // Perform a simple Y translate
      var translate = function(y) {
        target.style.webkitTransform = target.style.transform = 'translate3d(0, ' + y + 'px, 0)';
      }


      // Transform the header as we scroll
      var transform = function(y) {
        translate(-y);
      }

      // Shrink the given target element based on the scrolling
      // of the scroller element.
      var shrink = function(scroller) {
        var scrollTop = scroller.scrollTop;

        y = Math.min(height, Math.max(0, y + scrollTop - prevScrollTop));

        // If we are scrolling back "up", show the header condensed again
        if (prevScrollTop > scrollTop && scrollTop > margin) {
          y = Math.max(y, margin);
        }

        window.requestAnimationFrame(transform.bind(this, y));
      };

      // Wait for next digest to ensure content has loaded
      $timeout(function() {
        var element = $materialContent('content').getElement();

        element.on('scroll', function(e) {
          shrink(e.target);

          prevScrollTop = e.target.scrollTop;
        });
      });
    }
  };
}
