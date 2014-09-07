/**
 * @ngdoc module
 * @name material.components.sticky
 * @description
 *
 * Sticky effects for material
 */

angular.module('material.components.sticky', [
  'material.components.content',
  'material.decorators',
  'material.animations'
])
.factory('$materialSticky', [
  '$window',
  '$document',
  '$$rAF',
  '$materialEffects',
  MaterialSticky
])
.directive('materialSticky', [
  '$materialSticky', 
  MaterialStickyDirective
]);

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

function MaterialSticky($window, $document, $$rAF, $materialEffects) {
  var browserStickySupport;

  /**
   * Registers an element as sticky, used internally by directives to register themselves
   */


  function registerStickyElement(scope, $el) {
    scope.$on('$destroy', function() { $deregister($el); });
    $el = Util.wrap($el, 'div', 'sticky-container');

    var ctrl = $el.controller('materialContent');

    if (!ctrl) { throw new Error('$materialSticky used outside of material-content'); }

    var $container = ctrl.$element;

    /*
     * The sticky object on the container stores everything we need.
     * `elements`: all known sticky elements within the container
     * `orderedElements`: elements, ordered by vertical position within the layout
     * `check`: debounced function to check elements for adjustment on scroll
     * `targetIndex`: the index in orderedElements of the currently active sticky el
    */

    var $sticky = $container.data('$sticky') || {
      elements: [], // all known sticky elements within $container
      orderedElements: [], // elements, ordered by vertical position in layout
      check: $$rAF.debounce(angular.bind(undefined, checkElements, $container)),
      targetIndex: 0
    };

    $sticky.elements.push($el);

    // check sticky support on first register
    if (browserStickySupport === undefined) {
      browserStickySupport = checkStickySupport($el);
    } else if (browserStickySupport) {
      $el.css({position: browserStickySupport, top: '0px', 'z-index': 2});
    }

    if (!browserStickySupport) {
      if ($sticky.elements.length == 1) {
        $container.data('$sticky', $sticky);
        $container.on('scroll',  $sticky.check);
      }
      queueScan();
    }

    return $deregister;


    // Deregister a sticky element, useful for $destroy event.
    function $deregister($el) {
      if ($deregister.called) return;
      $deregister.called = true;
      var innerElements = elements.map(function(el) { return el.children(0); });
      var index = innerElements.indexOf($el);
      if (index !== -1) {
        elements[index].replaceWith($el);
        elements.splice(index, 1);
        if (elements.length === 0) {
          $container.off('scroll', $sticky.check);
          $container.removeData('$sticky');
        }
      }
    }

    // Method that will scan the elements after the current digest cycle
    function queueScan() {
      if (!queueScan.queued) {
        queueScan.queued = true;
        scope.$$postDigest(function() {
          scanElements($container);
          queueScan.queued = false;
        });
      }
    }
  }
  return registerStickyElement;

  // Function to check for browser sticky support

  function checkStickySupport($el) {
    var stickyProps = ['sticky', '-webkit-sticky'];
    for (var i = 0; i < stickyProps.length; ++i) {
      $el.css({position: stickyProps[i], top: 0, 'z-index': 2});
      if ($el.css('position') == stickyProps[i]) {
        return stickyProps[i];
      }
    }
    $el.css({position: undefined, top: undefined});
    return false;
  }


  /**
   * Function to prepare our lookups so we can go quick!
   */
  function scanElements($container) {
    if (browserStickySupport) return;

    var $sticky = $container.data('$sticky');

    // Sort based on position in the window, and assign an active index
    $sticky.orderedElements = $sticky.elements.sort(function(a, b) {
      return rect(a).top - rect(b).top;
    });

    $sticky.targetIndex = findTargetElementIndex();


    // Iterate over our sorted elements and find the one that is active
    function findTargetElementIndex() {
      var scroll = $container.prop('scrollTop');
      for(var i = 0; i < $sticky.orderedElements.length ; ++i) {
        if (rect($sticky.orderedElements[i]).bottom > 0) {
          return i > 0 ? i - 1 : i;
        } else {
          return i;
        }
      }
    }
  }

  // Function that executes on scroll to see if we need to do adjustments
  function checkElements($container) {
    var next; // pointer to next target

    var $sticky = $container.data('$sticky');

    var targetElementIndex = $sticky.targetIndex;
    var orderedElements = $sticky.orderedElements;

    /* 
     * Since we wrap in an element (to keep track of where in the layout the 
     * element would normally be, we use children to get the actual sticky 
     * element.
     */

    var content = targetElement().children(0);
    var contentRect = rect(content);
    var containerRect = rect($container);
    var targetRect = rect(targetElement());

    var scrollingDown = false;
    var currentScroll = $container.prop('scrollTop');
    var lastScroll = $sticky.lastScroll;
    if (currentScroll > (lastScroll || 0)) {
      scrollingDown = true;
    }
    $sticky.lastScroll = currentScroll;

    var stickyActive = content.hasClass('material-sticky-active');


    // If we are scrollingDown, sticky, and are being pushed off screen by a different element, increment
    if (scrollingDown && stickyActive && contentRect.bottom <= containerRect.top && targetElementIndex < orderedElements.length - 1) {
      targetElement().children(0).removeClass('material-sticky-active');
      targetElement().css('height', null);
      incrementElement();
      return;

    //If we are going up, and our normal position would be rendered not sticky, un-sticky ourselves
    } else if (!scrollingDown && stickyActive && targetRect.top > containerRect.top) {
      targetElement().children(0).removeClass('material-sticky-active');
      targetElement().css('height', null);
      if (targetElementIndex > 0) {
        incrementElement(-1);
        content.addClass('material-sticky-active');
        transformY(content, -contentRect.height);
        targetElement().css('height', contentRect.height + 'px');
        return;
      }
      return; // explicit return for the blind

    /* 
     * If we are going off screen and haven't been made sticky yet, go sticky
     * Check at 0 so that if we get lucky on the scroll position, we activate
     * sticky and avoid floating off the top for a second
     */

    } else if (scrollingDown && contentRect.top <= containerRect.top && !stickyActive) {
      content.addClass('material-sticky-active');
      targetElement().css('height', contentRect.height + 'px');
      contentRect = rect(content);
      next = targetElement(+1);
      var offset = 0;
      if (next) {
        nextRect = rect(next.children(0));
        if (rectsAreTouching(contentRect, nextRect)) {
          offset = nextRect.top - contentRect.bottom;
        }
        transformY(content, Math.min(offset, 0));
      }
      return;
    } 

    var nextRect, offsetAmount, currentTop, translateAmt;

    // check if we need to push
    if (scrollingDown) {
      next = targetElement(+1);
      if (next) {
        nextRect = rect(next.children(0));
        if (rectsAreTouching(contentRect, nextRect)) {
          offsetAmount = contentRect.bottom - nextRect.top;
          currentTop = transformY(content);
          translateAmt = currentTop - offsetAmount;
          transformY(content, translateAmt);
        }
      }
    // Check if we need to pull
    } else if (targetElementIndex < orderedElements.length - 1 && contentRect.top < containerRect.top) {
      nextRect = rect(targetElement(+1).children(0));
      offsetAmount = contentRect.bottom - nextRect.top;
      currentTop = transformY(content);
      translateAmt = Math.min(currentTop - offsetAmount, 0);
      transformY(content, translateAmt);
    }

    function incrementElement(inc) {
      inc = inc || 1;
      targetElementIndex += inc;
      content = targetElement().children(0);
      contentRect = rect(content);
      $sticky.targetIndex = targetElementIndex;
    }

    function targetElement(indexModifier) {
      indexModifier = indexModifier || 0;
      if (targetElementIndex === undefined) return undefined;
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

  // Getter / setter for transform
  function transformY($el, amnt) {
    if (amnt === undefined) {
      return $el.data('translatedHeight') || 0;
    } else {
      $el.css($materialEffects.TRANSFORM, 'translate3d(0, ' + amnt + 'px, 0)');
      $el.data('translatedHeight', amnt);
    }
  }


}

/**
 * @ngdoc directive
 * @name materialSticky
 * @module material.components.sticky
 *
 * @description
 * Directive to consume the $materialSticky service
 *
 * @returns A material-sticky directive
 */
function MaterialStickyDirective($materialSticky) {
  return {
    restrict: 'A',
    link: $materialSticky
  };
}
