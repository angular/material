(function() {
'use strict';

angular.module('material.core')
  .factory('$mdInkRipple', InkRippleService)
  .directive('mdInkRipple', InkRippleDirective)
  .directive('mdNoInk', attrNoDirective())
  .directive('mdNoBar', attrNoDirective())
  .directive('mdNoStretch', attrNoDirective());

  function InkRippleDirective($mdInkRipple) {
    return {
      controller: angular.noop,
      link: function (scope, element, attr) {
        if (attr.hasOwnProperty('mdInkRippleCheckbox')) {
          $mdInkRipple.attachCheckboxBehavior(scope, element);
        } else {
          $mdInkRipple.attachButtonBehavior(scope, element);
        }
      }
    };
  }

function InkRippleService($window, $timeout) {

  return {
    attachButtonBehavior: attachButtonBehavior,
    attachCheckboxBehavior: attachCheckboxBehavior,
    attach: attach
  };

  function attachButtonBehavior(scope, element) {
    return attach(scope, element, {
      center: element.hasClass('md-fab'),
      dimBackground: true
    });
  }

  function attachCheckboxBehavior(scope, element) {
    return attach(scope, element, {
      center: true,
      dimBackground: false
    });
  }

  function attach(scope, element, options) {
    if (element.controller('mdNoInk')) return angular.noop;

    var rippleContainer,
        controller = element.controller('mdInkRipple') || {},
        counter = 0,
        ripples = [],
        states = [],
        isActiveExpr = element.attr('md-highlight'),
        isActive = false,
        isHeld = false,
        node = element[0],
        hammertime = new Hammer(node),
        color = parseColor(element.attr('md-ink-ripple')) || parseColor($window.getComputedStyle(node).color || 'rgb(0, 0, 0)'),
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

    controller.createRipple = createRipple;

    if (isActiveExpr) {
      scope.$watch(
          function () {
            return scope.$eval(isActiveExpr);
          },
          function (newValue) {
            isActive = newValue;
            if (isActive) {
              if (ripples.length === 0) {
                createRipple(0, 0);
              }
            }
            angular.forEach(ripples, updateElement);
          }
      );
    }

    // Publish self-detach method if desired...
    return function detach() {
      hammertime.destroy();
      rippleContainer && rippleContainer.remove();
    };

      function parseColor(color) {
        if (!color) return;
        if (color.indexOf('rgba') === 0) return color;
        if (color.indexOf('rgb')  === 0) return rgbToRGBA(color);
        if (color.indexOf('#')    === 0) return hexToRGBA(color);

        /**
         *
         */
        function hexToRGBA(color) {
          var hex = color.charAt(0) === '#' ? color.substr(1) : color,
            dig = hex.length / 3,
            red = hex.substr(0, dig),
            grn = hex.substr(dig, dig),
            blu = hex.substr(dig * 2);
          if (dig === 1) {
            red += red;
            grn += grn;
            blu += blu;
          }
          return 'rgba(' + parseInt(red, 16) + ',' + parseInt(grn, 16) + ',' + parseInt(blu, 16) + ',0.1)';
        }

        /**
         *
         */
        function rgbToRGBA(color) {
          return color.replace(')', ', 0.1)').replace('(', 'a(')
        }

      }

    function removeElement(elem, wait) {
      ripples.splice(ripples.indexOf(elem), 1);
      if (ripples.length === 0) {
        rippleContainer && rippleContainer.css({ backgroundColor: '' });
      }
      $timeout(function () { elem.remove(); }, wait, false);
    }

    function updateElement(elem) {
      var index = ripples.indexOf(elem),
          state = states[index],
          elemIsActive = ripples.length > 1 ? false : isActive,
          elemIsHeld   = ripples.length > 1 ? false : isHeld;
      if (elemIsActive || state.animating || elemIsHeld) {
        elem.addClass('md-ripple-visible');
      } else {
        elem.removeClass('md-ripple-visible');
        removeElement(elem, 650);
      }
    }

      /**
       *
       * @returns {*}
       */
      function createRipple(left, top) {

      var container = getRippleContainer(),
          size = getRippleSize(),
          css = getRippleCss(size, left, top),
          elem = getRippleElement(css),
          index = ripples.indexOf(elem),
          state = states[index];

      state.animating = true;

      $timeout(function () {
        if (options.dimBackground) {
          container.css({ backgroundColor: color });
        }
        elem.addClass('md-ripple-placed md-ripple-scaled').css({ left: '50%', top: '50%' });
        updateElement(elem);
        $timeout(function () {
          state.animating = false;
          updateElement(elem);
        }, 225, false);
      }, 0, false);

      return elem;

        /**
         *
         * @returns {*}
         */
        function getRippleElement(css) {
          var elem = angular.element('<div class="md-ripple" data-counter="' + counter++ + '">');
          ripples.unshift(elem);
          states.unshift({ animating: true });
          container.append(elem);
          css && elem.css(css);
          return elem;
        }

        /**
         *
         * @returns {*}
         */
        function getRippleSize() {
          var width = container.prop('offsetWidth'),
            height = container.prop('offsetHeight'),
            multiplier, size;
        if (element.hasClass('md-menu-item')) {
          size = Math.sqrt( Math.pow(width, 2) + Math.pow(height, 2) );
        } else {
          multiplier = element.hasClass('md-fab') ? 1.1 : 0.8;
          size = Math.max(width, height) * multiplier;
        }
        return size;
      }

        /**
         *
         * @returns {{backgroundColor: *, width: string, height: string, marginLeft: string, marginTop: string}}
         */
        function getRippleCss(size, left, top) {
          var css = {
            backgroundColor: rgbaToRGB(color),
            width: size + 'px',
            height: size + 'px',
            marginLeft: (size * -0.5) + 'px',
            marginTop: (size * -0.5) + 'px'
          };

        contentParent && (top += contentParent.$element.prop('scrollTop'));

        if (options.center) {
          css.left = css.top = '50%';
        } else {
          var rect = node.getBoundingClientRect();
          css.left = Math.round((left - rect.left) / container.prop('offsetWidth') * 100) + '%';
          css.top = Math.round((top - rect.top) / container.prop('offsetHeight') * 100) + '%';
        }

          return css;

          /**
           *
           */
          function rgbaToRGB(color) {
            return color.replace('rgba', 'rgb').replace(/,[^\)\,]+\)/, ')');
          }
        }

        /**
         *
         */
        function getRippleContainer() {
          if (rippleContainer) return rippleContainer;
          var container = rippleContainer = angular.element('<div class="md-ripple-container">');
          element.append(container);
          return container;
        }
      }

      /**
       *
       */
      function onInput(ev) {
        var ripple, index;
        if (ev.eventType === Hammer.INPUT_START && ev.isFirst && isRippleAllowed()) {
          ripple = createRipple(ev.center.x, ev.center.y);
          isHeld = true;
        } else if (ev.eventType === Hammer.INPUT_END && ev.isFinal) {
          isHeld = false;
          index = ripples.length - 1;
          ripple = ripples[index];
          $timeout(function () {
            updateElement(ripple);
          }, 0, false);
        }

        /**
         *
         */
        function isRippleAllowed() {
          var parent = node.parentNode;
          return !node.hasAttribute('disabled') && !(parent && parent.hasAttribute('disabled'));
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
