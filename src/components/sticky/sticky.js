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
  '$document',
  '$materialEffects',
  '$compile',
  '$$rAF',
  MaterialSticky
]);

/**
 * @ngdoc factory
 * @name $materialSticky
 * @module material.components.sticky
 *
 * @description
 * The `$materialSticky`service provides a mixin to make elements sticky.
 *
 * @returns A `$materialSticky` function that takes three arguments:
 *   - `scope`
 *   - `element`: The element that will be 'sticky'
 *   - `{optional}` `clone`: A clone of the element, that will be shown
 *     when the user starts scrolling past the original element.
 *     If not provided, it will use the result of `element.clone()`.
 */

function MaterialSticky($document, $materialEffects, $compile, $$rAF) {

  var browserStickySupport = checkStickySupport();

  /**
   * Registers an element as sticky, used internally by directives to register themselves
   */
  return function registerStickyElement(scope, element, stickyClone) {
    var contentCtrl = element.controller('materialContent');
    if (!contentCtrl) return;

    if (browserStickySupport) {
      element.css({
        position: browserStickySupport,
        top: 0,
        'z-index': 2
      });
    } else {
      var $$sticky = contentCtrl.$element.data('$$sticky');
      if (!$$sticky) {
        $$sticky = setupSticky(contentCtrl);
        contentCtrl.$element.data('$$sticky', $$sticky);
      }

      var deregister = $$sticky.add(element, stickyClone || element.clone());
      scope.$on('$destroy', deregister);
    }
  };

  function setupSticky(contentCtrl) {
    var contentEl = contentCtrl.$element;

    // stickyContainer holds all of the clones of the sticky elements.
    // The proper clone will be stickied to the top of the screen depending 
    // on the content's scroll position.
    var stickyContainer = angular.element('<div class="material-sticky-container">');
    $document[0].body.appendChild(stickyContainer[0]);

    // Refresh elements is very expensive, so we use the debounced
    // version when possible.
    var debouncedRefreshElements = $$rAF.debounce(refreshElements);

    // setupAugmentedScrollEvents gives us `$scrollstart` and `$scroll`,
    // more reliable than `scroll` on android.
    setupAugmentedScrollEvents(contentEl);
    contentEl.on('$scrollstart', debouncedRefreshElements);
    contentEl.on('$scroll', onScroll);

    contentCtrl.$scope.$on('$destroy', function cleanup() {
      stickyContainer.remove();
    });

    var self;
    return self = {
      prev: null,
      current: null, //the currently stickied item
      next: null,
      items: [],
      add: add,
      refreshElements: refreshElements
    };

    /***************
     * Public
     ***************/
    // Add an element and its sticky clone to this content's sticky collection
    function add(element, stickyClone) {
      stickyClone.addClass('material-sticky-clone');

      var item = {
        element: element,
        clone: stickyClone
      };
      self.items.push(item);

      stickyContainer.append(item.clone);

      debouncedRefreshElements();

      return function remove() {
        self.items.forEach(function(item, index) {
          if (item.element[0] === element[0]) {
            self.items.splice(index, 1);
            item.clone.remove();
          }
        });
        debouncedRefreshElements();
      };
    }

    function refreshElements() {
      var contentRect = contentEl[0].getBoundingClientRect();

      // Sort our collection of elements by their current position in the DOM.
      // We need to do this because our elements' order of being added may not
      // be the same as their order of display.
      self.items = self.items.sort(function(a, b) {
        refreshPosition(a);
        refreshPosition(b);
        return a.top > b.top;
      });

      // Set our stickyContainer, which is just an invisible overflow:hidden box 
      // placed over the content area, to fit right on top of the content.
      stickyContainer.css({
        left: contentRect.left + 'px',
        top: contentRect.top + 'px',
        width: contentRect.width + 'px',
        height: contentRect.height + 'px'
      });

      // Finally, try to sticky the item nearest to the user's scroll position.
      findCurrentItem();
    }


    /***************
     * Private
     ***************/

    // Find the `top` of an item relative to the content element,
    // and also the height.
    function refreshPosition(item) {
      // Find the top of an item by adding to the offsetHeight until we reach the 
      // content element.
      var current = item.element[0];
      item.top = 0;
      while (current && current !== contentEl[0]) {
        item.top += current.offsetTop;
        current = current.offsetParent;
      }
      item.height = item.element.prop('offsetHeight');
    }

    function cleanup() {
      stickyContainer.remove();
    }

    // Find which item in the list should be active, based upon the content's scroll position
    function findCurrentItem() {
      var currentItem;
      var currentScrollTop = contentEl.prop('scrollTop');
      for (var i = self.items.length - 1; i >= 0; i--) {
        if (currentScrollTop >= self.items[i].top) {
          currentItem = self.items[i];
          break;
        }
      }
      setCurrentItem(currentItem);
    }

    // As we scroll, push in and select the correct sticky element.
    function onScroll() {
      var scrollTop = contentEl.prop('scrollTop');
      var isScrollingDown = scrollTop > (onScroll.prevScrollTop || 0);
      onScroll.prevScrollTop = scrollTop;

      // Going to next item?
      if (isScrollingDown && self.next) {
        if (self.next.top - scrollTop <= 0) {
          // Sticky the next item if we've scrolled past its position.
          setCurrentItem(self.next);
        } else if (self.current) {
          // Push the current item up when we're almost at the next item.
          if (self.next.top - scrollTop <= self.next.height) {
            translate(self.current, self.next.top - self.next.height - scrollTop);
          } else {
            translate(self.current, null);
          }
        }
      // Scrolling up with a current sticky item?
      } else if (!isScrollingDown && self.current) {
        if (scrollTop < self.current.top) {
          // Sticky the previous item if we've scrolled up past
          // the original position of the currently stickied item.
          setCurrentItem(self.prev);
        }
        // Scrolling up, and just bumping into the item above (just set to current)?
        // If we have a next item bumping into the current item, translate
        // the current item up from the top as it scrolls into view.
        if (self.current && self.next) {
          if (scrollTop >= self.next.top - self.current.height) {
            translate(self.current, self.next.top - scrollTop - self.current.height);
          } else {
            translate(self.current, null);
          }
        }
      }
    }
     
   function setCurrentItem(item) {
     self.current && setInactive(self.current);
     item && setActive(item);

     self.current = item;
     var index = self.items.indexOf(item);
     // If index === -1, index + 1 = 0. It works out.
     self.next = self.items[index + 1];
     self.prev = self.items[index - 1];
   }

   function setActive(item) {
     item.clone.addClass('material-sticky-active');
     item.element.addClass('material-sticky-invisible');
   }
   function setInactive(item) {
     translate(item, null);
     item.clone.removeClass('material-sticky-active');
     item.element.removeClass('material-sticky-invisible');
   }

   function translate(item, amount) {
     if (!item) return;
     if (amount === null || amount === undefined) {
       if (item.translateY) {
         item.translateY = null;
         item.clone.css($materialEffects.TRANSFORM, '');
       }
     } else {
       item.translateY = amount;
       item.clone.css($materialEffects.TRANSFORM, 'translate3d(0,' + amount + 'px,0)');
     }
   }
  }

  // Function to check for browser sticky support
  function checkStickySupport($el) {
    var stickyProp;
    var testEl = angular.element('<div>');
    $document[0].body.appendChild(testEl[0]);

    var stickyProps = ['sticky', '-webkit-sticky'];
    for (var i = 0; i < stickyProps.length; ++i) {
      testEl.css({position: stickyProps[i], top: 0, 'z-index': 2});
      if (testEl.css('position') == stickyProps[i]) {
        stickyProp = stickyProps[i];
        break;
      }
    }
    testEl.remove();
    return stickyProp;
  }

  // Android 4.4 don't accurately give scroll events.
  // To fix this problem, we setup a fake scroll event. We say:
  // > If a scroll or touchmove event has happened in the last DELAY milliseconds, 
  //   then send a `$scroll` event every animationFrame.
  // Additionally, we add $scrollstart and $scrollend events.
  function setupAugmentedScrollEvents(element) {
    var SCROLL_END_DELAY = 200;
    var isScrolling;
    var lastScrollTime;
    element.on('scroll touchmove', function() {
      if (!isScrolling) {
        isScrolling = true;
        element.triggerHandler('$scrollstart');
        scrollEvent();
      }
      lastScrollTime = +Util.now();
    });

    function scrollEvent() {
      if (+Util.now() - lastScrollTime > SCROLL_END_DELAY) {
        isScrolling = false;
        element.triggerHandler('$scrollend');
      } else {
        element.triggerHandler('$scroll');
        $$rAF(scrollEvent);
      }
    }
  }

}
