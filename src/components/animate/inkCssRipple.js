
angular.module('material.animations')

.directive('inkRipple', [
  '$materialInkRipple',
  InkRippleDirective
])

.factory('$materialInkRipple', [
  '$window',
  '$$rAF',
  '$materialEffects',
  '$timeout',
  InkRippleService
]);

function InkRippleDirective($materialInkRipple) {
  return function(scope, element, attr) {
    if (attr.inkRipple == 'checkbox') {
      $materialInkRipple.attachCheckboxBehavior(element);
    } else {
      $materialInkRipple.attachButtonBehavior(element);
    }
  };
}

function InkRippleService($window, $$rAF, $materialEffects, $timeout) {

  // TODO fix this. doesn't support touch AND click devices (eg chrome pixel)
  var hasTouch = !!('ontouchend' in document);
  var POINTERDOWN_EVENT = hasTouch ? 'touchstart' : 'mousedown';
  var POINTERUP_EVENT = hasTouch ? 'touchend touchcancel' : 'mouseup mouseleave';

  return {
    attachButtonBehavior: attachButtonBehavior,
    attachCheckboxBehavior: attachCheckboxBehavior,
    attach: attach
  };

  function attachButtonBehavior(element) {
    return attach(element, {
      mousedown: true,
      center: false,
      animationDuration: 350,
      mousedownPauseTime: 175,
      animationName: 'inkRippleButton',
      animationTimingFunction: 'linear'
    });
  }

  function attachCheckboxBehavior(element) {
    return attach(element, {
      mousedown: true,
      center: true,
      animationDuration: 300,
      mousedownPauseTime: 180,
      animationName: 'inkRippleCheckbox',
      animationTimingFunction: 'linear'
    });
  }

  function attach(element, options) {
    // Parent element with noink attr? Abort.
    if (element.controller('noink')) return angular.noop;

    options = angular.extend({
      mousedown: true,
      hover: true,
      focus: true,
      center: false,
      animationDuration: 300,
      mousedownPauseTime: 150,
      animationName: '',
      animationTimingFunction: 'linear'
    }, options || {});

    var rippleContainer;
    var node = element[0];

    if (options.mousedown) {
      listenPointerDown(true);
    }

    // Publish self-detach method if desired...
    return function detach() {
      listenPointerDown(false);
      if (rippleContainer) {
        rippleContainer.remove();
      }
    };

    function listenPointerDown(shouldListen) {
      element[shouldListen ? 'on' : 'off'](POINTERDOWN_EVENT, onPointerDown);
    }

    function rippleIsAllowed() {
      return !Util.isParentDisabled(element);
    }

    function createRipple(left, top, positionsAreAbsolute) {

      var rippleEl = angular.element('<div class="material-ripple">')
            .css($materialEffects.ANIMATION_DURATION, options.animationDuration + 'ms')
            .css($materialEffects.ANIMATION_NAME, options.animationName)
            .css($materialEffects.ANIMATION_TIMING, options.animationTimingFunction)
            .on($materialEffects.ANIMATIONEND_EVENT, function() {
              rippleEl.remove();
            });

      if (!rippleContainer) {
        rippleContainer = angular.element('<div class="material-ripple-container">');
        element.append(rippleContainer);
      }
      rippleContainer.append(rippleEl);

      var containerWidth = rippleContainer.prop('offsetWidth');

      if (options.center) {
        left = containerWidth / 2;
        top = rippleContainer.prop('offsetHeight') / 2;
      } else if (positionsAreAbsolute) {
        var elementRect = node.getBoundingClientRect();
        left -= elementRect.left;
        top -= elementRect.top;
      }

      var css = {
        'background-color': $window.getComputedStyle(rippleEl[0]).color || 
          $window.getComputedStyle(node).color,
        'border-radius': (containerWidth / 2) + 'px',

        left: (left - containerWidth / 2) + 'px',
        width: containerWidth + 'px',

        top: (top - containerWidth / 2) + 'px',
        height: containerWidth + 'px'
      };
      css[$materialEffects.ANIMATION_DURATION] = options.fadeoutDuration + 'ms';
      rippleEl.css(css);

      return rippleEl;
    }

    function onPointerDown(ev) {
      if (!rippleIsAllowed()) return;

      var rippleEl = createRippleFromEvent(ev);
      var ripplePauseTimeout = $timeout(pauseRipple, options.mousedownPauseTime, false);
      rippleEl.on('$destroy', cancelRipplePause);

      // Stop listening to pointer down for now, until the user lifts their finger/mouse
      listenPointerDown(false);
      element.on(POINTERUP_EVENT, onPointerUp);

      function onPointerUp() {
        cancelRipplePause();
        rippleEl.css($materialEffects.ANIMATION_PLAY_STATE, 'running');
        element.off(POINTERUP_EVENT, onPointerUp);
        listenPointerDown(true);
      }
      function pauseRipple() {
        rippleEl.css($materialEffects.ANIMATION_PLAY_STATE, 'paused');
      }
      function cancelRipplePause() {
        $timeout.cancel(ripplePauseTimeout);
      }

      function createRippleFromEvent(ev) {
        ev = ev.touches ? ev.touches[0] : ev;
        return createRipple(ev.pageX, ev.pageY, true);
      }
    }
  }

}
