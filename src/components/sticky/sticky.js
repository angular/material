/**
 * @ngdoc module
 * @name material.components.sticky
 * @description
 *
 * Sticky effects for material
 */

angular.module('material.components.sticky', [])
.factory('$materialSticky', ['$window', '$document', '$$rAF', MaterialSticky]);
/**
 * @ngdoc factory
 * @name $materialSticky
 * @module material.components.sticky
 *
 * @description
 * The `$materialSticky`service provides a mixin to make elements sticky.
 *
 * @returns A `$materialSticky` function that takes `$el` as an argument.
 */

function MaterialSticky($window, $document, $$rAF) {
  var elements = [],
      orderedElements, // Sorted elements by scroll position
      targetElementIndex;


  $document.on('scroll', Util.debounce(startScroll, 200, true));
  $document.on('scroll',  checkElements);

  return registerStickyElement;

  /* *
   * Function to prepare our lookups so we can go quick!
   * */
  function startScroll() {
    targetElementIndex = 0;
    // Sort based on position in the window, and assign an active index
    orderedElements = elements.sort(function(a, b) {
      return top(a) - top(b);
    });

    // Iterate over our sorted elements and find the one that is active
    (function findTargetElement() {
      var windowTop = $window.scrollY;
      for(var i = 0; i < orderedElements.length ; ++i) {
        if(bottom(orderedElements[i]) > 0) {
          targetElementIndex = i > 0 ? i - 1 : i;
        }
      }
    })();
  }

  var reverseAt = 0;
  function checkElements() {
    var targetRect = rect(targetElement().children(0));
    if(targetRect.top <= 0) {
      reverseAt = targetRect.top;
      targetElement().children(0).attr('material-sticky-active', true);
      targetElement().css({height: targetRect.height});
    }
    if($window.scrollY < reverseAt) {
      targetElement().children(0).attr('material-sticky-active', false);
      targetElement().css({height: null});
    }

    // check if we need to push
    var next = targetElement(+1);
    if(next) {
      var nextRect = rect(next);
      if(rectsAreTouching(targetRect, nextRect)) {
        $$rAF(function() {
          var offsetAmount = targetRect.bottom - nextRect.top;
          var currentTop = targetElement().children(0).css('top');
          if(currentTop == 'auto') { currentTop = 0; } 
          var newTop = currentTop - offsetAmount;
          console.log("ssetting top to %d", newTop);
          targetElement().children(0).css({top: currentTop - offsetAmount});
        });
      }
    }
  }

   // Convenience getter for the target element
   function targetElement(indexModifier) {
     indexModifier = indexModifier || 0;
     if(targetElementIndex === undefined) return undefined;
     return orderedElements[targetElementIndex + indexModifier];
   }

   function rectsAreTouching(first, second) {
      return first.bottom >= second.top;
   }

  // Helper functions to get position of element

  function rect($el) {
    return $el.hasOwnProperty(0) ? $el[0].getBoundingClientRect() : $el.getBoundingClientRect();
  }
  function top($el) {
    return rect($el).top;
  }

  function bottom($el) {
    return rect($el).bottom;
  }

  /**
   * Registers an element as sticky, this is what the factory returns,
   * and what directives register themselves with */
  function registerStickyElement(scope, $el) {
    elements.push(Util.wrap($el, 'div', 'sticky-container'));
  }
}
