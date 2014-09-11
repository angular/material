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


  //$document.on('scroll', Util.debounce(startScroll, 1000, true));
  $document.on('scroll',  checkElements);

  startScroll();

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
        if(bottom(orderedElements[i].children(0)) > 0) {
          targetElementIndex = i > 0 ? i - 1 : i;
        }
      }
    })();
  }

  var lastScroll = 0;
  function checkElements() {
    var content = targetElement().children(0);
    var contentRect = rect(content),
    targetRect = rect(targetElement());

    var scrollingDown = false;
    if($window.scrollY > (lastScroll || 0)) {
      scrollingDown = true;
    }
    lastScroll = $window.scrollY;


    if(scrollingDown && content.attr('material-sticky-active') && contentRect.bottom <= 0 && targetElementIndex < orderedElements.length - 1) {
      console.log("Upping target");
      $$rAF(function() {
        content.removeAttr('material-sticky-active');
        targetElement().css({height: null});
        targetElementIndex++;
        content = targetElement().children(0);
        contentRect = rect(content);
        content.attr('material-sticky-active', true);
        content.css({top: 0});
        targetElement().css({height: contentRect.height});
      });
    } else if(!scrollingDown && content.attr('material-sticky-active') && targetRect.top > 0) {
      console.log("Lowering target");
      return $$rAF(function() {
        content.removeAttr('material-sticky-active');
        targetElement().css({height: null});
        targetElementIndex--;
        content = targetElement().children(0);
        contentRect = rect(content);
        content.attr('material-sticky-active', true);
        targetElement().css({height: contentRect.height});
      });
    } else if(scrollingDown && contentRect.top <= 0) {
      $$rAF(function() {
        content.attr('material-sticky-active', true);
        content.css({top: 0});
        targetElement().css({height: contentRect.height});
        contentRect = rect(content);
      });
    } 

    var nextRect;
    if(scrollingDown) {
      // check if we need to push
      var next = targetElement(+1);
      if(next) {
        nextRect = rect(next.children(0));
        if(rectsAreTouching(contentRect, nextRect)) {
          $$rAF(function() {
            var offsetAmount = contentRect.bottom - nextRect.top;
            var currentTop = content.css('top');
            if(currentTop == 'auto') { currentTop = 0; }
            else { currentTop = parseInt(currentTop, 10); }
            var newTop = currentTop - offsetAmount;
            content.css({top: currentTop - offsetAmount});
          });
        }
      }
    } else if(targetElementIndex < orderedElements.length - 1 && contentRect.top < 0) {
      console.log("B");
      // check if we need to pull
      nextRect = rect(targetElement(+1).children(0));
      $$rAF(function() {
        var offsetAmount = contentRect.bottom - nextRect.top;
        var currentTop = content.css('top');
        if(currentTop == 'auto') { currentTop = 0; }
        else { currentTop = parseInt(currentTop, 10); }
        content.css({top: Math.min(currentTop - offsetAmount, 0)});
      });
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
