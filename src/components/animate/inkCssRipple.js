
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

  return {
    attachButtonBehavior: attachButtonBehavior,
    attachCheckboxBehavior: attachCheckboxBehavior,
    attach: attach,
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
      enableMousedown();
    }

    function rippleIsAllowed() {
      return !element.controller('noink') && !Util.isDisabled(element);
    }

    var hasTouch = !!('ontouchend' in document);
    function enableMousedown() {
      // TODO fix this. doesn't support touch AND click devices (eg chrome pixel)
      var POINTERDOWN_EVENT = hasTouch ? 'touchstart' : 'mousedown';
      var POINTERUP_EVENT = hasTouch ? 'touchend touchcancel' : 'mouseup mouseleave';

      if (!rippleIsAllowed()) return;

      element.on(POINTERDOWN_EVENT, onPointerDown);

      var pointerIsDown;
      function onPointerDown(ev) {
        if (pointerIsDown) return;
        pointerIsDown = true;

        element.one(POINTERUP_EVENT, function() {
          pointerIsDown = false;
        });

        var rippleEl = createRippleFromEvent(ev);

        var pointerCheckTimeout = $timeout(
          pauseRippleIfPointerDown,
          options.mousedownPauseTime,
          false
        );

        rippleEl.on('$destroy', cancelPointerCheck);

        function pauseRippleIfPointerDown() {
          if (pointerIsDown) {
            rippleEl.css($materialEffects.ANIMATION_PLAY_STATE, 'paused');
            element.one(POINTERUP_EVENT, function() {
              rippleEl.css($materialEffects.ANIMATION_PLAY_STATE, 'running');
            });
          }
        }
        function cancelPointerCheck() {
          $timeout.cancel(pointerCheckTimeout);
        }
      }
    }

    function createRippleFromEvent(ev) {
      ev = ev.touches ? ev.touches[0] : ev;
      return createRipple(ev.pageX, ev.pageY, true);
    }
    function createRipple(left, top, positionsAreAbsolute) {
      var elementRect = node.getBoundingClientRect();
      var elementStyle = $window.getComputedStyle(node);
      var finalSize = elementRect.width;

      var rippleEl = angular.element('<div class="material-ripple">')
        .css(
          $materialEffects.ANIMATION_DURATION,
          options.animationDuration + 'ms'
        )
        .css(
          $materialEffects.ANIMATION_NAME,
          options.animationName
        )
        .css(
          $materialEffects.ANIMATION_TIMING,
          options.animationTimingFunction
        )
        .on($materialEffects.ANIMATIONEND_EVENT, function() {
          rippleEl.remove();
        });

      if (!rippleContainer) {
        rippleContainer = angular.element('<div class="material-ripple-container">');
        element.append(rippleContainer);
      }
      rippleContainer.append(rippleEl);

      if (options.center) {
        left = rippleContainer.prop('offsetWidth') / 2;
        top = rippleContainer.prop('offsetHeight') / 2;
      } else if (positionsAreAbsolute) {
        left -= elementRect.left;
        top -= elementRect.top;
      }

      var rippleStyle = $window.getComputedStyle(rippleEl[0]);

      // TODO don't use px, make setRippleCss fix that
      var css = {
        'background-color': rippleStyle.color || elementStyle.color,
        'border-radius': (finalSize / 2) + 'px',

        left: (left - finalSize / 2) + 'px',
        width: finalSize + 'px',

        top: (top - finalSize / 2) + 'px',
        height: finalSize + 'px',
      };
      css[$materialEffects.ANIMATION_DURATION] = options.fadeoutDuration + 'ms';
      rippleEl.css(css);

      return rippleEl;
    }
  }

}
