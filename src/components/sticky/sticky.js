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
  targetElementIndex, browserStickySupport;

  /**
   * Registers an element as sticky, used internally by directives to register themselves
   */

  function registerStickyElement(scope, $el) {
    $el = Util.wrap($el, 'div', 'sticky-container');
    elements.push($el);

    // check sticky support on first register
    if(browserStickySupport === undefined) {
      browserStickySupport = checkStickySupport($el);
    } else if(browserStickySupport) {
      $el.css({position: browserStickySupport, top: '0px'});
    }

    if(!browserStickySupport) {
      if(elements.length == 1) {
        $document.on('scroll',  checkElements);
      }
      scanElements();
    }
  }


  // Deregister a sticky element, useful for $destroy event.
  registerStickyElement.$deregister = function($el) {
    var innerElements = elements.map(function(el) { return el.children(0); });
    var index = innerElements.indexOf($el);
    if(~index) {
      elements[index].replaceWith($el);
      elements.splice(index, 1);
      if(elements.length === 0) {
        $document.off('scroll', checkElements);
      }
    }
  };

  return registerStickyElement;

  function checkStickySupport($el) {
    var stickyProps = ['sticky', '-webkit-sticky'];
    for(var i = 0; i < stickyProps.length; ++i) {
      $el.css({position: stickyProps[i], top: '0px'});
      if($window.getComputedStyle($el[0]).position == stickyProps[i]) {
        return stickyProps[i];
      }
    }
    $el.css({position: undefined, top: undefined});
    return false;
  }


  /* *
   * Function to prepare our lookups so we can go quick!
   * */

  function scanElements() {
    if(browserStickySupport) return; // don't need to do anything if we have native sticky
    targetElementIndex = 0;
    // Sort based on position in the window, and assign an active index
    orderedElements = elements.sort(function(a, b) {
      return rect(a).top - rect(b).top;
    });

    // Iterate over our sorted elements and find the one that is active
    (function findTargetElement() {
      var windowTop = $window.scrollY;
      for(var i = 0; i < orderedElements.length ; ++i) {
        if(rect(orderedElements[i].children(0)).bottom > 0) {
          targetElementIndex = i > 0 ? i - 1 : i;
        } else {
          targetElementIndex = i;
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

    var stickyActive = content.attr('material-sticky-active');


    if(scrollingDown && stickyActive && contentRect.bottom <= 0 && targetElementIndex < orderedElements.length - 1) {
      incrementElement();
      $$rAF(function() {
        targetElement(-1).children(0).removeAttr('material-sticky-active');
        targetElement(-1).css({height: null});
      });
    } else if(!scrollingDown && stickyActive && targetRect.top > 0) {
      incrementElement(-1);
      return $$rAF(function() {
        targetElement(+1).children(0).removeAttr('material-sticky-active');
        targetElement(+1).css({height: null});
        content.attr('material-sticky-active', true);
        content.css({top: -1 * contentRect.height});
        targetElement().css({height: contentRect.height});
      });
    } else if(scrollingDown && contentRect.top <= 0 && !stickyActive) {
      $$rAF(function() {
        content.attr('material-sticky-active', true);
        targetElement().css({height: contentRect.height});
        contentRect = rect(content);
        var next = targetElement(+1),
            offset = 0;
        if(next) {
          nextRect = rect(next.children(0));
          if(rectsAreTouching(contentRect, nextRect)) {
            offset = nextRect.top - contentRect.bottom;
          }
        }
        content.css({top: Math.min(offset, 0)});
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
      // we need to pull
      nextRect = rect(targetElement(+1).children(0));
      $$rAF(function() {
        var offsetAmount = contentRect.bottom - nextRect.top;
        var currentTop = content.css('top');
        if(currentTop == 'auto') { currentTop = 0; }
        else { currentTop = parseInt(currentTop, 10); }
        content.css({top: Math.min(currentTop - offsetAmount, 0)});
      });
    }

    function incrementElement(inc) {
      inc = inc || 1;
      targetElementIndex += inc;
      content = targetElement().children(0);
      contentRect = rect(content);
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


}
