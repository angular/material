(function() {
'use strict';

/*
 * TODO: Add support for multiple fingers on the `pointer` object (enables pinch gesture)
 */

var START_EVENTS = 'mousedown touchstart pointerdown';
var MOVE_EVENTS = 'mousemove touchmove pointermove';
var END_EVENTS = 'mouseup mouseleave touchend touchcancel pointerup pointercancel';
var HANDLERS;

document.contains || (document.contains = function(node) {
  return document.body.contains(node);
});

// TODO add windows phone to this
var userAgent = navigator.userAgent || navigator.vendor || window.opera;
var isIos = userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i);
var isAndroid = userAgent.match(/Android/i);
var shouldHijackClicks = isIos || isAndroid;

if (shouldHijackClicks) {
  document.addEventListener('click', function(ev) {
    // Space/enter on a button, and submit events, can send clicks
    var isKeyClick = ev.clientX === 0 && ev.clientY === 0;
    if (isKeyClick || ev.$material) return;

    // Prevent clicks unless they're sent by material
    ev.preventDefault();
    ev.stopPropagation();
  }, true);
}

angular.element(document)
  .on(START_EVENTS, gestureStart)
  .on(MOVE_EVENTS, gestureMove)
  .on(END_EVENTS, gestureEnd)
  // For testing
  .on('$$mdGestureReset', function() {
    lastPointer = pointer = null;
  });

// The state of the current and previous 'pointer' (user's hand)
var pointer, lastPointer;

function runHandlers(handlerEvent, event) {
  var handler;
  for (var handlerName in HANDLERS) {
    handler = HANDLERS[handlerName];
    if (handlerEvent === 'start') {
      // Run cancel to reset any handlers' state
      handler.cancel();
    }
    handler[handlerEvent](event, pointer);
  }
}

function gestureStart(ev) {
  // If we're already touched down, abort
  if (pointer) return;

  var now = +Date.now();

  // iOS & old android bug: after a touch event, a click event is sent 350 ms later.
  // If <400ms have passed, don't allow an event of a different type than the previous event
  if (lastPointer && !typesMatch(ev, lastPointer) && (now - lastPointer.endTime < 1500)) {
    return;
  }

  pointer = makeStartPointer(ev);

  runHandlers('start', ev);
}

function gestureMove(ev) {
  if (!pointer || !typesMatch(ev, pointer)) return;

  updatePointerState(ev, pointer);
  runHandlers('move', ev);
}

function gestureEnd(ev) {
  if (!pointer || !typesMatch(ev, pointer)) return;

  updatePointerState(ev, pointer);
  pointer.endTime = +Date.now();

  runHandlers('end', ev);

  lastPointer = pointer;
  pointer = null;
}

/******** Helpers *********/
function typesMatch(ev, pointer) {
  return ev && pointer && ev.type.charAt(0) === pointer.type;
}

function getEventPoint(ev) {
  ev = ev.originalEvent || ev; // support jQuery events
  return (ev.touches && ev.touches[0]) ||
    (ev.changedTouches && ev.changedTouches[0]) ||
    ev;
}

function updatePointerState(ev, pointer) {
  var point = getEventPoint(ev);
  var x = pointer.x = point.pageX;
  var y = pointer.y = point.pageY;

  pointer.distanceX = x - pointer.startX;
  pointer.distanceY = y - pointer.startY;
  pointer.distance = Math.sqrt(
    pointer.distanceX * pointer.distanceX + pointer.distanceY * pointer.distanceY
  );

  pointer.directionX = pointer.distanceX > 0 ? 'right' : pointer.distanceX < 0 ? 'left' : '';
  pointer.directionY = pointer.distanceY > 0 ? 'up' : pointer.distanceY < 0 ? 'down' : '';

  pointer.duration = +Date.now() - pointer.startTime;
  pointer.velocityX = pointer.distanceX / pointer.duration;
  pointer.velocityY = pointer.distanceY / pointer.duration;
}


function makeStartPointer(ev) {
  var point = getEventPoint(ev);
  var startPointer = {
    startTime: +Date.now(),
    target: ev.target,
    // 'p' for pointer, 'm' for mouse, 't' for touch
    type: ev.type.charAt(0)
  };
  startPointer.startX = startPointer.x = point.pageX;
  startPointer.startY = startPointer.y = point.pageY;
  return startPointer;
}

angular.module('material.core')
.run(function($mdGesture) {}) // make sure $mdGesture is always instantiated
.factory('$mdGesture', function($$MdGestureHandler, $$rAF, $timeout) {
  HANDLERS = {};

  if (shouldHijackClicks) {
    addHandler('click', {
      options: {
        maxDistance: 6
      },
      onEnd: function(ev, pointer) {
        if (pointer.distance < this.state.options.maxDistance) {
          this.dispatchEvent(ev, 'click');
        }
      }
    });
  }

  addHandler('press', {
    onStart: function(ev, pointer) {
      this.dispatchEvent(ev, '$md.pressdown');
    },
    onEnd: function(ev, pointer) {
      this.dispatchEvent(ev, '$md.pressup');
    }
  });


  addHandler('hold', {
    options: {
      // If the user keeps his finger within the same <maxDistance> area for
      // <delay> ms, dispatch a hold event.
      maxDistance: 6,
      delay: 500,
    },
    onCancel: function() {
      $timeout.cancel(this.state.timeout);
    },
    onStart: function(ev, pointer) {
      // For hold, require a parent to be registered with $mdGesture.register()
      // Because we prevent scroll events, this is necessary.
      if (!this.state.registeredParent) return this.cancel();

      this.state.pos = {x: pointer.x, y: pointer.y};
      this.state.timeout = $timeout(angular.bind(this, function holdDelayFn() {
        this.dispatchEvent(ev, '$md.hold');
        this.cancel(); //we're done!
      }), this.state.options.delay, false);
    },
    onMove: function(ev, pointer) {
      // Don't scroll while waiting for hold
      ev.preventDefault();
      var dx = this.state.pos.x - pointer.x;
      var dy = this.state.pos.y - pointer.y;
      if (Math.sqrt(dx*dx + dy*dy) > this.options.maxDistance) {
        this.cancel();
      }
    },
    onEnd: function(ev, pointer) {
      this.onCancel();
    },
  });

  addHandler('drag', {
    options: {
      minDistance: 6,
      horizontal: true,
    },
    onStart: function(ev) {
      // For drag, require a parent to be registered with $mdGesture.register()
      if (!this.state.registeredParent) this.cancel();
    },
    onMove: function(ev, pointer) {
      var shouldStartDrag, shouldCancel;
      // Don't allow touch events to scroll while we're dragging or
      // deciding if this touchmove is a proper drag
      ev.preventDefault();

      if (!this.state.dragPointer) {
        if (this.state.options.horizontal) {
          shouldStartDrag = Math.abs(pointer.distanceX) > this.state.options.minDistance;
          shouldCancel = Math.abs(pointer.distanceY) > this.state.options.minDistance * 1.5;
        } else {
          shouldStartDrag = Math.abs(pointer.distanceY) > this.state.options.minDistance;
          shouldCancel = Math.abs(pointer.distanceX) > this.state.options.minDistance * 1.5;
        }

        if (shouldStartDrag) {
          // Create a new pointer, starting at this point where the drag started.
          this.state.dragPointer = makeStartPointer(ev);
          updatePointerState(ev, this.state.dragPointer);
          this.dispatchEvent(ev, '$md.dragstart', this.state.dragPointer);

        } else if (shouldCancel) {
          this.cancel();
        }
      } else {
        this.dispatchDragMove(ev);
      }
    },
    // Only dispatch these every frame; any more is unnecessray
    dispatchDragMove: $$rAF.throttle(function(ev) {
      // Make sure the drag didn't stop while waiting for the next frame
      if (this.state.isRunning) {
        updatePointerState(ev, this.state.dragPointer);
        this.dispatchEvent(ev, '$md.drag', this.state.dragPointer);
      }
    }),
    onEnd: function(ev, pointer) {
      if (this.state.dragPointer) {
        updatePointerState(ev, this.state.dragPointer);
        this.dispatchEvent(ev, '$md.dragend', this.state.dragPointer);
      }
    }
  });

  addHandler('swipe', {
    options: {
      minVelocity: 0.65,
      minDistance: 10,
    },
    onEnd: function(ev, pointer) {
      if (Math.abs(pointer.velocityX) > this.state.options.minVelocity &&
          Math.abs(pointer.distanceX) > this.state.options.minDistance) {
        var eventType = pointer.directionX == 'left' ? '$md.swipeleft' : '$md.swiperight';
        this.dispatchEvent(ev, eventType);
      }
    }
  });

  var self;
  return self = {
    handler: addHandler,
    register: register
  };

  function addHandler(name, definition) {
    var handler = new $$MdGestureHandler(name);
    angular.extend(handler, definition);
    HANDLERS[name] = handler;
    return self;
  }

  function register(element, handlerName, options) {
    var handler = HANDLERS[ handlerName.replace(/^\$md./, '') ];
    if (!handler) {
      throw new Error('Failed to register element with handler ' + handlerName + '. ' +
                      'Available handlers: ' + Object.keys(HANDLERS).join(', '));
    }
    return handler.registerElement(element, options);
  }
})
.factory('$$MdGestureHandler', function($$rAF) {

  function GestureHandler(name) {
    this.name = name;
    this.state = {};
  }
  GestureHandler.prototype = {
    onStart: angular.noop,
    onMove: angular.noop,
    onEnd: angular.noop,
    onCancel: angular.noop,
    options: {},

    dispatchEvent: typeof window.jQuery !== 'undefined' && angular.element === window.jQuery ?
      jQueryDispatchEvent :
      nativeDispatchEvent,

    start: function(ev, pointer) {
      if (this.state.isRunning) return;
      var parentTarget = this.getNearestParent(ev.target);
      var parentTargetOptions = parentTarget && parentTarget.$mdGesture[this.name] || {};

      this.state = {
        isRunning: true,
        options: angular.extend({}, this.options, parentTargetOptions),
        registeredParent: parentTarget
      };
      this.onStart(ev, pointer);
    },
    move: function(ev, pointer) {
      if (!this.state.isRunning) return;
      this.onMove(ev, pointer);
    },
    end: function(ev, pointer) {
      if (!this.state.isRunning) return;
      this.onEnd(ev, pointer);
      this.state.isRunning = false;
    },
    cancel: function(ev, pointer) {
      this.onCancel(ev, pointer);
      this.state = {};
    },

    // Find and return the nearest parent element that has been registered via
    // $mdGesture.register(element, 'handlerName').
    getNearestParent: function(node) {
      var current = node;
      while (current) {
        if ( (current.$mdGesture || {})[this.name] ) {
          return current;
        }
        current = current.parentNode;
      }
    },

    registerElement: function(element, options) {
      var self = this;
      element[0].$mdGesture = element[0].$mdGesture || {};
      element[0].$mdGesture[this.name] = options || {};
      element.on('$destroy', onDestroy);

      return onDestroy;

      function onDestroy() {
        delete element[0].$mdGesture[self.name];
        element.off('$destroy', onDestroy);
      }
    },
  };

  function jQueryDispatchEvent(srcEvent, eventType, eventPointer) {
    eventPointer = eventPointer || pointer;
    var eventObj = new angular.element.Event(eventType)

    eventObj.$material = true;
    eventObj.pointer = eventPointer;
    eventObj.srcEvent = srcEvent;

    angular.extend(eventObj, {
      clientX: eventPointer.x,
      clientY: eventPointer.y,
      screenX: eventPointer.x,
      screenY: eventPointer.y,
      pageX: eventPointer.x,
      pageY: eventPointer.y,
      ctrlKey: srcEvent.ctrlKey,
      altKey: srcEvent.altKey,
      shiftKey: srcEvent.shiftKey,
      metaKey: srcEvent.metaKey
    });
    angular.element(eventPointer.target).trigger(eventObj);
  }

  /*
   * NOTE: nativeDispatchEvent is very performance sensitive.
   */
  function nativeDispatchEvent(srcEvent, eventType, eventPointer) {
    eventPointer = eventPointer || pointer;
    var eventObj;

    if (eventType === 'click') {
      eventObj = document.createEvent('MouseEvents');
      eventObj.initMouseEvent(
        'click', true, true, window, srcEvent.detail,
        eventPointer.x, eventPointer.y, eventPointer.x, eventPointer.y,
        srcEvent.ctrlKey, srcEvent.altKey, srcEvent.shiftKey, srcEvent.metaKey,
        srcEvent.button, srcEvent.relatedTarget || null
      );

    } else {
      eventObj = document.createEvent('CustomEvent');
      eventObj.initCustomEvent(eventType, true, true, {});
    }
    eventObj.$material = true;
    eventObj.pointer = eventPointer;
    eventObj.srcEvent = srcEvent;
    eventPointer.target.dispatchEvent(eventObj);
  }

  return GestureHandler;
});

})();
