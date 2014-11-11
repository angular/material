(function() {
'use strict';

angular.module('material.core')
  .factory('$mdInkRipple', InkRippleService)
  .directive('mdInkRipple', InkRippleDirective)
  .directive('mdNoInk', attrNoDirective())
  .directive('mdNoBar', attrNoDirective())
  .directive('mdNoStretch', attrNoDirective());

function InkRippleDirective($mdInkRipple) {
  return function(scope, element, attr) {
    if (attr.mdInkRipple == 'checkbox') {
      $mdInkRipple.attachCheckboxBehavior(element);
    } else {
      $mdInkRipple.attachButtonBehavior(element);
    }
  };
}

function InkRippleService($window, $timeout) {

  return {
    attachButtonBehavior: attachButtonBehavior,
    attachCheckboxBehavior: attachCheckboxBehavior,
    attach: attach
  };

  function attachButtonBehavior(element) {
    return attach(element, {
      center: element.hasClass('md-fab'),
      dimBackground: true
    });
  }

  function attachCheckboxBehavior(element) {
    return attach(element, {
      center: true,
      dimBackground: false
    });
  }

  function attach(element, options) {

    if (element.controller('mdNoInk')) return angular.noop;

    var rippleContainer, rippleEl,
        node = element[0],
        hammertime = new Hammer(node),
        contentParent = element.controller('mdContent');

    options = angular.extend({
      mousedown: true,
      hover: true,
      focus: true,
      center: false,
      mousedownPauseTime: 150,
      dimBackground: false
    }, options || {});

    options.mousedown && hammertime.on('hammer.input', onInput);

    // Publish self-detach method if desired...
    return function detach() {
      hammertime.destroy();
      rippleContainer && rippleContainer.remove();
    };

    function rippleIsAllowed() {
      var parent;
      return !element[0].hasAttribute('disabled') &&
          !((parent = element[0].parentNode) && parent.hasAttribute('disabled'));
    }

    function removeElement(element, wait) {
      $timeout(function () {
        element.remove();
      }, wait, false);
    }

    function createRipple(left, top, positionsAreAbsolute) {

      var rippleEl = angular.element('<div class="md-ripple">');

      if (!rippleContainer) {
        rippleContainer = angular.element('<div class="md-ripple-container">');
        element.append(rippleContainer);
      }
      rippleContainer.append(rippleEl);

      var containerWidth = rippleContainer.prop('offsetWidth'),
          containerHeight = rippleContainer.prop('offsetHeight'),
          multiplier = element.hasClass('md-fab') ? 1.1 : 0.8,
          diagonalWidth = Math.max(containerWidth, containerHeight) * multiplier;

      if (contentParent) {
        top += contentParent.$element.prop('scrollTop');
      }

      var css = {
        backgroundColor: $window.getComputedStyle(rippleEl[0]).color ||  $window.getComputedStyle(node).color,
        width: diagonalWidth + 'px',
        height: diagonalWidth + 'px',
        marginLeft: (diagonalWidth * -0.5) + 'px',
        marginTop: (diagonalWidth * -0.5) + 'px'
      };

      if (options.center) {
        css.left = '50%';
        css.top = '50%';
      } else if (positionsAreAbsolute) {
        var elementRect = node.getBoundingClientRect();
        left -= elementRect.left;
        top -= elementRect.top;
        css.left = Math.round(left / containerWidth * 100) + '%';
        css.top = Math.round(top / containerHeight * 100) + '%';
      }

      rippleEl.css(css);

      //-- Use minimum timeout to trigger CSS animation
      $timeout(function () {
        if (options.dimBackground) {
          rippleContainer.addClass('md-ripple-full md-ripple-visible');
          rippleContainer.css({ backgroundColor: css.backgroundColor.replace(')', ', 0.1').replace('(', 'a(') });
        }
        rippleEl.addClass('md-ripple-placed md-ripple-visible md-ripple-scaled md-ripple-full');
        rippleEl.css({ left: '50%', top: '50%' });
        $timeout(function () {
          if (rippleEl) {
            rippleEl.removeClass('md-ripple-full');
            if (!rippleEl.hasClass('md-ripple-visible')) {
              removeElement(rippleEl, 650);
              rippleEl = null;
            }
          }
          rippleEl && rippleEl.removeClass('md-ripple-full');
          if (rippleContainer && options.dimBackground) {
            rippleContainer.removeClass('md-ripple-full');
            if (!rippleContainer.hasClass('md-ripple-visible')) rippleContainer.css({ backgroundColor: '' });
          }
        }, 225, false);
      }, 0, false);
      return rippleEl;
    }

    function onInput(ev) {
      if (ev.eventType === Hammer.INPUT_START && ev.isFirst && rippleIsAllowed()) {
        rippleEl = createRipple(ev.center.x, ev.center.y, true);
      } else if (ev.eventType === Hammer.INPUT_END && ev.isFinal) {
        if (rippleEl) {
          rippleEl.removeClass('md-ripple-visible');
          removeElement(rippleEl, 650);
          rippleEl = null;
        }
        if (rippleContainer && options.dimBackground) {
          rippleContainer.removeClass('md-ripple-visible');
          if (!rippleContainer.hasClass('md-ripple-full')) rippleContainer.css({ backgroundColor: '' });
        }
      }
    }
  }
}

/**
 * noink/nobar/nostretch directive: make any element that has one of
 * these attributes be given a controller, so that other directives can 
 * `require:` these and see if there is a `no<xxx>` parent attribute.
 *
 * @usage
 * <hljs lang="html">
 * <parent md-no-ink>
 *   <child detect-no>
 *   </child>
 * </parent>
 * </hljs>
 *
 * <hljs lang="js">
 * myApp.directive('detectNo', function() {
 *   return {
 *     require: ['^?mdNoInk', ^?mdNoBar'],
 *     link: function(scope, element, attr, ctrls) {
 *       var noinkCtrl = ctrls[0];
 *       var nobarCtrl = ctrls[1];
 *       if (noInkCtrl) {
 *         alert("the md-no-ink flag has been specified on an ancestor!");
 *       }
 *       if (nobarCtrl) {
 *         alert("the md-no-bar flag has been specified on an ancestor!");
 *       }
 *     }
 *   };
 * });
 * </hljs>
 */
function attrNoDirective() {
  return function() {
    return {
      controller: angular.noop
    };
  };
}
})();
