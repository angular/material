angular
  .module('material.core')
  .factory('$$mdAnimate', function($$rAF, $q, $timeout, $mdConstant){

     // Since $$mdAnimate is injected into $mdUtil... use a wrapper function
     // to subsequently inject $mdUtil as an argument to the AnimateDomUtils

     return function($mdUtil) {
       return AnimateDomUtils( $mdUtil, $$rAF, $q, $timeout, $mdConstant);
     };
   });

/**
 * Factory function that requires special injections
 */
function AnimateDomUtils($mdUtil, $$rAF, $q, $timeout, $mdConstant) {
  var self;
  return self = {
    /**
     *
     */
    translate3d : function( target, from, to, options ) {
      // Set translate3d style to start at the `from` origin
      target.css(from);

      // Wait while CSS takes affect
      // Set the `to` styles and run the transition-in styles
      $$rAF(function () {
        target.css(to).addClass(options.transitionInClass);
      });

      return self
        .waitTransitionEnd(target)
        .then(function(){
            // Resolve with reverser function...
            return reverseTranslate;
        });

      /**
       * Specific reversal of the request translate animation above...
       */
      function reverseTranslate (newFrom) {
        target.removeClass(options.transitionInClass)
              .addClass(options.transitionOutClass)
              .css( newFrom || from );
        return self.waitTransitionEnd(target);
      }
  },

    /**
     * Listen for transitionEnd event (with optional timeout)
     * Announce completion or failure via promise handlers
     */
    waitTransitionEnd: function (element, opts) {
        var TIMEOUT = 10000; // fallback is 10 secs

        return $q(function(resolve, reject){
          opts = opts || { };

          var timer = $timeout(finished, opts.timeout || TIMEOUT);
          element.on($mdConstant.CSS.TRANSITIONEND, finished);

          /**
           * Upon timeout or transitionEnd, reject or resolve (respectively) this promise.
           * NOTE: Make sure this transitionEnd didn't bubble up from a child
           */
          function finished(ev) {
            if ( ev && ev.target !== element[0]) return;

            element.off($mdConstant.CSS.TRANSITIONEND, finished);
            if ( ev  ) $timeout.cancel(timer);

            // Only reject if timeout triggered
            (ev ? resolve : reject)();
          }

        });
      },

    /**
     * Calculate the zoom transform from dialog to origin.
     *
     * We use this to set the dialog position immediately;
     * then the md-transition-in actually translates back to
     * `translate3d(0,0,0) scale(1.0)`...
     *
     * NOTE: all values are rounded to the nearest integer
     */
    calculateZoomToOrigin: function (element, originator) {
      var origin = originator.element;
      var zoomTemplate = "translate3d( {centerX}px, {centerY}px, 0 ) scale( {scaleX}, {scaleY} )";
      var buildZoom = angular.bind(null, $mdUtil.supplant, zoomTemplate);
      var zoomStyle = buildZoom({centerX: 0, centerY: 0, scaleX: 0.5, scaleY: 0.5});

      if (origin) {
        var originBnds = self.clientRect(origin) || self.copyRect(originator.bounds);
        var dialogRect = self.copyRect(element[0].getBoundingClientRect());
        var dialogCenterPt = self.centerPointFor(dialogRect);
        var originCenterPt = self.centerPointFor(originBnds);

        // Build the transform to zoom from the dialog center to the origin center

        zoomStyle = buildZoom({
          centerX: originCenterPt.x - dialogCenterPt.x,
          centerY: originCenterPt.y - dialogCenterPt.y,
          scaleX: Math.min(0.5, originBnds.width / dialogRect.width),
          scaleY: Math.min(0.5, originBnds.height / dialogRect.height)
        });
      }

      return zoomStyle;
    },

    /**
     * Convert the translate CSS value to key/value pair(s).
     */
    toTransformCss: function (transform, addTransition) {
      var css = {};
      angular.forEach($mdConstant.CSS.TRANSFORM.split(' '), function (key) {
        css[key] = transform;
      });

      if (addTransition) css['transition'] = "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) !important";

      return css;
    },

    /**
     *  Clone the Rect and calculate the height/width if needed
     */
    copyRect: function (source, destination) {
      if (!source) return null;

      destination = destination || {};

      angular.forEach('left top right bottom width height'.split(' '), function (key) {
        destination[key] = Math.round(source[key])
      });

      destination.width = destination.width || (destination.right - destination.left);
      destination.height = destination.height || (destination.bottom - destination.top);

      return destination;
    },

    /**
     * Calculate ClientRect of element; return null if hidden or zero size
     */
    clientRect: function (element) {
      var bounds = angular.element(element)[0].getBoundingClientRect();
      var isPositiveSizeClientRect = function (rect) {
        return rect && (rect.width > 0) && (rect.height > 0);
      };

      // If the event origin element has zero size, it has probably been hidden.
      return isPositiveSizeClientRect(bounds) ? self.copyRect(bounds) : null;
    },

    /**
     *  Calculate 'rounded' center point of Rect
     */
    centerPointFor: function (targetRect) {
      return {
        x: Math.round(targetRect.left + (targetRect.width / 2)),
        y: Math.round(targetRect.top + (targetRect.height / 2))
      }
    }

  };
};

