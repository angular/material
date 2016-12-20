angular.module('material.core')
.factory('$mdConstant', MdConstantFactory);

/**
 * Factory function that creates the grab-bag $mdConstant service.
 * @ngInject
 */
function MdConstantFactory() {

  var prefixTestEl = document.createElement('div');
  var vendorPrefix = getVendorPrefix(prefixTestEl);
  var isWebkit = /webkit/i.test(vendorPrefix);
  var SPECIAL_CHARS_REGEXP = /([:\-_]+(.))/g;

  function vendorProperty(name) {
    // Add a dash between the prefix and name, to be able to transform the string into camelcase.
    var prefixedName = vendorPrefix + '-' + name;
    var ucPrefix = camelCase(prefixedName);
    var lcPrefix = ucPrefix.charAt(0).toLowerCase() + ucPrefix.substring(1);

    return hasStyleProperty(prefixTestEl, name)     ? name     :       // The current browser supports the un-prefixed property
           hasStyleProperty(prefixTestEl, ucPrefix) ? ucPrefix :       // The current browser only supports the prefixed property.
           hasStyleProperty(prefixTestEl, lcPrefix) ? lcPrefix : name; // Some browsers are only supporting the prefix in lowercase.
  }

  function hasStyleProperty(testElement, property) {
    return angular.isDefined(testElement.style[property]);
  }

  function camelCase(input) {
    return input.replace(SPECIAL_CHARS_REGEXP, function(matches, separator, letter, offset) {
      return offset ? letter.toUpperCase() : letter;
    });
  }

  function getVendorPrefix(testElement) {
    var prop, match;
    var vendorRegex = /^(Moz|webkit|ms)(?=[A-Z])/;

    for (prop in testElement.style) {
      if (match = vendorRegex.exec(prop)) {
        return match[0];
      }
    }
  }

  var self = {
    isInputKey : function(e) { return (e.keyCode >= 31 && e.keyCode <= 90); },
    isNumPadKey : function (e){ return (3 === e.location && e.keyCode >= 97 && e.keyCode <= 105); },
    isNavigationKey : function(e) {
      var kc = self.KEY_CODE, NAVIGATION_KEYS =  [kc.SPACE, kc.ENTER, kc.UP_ARROW, kc.DOWN_ARROW];
      return (NAVIGATION_KEYS.indexOf(e.keyCode) != -1);
    },

    /**
     * Maximum size, in pixels, that can be explicitly set to an element. The actual value varies
     * between browsers, but IE11 has the very lowest size at a mere 1,533,917px. Ideally we could
     * compute this value, but Firefox always reports an element to have a size of zero if it
     * goes over the max, meaning that we'd have to binary search for the value.
     */
    ELEMENT_MAX_PIXELS: 1533917,

    /**
     * Priority for a directive that should run before the directives from ngAria.
     */
    BEFORE_NG_ARIA: 210,

    /**
     * Common Keyboard actions and their associated keycode.
     */
    KEY_CODE: {
      COMMA: 188,
      SEMICOLON : 186,
      ENTER: 13,
      ESCAPE: 27,
      SPACE: 32,
      PAGE_UP: 33,
      PAGE_DOWN: 34,
      END: 35,
      HOME: 36,
      LEFT_ARROW : 37,
      UP_ARROW : 38,
      RIGHT_ARROW : 39,
      DOWN_ARROW : 40,
      TAB : 9,
      BACKSPACE: 8,
      DELETE: 46
    },

    /**
     * Vendor prefixed CSS properties to be used to support the given functionality in older browsers
     * as well.
     */
    CSS: {
      /* Constants */
      TRANSITIONEND: 'transitionend' + (isWebkit ? ' webkitTransitionEnd' : ''),
      ANIMATIONEND: 'animationend' + (isWebkit ? ' webkitAnimationEnd' : ''),

      TRANSFORM: vendorProperty('transform'),
      TRANSFORM_ORIGIN: vendorProperty('transformOrigin'),
      TRANSITION: vendorProperty('transition'),
      TRANSITION_DURATION: vendorProperty('transitionDuration'),
      ANIMATION_PLAY_STATE: vendorProperty('animationPlayState'),
      ANIMATION_DURATION: vendorProperty('animationDuration'),
      ANIMATION_NAME: vendorProperty('animationName'),
      ANIMATION_TIMING: vendorProperty('animationTimingFunction'),
      ANIMATION_DIRECTION: vendorProperty('animationDirection')
    },

    /**
     * As defined in core/style/variables.scss
     *
     * $layout-breakpoint-xs:     600px !default;
     * $layout-breakpoint-sm:     960px !default;
     * $layout-breakpoint-md:     1280px !default;
     * $layout-breakpoint-lg:     1920px !default;
     *
     */
    MEDIA: {
      'xs'        : '(max-width: 599px)'                         ,
      'gt-xs'     : '(min-width: 600px)'                         ,
      'sm'        : '(min-width: 600px) and (max-width: 959px)'  ,
      'gt-sm'     : '(min-width: 960px)'                         ,
      'md'        : '(min-width: 960px) and (max-width: 1279px)' ,
      'gt-md'     : '(min-width: 1280px)'                        ,
      'lg'        : '(min-width: 1280px) and (max-width: 1919px)',
      'gt-lg'     : '(min-width: 1920px)'                        ,
      'xl'        : '(min-width: 1920px)'                        ,
      'landscape' : '(orientation: landscape)'                   ,
      'portrait'  : '(orientation: portrait)'                    ,
      'print' : 'print'
    },

    MEDIA_PRIORITY: [
      'xl',
      'gt-lg',
      'lg',
      'gt-md',
      'md',
      'gt-sm',
      'sm',
      'gt-xs',
      'xs',
      'landscape',
      'portrait',
      'print'
    ]
  };

  return self;
}
