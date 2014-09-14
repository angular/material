/**
 * @ngdoc module
 * @name material.components.sticky
 * @description
 *
 * Sticky effects for material
 */

angular.module('material.components.sticky', [])
.factory('$materialSticky', ['$window', '$document', '$$rAF', MaterialSticky])
.directive('materialSticky', ['$materialSticky', MaterialStickyDirective]);

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
  var browserStickySupport;

  /**
   * Registers an element as sticky, used internally by directives to register themselves
   */


  function registerStickyElement(scope, $el) {
    scope.$on('$destroy', function() { registerStickyElement.$deregister($el); });
    $el = Util.wrap($el, 'div', 'sticky-container'),
    $container = $el.controller('materialContent').$element;

    if(!$container) { throw new Error('$materialSticky used outside of material-contant'); }

    var elements = $container.data('$stickyEls') || [];
    elements.push($el);
    $container.data('$stickyEls', elements);

    // check sticky support on first register
    if(browserStickySupport === undefined) {
      browserStickySupport = checkStickySupport($el);
    } else if(browserStickySupport) {
      $el.css({position: browserStickySupport, top: '0px'});
    }

    var debouncedCheck = $container.data('$stickyCheck') || $$rAF.debounce(checkElements.bind(undefined, $container));
    $container.data('$stickyCheck', debouncedCheck);


    if(!browserStickySupport) {
      if(elements.length == 1) {
        $container.on('scroll',  debouncedCheck);
      }
      scanElements($container);
    }
  }


  // Deregister a sticky element, useful for $destroy event.
  registerStickyElement.$deregister = function($el) {
    var $container = $el.controller('materialContent').$element;
    var elements = $container.data('$stickyEls') || [];
    var innerElements = elements.map(function(el) { return el.children(0); });
    var index = innerElements.indexOf($el);
    if(index !== -1) {
      elements[index].replaceWith($el);
      elements.splice(index, 1);
      if(elements.length === 0) {
        $container.off('scroll', $container.data('$stickyCheck'));
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

  function scanElements($container) {
    var elements = $container.data('$stickyEls');
    if(browserStickySupport) return; // don't need to do anything if we have native sticky
    targetElementIndex = 0;
    // Sort based on position in the window, and assign an active index
    orderedElements = elements.sort(function(a, b) {
      return rect(a).top - rect(b).top;
    });

    $container.data('$stickyOrderedEls', orderedElements);

    // Iterate over our sorted elements and find the one that is active
    (function findTargetElement() {
      var scroll = $container.scrollTop();
      for(var i = 0; i < orderedElements.length ; ++i) {
        if(rect(orderedElements[i].children(0)).bottom > 0) {
          targetElementIndex = i > 0 ? i - 1 : i;
        } else {
          targetElementIndex = i;
        }
      }
      $container.data('$stickyTarget', targetElementIndex);
    })();
  }

  function checkElements($container) {
    var next; // pointer to next target

    // Convenience getter for the target element
    var targetElementIndex = $container.data('$stickyTarget'),
        orderedElements = $container.data('$stickyOrderedEls');

    var content = targetElement().children(0);
    var contentRect = rect(content),
    targetRect = rect(targetElement());

    var scrollingDown = false,
        currentScroll = $container.scrollTop(),
        lastScroll = $container.data('$stickyLastScroll');

    if(currentScroll > ($container.data('$stickyLastScroll') || 0)) {
      scrollingDown = true;
    }
    $container.data('$stickyLastScroll', currentScroll);

    var stickyActive = content.attr('material-sticky-active');


    // If we are scrollingDown, sticky, and are being pushed off screen by a different element, increment
    if(scrollingDown && stickyActive && contentRect.bottom <= 0 && targetElementIndex < orderedElements.length - 1) {
      targetElement().children(0).removeAttr('material-sticky-active');
      targetElement().css({height: null});
      incrementElement();
    } 
    //If we are going up, and our normal position would be rendered not sticky, un-sticky ourselves
    else if(!scrollingDown && stickyActive && targetRect.top > 0) {
      targetElement().children(0).removeAttr('material-sticky-active');
      targetElement().css({height: null});
      incrementElement(-1);
      content.attr('material-sticky-active', true);
      content.css({top: -1 * contentRect.height});
      targetElement().css({height: contentRect.height});
    } 
    // If we are going off screen and haven't been made sticky yet, go sticky
    else if(scrollingDown && contentRect.top <= 0 && !stickyActive) {
      content.attr('material-sticky-active', true);
      targetElement().css({height: contentRect.height});
      contentRect = rect(content);
      next = targetElement(+1);
      var offset = 0;
      if(next) {
        nextRect = rect(next.children(0));
        if(rectsAreTouching(contentRect, nextRect)) {
          offset = nextRect.top - contentRect.bottom;
        }
      }
      content.css({top: Math.min(offset, 0)});
    } 

    var nextRect, offsetAmount, currentTop;
    if(scrollingDown) {
      // check if we need to push
      next = targetElement(+1);
      if(next) {
        nextRect = rect(next.children(0));
        if(rectsAreTouching(contentRect, nextRect)) {
          offsetAmount = contentRect.bottom - nextRect.top;
          currentTop = content.css('top');
          if(currentTop == 'auto') { currentTop = 0; }
          else { currentTop = parseInt(currentTop, 10); }
          content.css({top: currentTop - offsetAmount});
        }
      }
    } else if(targetElementIndex < orderedElements.length - 1 && contentRect.top < 0) {
      // we need to pull
      nextRect = rect(targetElement(+1).children(0));
      offsetAmount = contentRect.bottom - nextRect.top;
      currentTop = content.css('top');
      if(currentTop == 'auto') { currentTop = 0; }
      else { currentTop = parseInt(currentTop, 10); }
      content.css({top: Math.min(currentTop - offsetAmount, 0)});
    }

    function incrementElement(inc) {
      inc = inc || 1;
      targetElementIndex += inc;
      content = targetElement().children(0);
      contentRect = rect(content);
      $container.data('$stickyTarget', targetElementIndex);
    }

    function targetElement(indexModifier) {
      indexModifier = indexModifier || 0;
      if(targetElementIndex === undefined) return undefined;
      return orderedElements[targetElementIndex + indexModifier];
    }
  }

  function rectsAreTouching(first, second) {
    return first.bottom >= second.top;
  }

  // Helper functions to get position of element

  function rect($el) {
    return $el.hasOwnProperty(0) ? $el[0].getBoundingClientRect() : $el.getBoundingClientRect();
  }


}

/**
 * @ngdoc directive
 * @name materialSticky
 * @module material.components.sticky
 *
 * @description
 * Directive to consume the $materialSticky directive
 *
 * @returns A material-sticky directive
 */
function MaterialStickyDirective($materialSticky) {
  return {
    restrict: 'A',
    link: $materialSticky
  };
}
