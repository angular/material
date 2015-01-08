(function() {
'use strict';

/*
 * This var has to be outside the angular factory, otherwise when
 * there are multiple material apps on the same page, each app
 * will create its own instance of this array and the app's IDs
 * will not be unique.
 */
var nextUniqueId = ['0','0','0'];

angular.module('material.core')
.factory('$mdUtil', function($cacheFactory, $document, $timeout) {
  var Util;
  return Util = {
    now: window.performance ? angular.bind(window.performance, window.performance.now) : Date.now,

    attachDragBehavior: attachDragBehavior,

    elementRect: function(element, offsetParent) {
      var node = element[0];
      offsetParent = offsetParent || node.offsetParent || document.body;
      offsetParent = offsetParent[0] || offsetParent;
      var nodeRect = node.getBoundingClientRect();
      var parentRect = offsetParent.getBoundingClientRect();
      return {
        left: nodeRect.left - parentRect.left + offsetParent.scrollLeft,
        top: nodeRect.top - parentRect.top + offsetParent.scrollTop,
        width: nodeRect.width,
        height: nodeRect.height
      };
    },

    fakeNgModel: function() {
      return {
        $setViewValue: function(value) {
          this.$viewValue = value;
          this.$render(value);
          this.$viewChangeListeners.forEach(function(cb) { cb(); });
        },
        $parsers: [],
        $formatters: [],
        $viewChangeListeners: [],
        $render: angular.noop
      };
    },

    /**
     * @see cacheFactory below
     */
    cacheFactory: cacheFactory,

    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds.
    // @param wait Integer value of msecs to delay (since last debounce reset); default value 10 msecs
    // @param invokeApply should the $timeout trigger $digest() dirty checking
    debounce: function (func, wait, scope, invokeApply) {
      var timer;

      return function debounced() {
        var context = scope,
          args = Array.prototype.slice.call(arguments);

        $timeout.cancel(timer);
        timer = $timeout(function() {

          timer = undefined;
          func.apply(context, args);

        }, wait || 10, invokeApply );
      };
    },

    // Returns a function that can only be triggered every `delay` milliseconds.
    // In other words, the function will not be called unless it has been more
    // than `delay` milliseconds since the last call.
    throttle: function throttle(func, delay) {
      var recent;
      return function throttled() {
        var context = this;
        var args = arguments;
        var now = Util.now();

        if (!recent || (now - recent > delay)) {
          func.apply(context, args);
          recent = now;
        }
      };
    },

    /**
     * nextUid, from angular.js.
     * A consistent way of creating unique IDs in angular. The ID is a sequence of alpha numeric
     * characters such as '012ABC'. The reason why we are not using simply a number counter is that
     * the number string gets longer over time, and it can also overflow, where as the nextId
     * will grow much slower, it is a string, and it will never overflow.
     *
     * @returns an unique alpha-numeric string
     */
    nextUid: function() {
      var index = nextUniqueId.length;
      var digit;

      while(index) {
        index--;
        digit = nextUniqueId[index].charCodeAt(0);
        if (digit == 57 /*'9'*/) {
          nextUniqueId[index] = 'A';
          return nextUniqueId.join('');
        }
        if (digit == 90  /*'Z'*/) {
          nextUniqueId[index] = '0';
        } else {
          nextUniqueId[index] = String.fromCharCode(digit + 1);
          return nextUniqueId.join('');
        }
      }
      nextUniqueId.unshift('0');
      return nextUniqueId.join('');
    },

    // Stop watchers and events from firing on a scope without destroying it,
    // by disconnecting it from its parent and its siblings' linked lists.
    disconnectScope: function disconnectScope(scope) {
      if (!scope) return;

      // we can't destroy the root scope or a scope that has been already destroyed
      if (scope.$root === scope) return;
      if (scope.$$destroyed ) return;

      var parent = scope.$parent;
      scope.$$disconnected = true;

      // See Scope.$destroy
      if (parent.$$childHead === scope) parent.$$childHead = scope.$$nextSibling;
      if (parent.$$childTail === scope) parent.$$childTail = scope.$$prevSibling;
      if (scope.$$prevSibling) scope.$$prevSibling.$$nextSibling = scope.$$nextSibling;
      if (scope.$$nextSibling) scope.$$nextSibling.$$prevSibling = scope.$$prevSibling;

      scope.$$nextSibling = scope.$$prevSibling = null;

    },

    // Undo the effects of disconnectScope above.
    reconnectScope: function reconnectScope(scope) {
      if (!scope) return;

      // we can't disconnect the root node or scope already disconnected
      if (scope.$root === scope) return;
      if (!scope.$$disconnected) return;

      var child = scope;

      var parent = child.$parent;
      child.$$disconnected = false;
      // See Scope.$new for this logic...
      child.$$prevSibling = parent.$$childTail;
      if (parent.$$childHead) {
        parent.$$childTail.$$nextSibling = child;
        parent.$$childTail = child;
      } else {
        parent.$$childHead = parent.$$childTail = child;
      }
    },
  /*
   * getClosest replicates jQuery.closest() to walk up the DOM tree until it finds a matching nodeName
   *
   * @param el Element to start walking the DOM from
   * @param tagName Tag name to find closest to el, such as 'form'
   */
    getClosest: function getClosest(el, tagName) {
      tagName = tagName.toUpperCase();
      do {
        if (el.nodeName === tagName) {
          return el;
        }
      } while (el = el.parentNode);
      return null;
    }
  };


  function attachDragBehavior(scope, element, options) {
    // The state of the current drag & previous drag
    var drag;
    var previousDrag;
    // Whether the pointer is currently down on this element.
    var pointerIsDown;
    var START_EVENTS = 'mousedown touchstart pointerdown';
    var MOVE_EVENTS = 'mousemove touchmove pointermove';
    var END_EVENTS = 'mouseup mouseleave touchend touchcancel pointerup pointercancel';

    // Listen to move and end events on document. End events especially could have bubbled up
    // from the child.
    element.on(START_EVENTS, startDrag);
    $document.on(MOVE_EVENTS, doDrag)
      .on(END_EVENTS, endDrag);

    scope.$on('$destroy', cleanup);

    return cleanup;

    function cleanup() {
      if (cleanup.called) return;
      cleanup.called = true;

      element.off(START_EVENTS, startDrag);
      $document.off(MOVE_EVENTS, doDrag)
        .off(END_EVENTS, endDrag);
      drag = pointerIsDown = false;
    }

    function startDrag(ev) {
      var eventType = ev.type.charAt(0);
      var now = Util.now();
      // iOS & old android bug: after a touch event, iOS sends a click event 350 ms later.
      // Don't allow a drag of a different pointerType than the previous drag if it has been
      // less than 400ms.
      if (previousDrag && previousDrag.pointerType !== eventType &&
          (now - previousDrag.endTime < 400)) {
        return;
      }
      if (pointerIsDown) return;
      pointerIsDown = true;

      drag = {
        // Restrict this drag to whatever started it: if a mousedown started the drag,
        // don't let anything but mouse events continue it.
        pointerType: eventType,
        startX: getPosition(ev),
        startTime: now
      };

      element.one('$md.dragstart', function(ev) {
        // Allow user to cancel by preventing default
        if (ev.defaultPrevented) drag = null;
      });
      element.triggerHandler('$md.dragstart', drag);
    }
    function doDrag(ev) {
      if (!drag || !isProperEventType(ev, drag)) return;

      if (drag.pointerType === 't' || drag.pointerType === 'p') {
        // No scrolling for touch/pointer events
        ev.preventDefault();
      }
      updateDragState(ev);
      element.triggerHandler('$md.drag', drag);
    }
    function endDrag(ev) {
      pointerIsDown = false;
      if (!drag || !isProperEventType(ev, drag)) return;

      drag.endTime = Util.now();
      updateDragState(ev);

      element.triggerHandler('$md.dragend', drag);

      previousDrag = drag;
      drag = null;
    }

    function updateDragState(ev) {
      var x = getPosition(ev);
      drag.distance = drag.startX - x;
      drag.direction = drag.distance > 0 ? 'left' : (drag.distance < 0 ? 'right' : '');
      drag.duration = drag.startTime - Util.now();
      drag.velocity = Math.abs(drag.duration) / drag.time;
    }
    function getPosition(ev) {
      ev = ev.originalEvent || ev; //support jQuery events
      var point = (ev.touches && ev.touches[0]) ||
        (ev.changedTouches && ev.changedTouches[0]) ||
        ev;
      return point.pageX;
    }
    function isProperEventType(ev, drag) {
      return drag && ev && (ev.type || '').charAt(0) === drag.pointerType;
    }
  }

  /*
   * Inject a 'keys()' method into Angular's $cacheFactory. Then
   * head-hook all other methods
   *
   */
  function cacheFactory(id, options) {
    var cache = $cacheFactory(id, options);
    var keys = {};

    cache._put = cache.put;
    cache.put = function(k,v) {
      keys[k] = true;
      return cache._put(k, v);
    };

    cache._remove = cache.remove;
    cache.remove = function(k) {
      delete keys[k];
      return cache._remove(k);
    };

    cache._removeAll = cache.removeAll;
    cache.removeAll = function() {
      keys = {};
      return cache._removeAll();
    };

    cache._destroy = cache.destroy;
    cache.destroy = function() {
      keys = {};
      return cache._destroy();
    };

    cache.keys = function() {
      return Object.keys(keys);
    };

    return cache;
  }
});

/*
 * Since removing jQuery from the demos, some code that uses `element.focus()` is broken.
 *
 * We need to add `element.focus()`, because it's testable unlike `element[0].focus`.
 *
 * TODO(ajoslin): This should be added in a better place later.
 */

angular.element.prototype.focus = angular.element.prototype.focus || function() {
  if (this.length) {
    this[0].focus();
  }
  return this;
};
angular.element.prototype.blur = angular.element.prototype.blur || function() {
  if (this.length) {
    this[0].blur();
  }
  return this;
};

})();
