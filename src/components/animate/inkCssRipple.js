
angular.module('material.animations')

.directive('inkRipple', [
  '$mdInkRipple',
  InkRippleDirective
])

.factory('$mdInkRipple', [
  '$window',
  '$$rAF',
  '$mdEffects',
  '$timeout',
  '$mdUtil',
  InkRippleService
]);

function InkRippleDirective($mdInkRipple) {
  return function(scope, element, attr) {
    if (attr.inkRipple == 'checkbox') {
      $mdInkRipple.attachCheckboxBehavior(element);
    } else {
      $mdInkRipple.attachButtonBehavior(element);
    }
  };
}

function InkRippleService($window, $$rAF, $mdEffects, $timeout, $mdUtil) {

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
    var contentParent = element.controller('mdContent');

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
    var hammertime = new Hammer(node);

    if (options.mousedown) {
      hammertime.on('hammer.input', onInput);
    }

    // Publish self-detach method if desired...
    return function detach() {
      hammertime.destroy();
      if (rippleContainer) {
        rippleContainer.remove();
      }
    };

    function rippleIsAllowed() {
      return !element[0].hasAttribute('disabled');
    }

    function createRipple(left, top, positionsAreAbsolute) {

      var rippleEl = angular.element('<div class="md-ripple">')
            .css($mdEffects.ANIMATION_DURATION, options.animationDuration + 'ms')
            .css($mdEffects.ANIMATION_NAME, options.animationName)
            .css($mdEffects.ANIMATION_TIMING, options.animationTimingFunction)
            .on($mdEffects.ANIMATIONEND_EVENT, function() {
              rippleEl.remove();
            });

      if (!rippleContainer) {
        rippleContainer = angular.element('<div class="md-ripple-container">');
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

      if (contentParent) {
        top += contentParent.$element.prop('scrollTop');
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
      css[$mdEffects.ANIMATION_DURATION] = options.fadeoutDuration + 'ms';
      rippleEl.css(css);

      return rippleEl;
    }

    var pauseTimeout;
    var rippleEl;
    function onInput(ev) {
      if (ev.eventType === Hammer.INPUT_START && ev.isFirst && rippleIsAllowed()) {

        rippleEl = createRipple(ev.center.x, ev.center.y, true);
        pauseTimeout = $timeout(function() {
          rippleEl && rippleEl.css($mdEffects.ANIMATION_PLAY_STATE, 'paused');
        }, options.mousedownPauseTime, false);

        rippleEl.on('$destroy', function() {
          rippleEl = null;
        });

      } else if (ev.eventType === Hammer.INPUT_END && ev.isFinal) {
        $timeout.cancel(pauseTimeout);
        rippleEl && rippleEl.css($mdEffects.ANIMATION_PLAY_STATE, '');
      }
    }

  }

}
