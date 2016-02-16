angular.module('material.core')
.factory('$mdConstant', MdConstantFactory);

/**
 * Factory function that creates the grab-bag $mdConstant service.
 * @ngInject
 */
function MdConstantFactory($sniffer) {

  var webkit = /webkit/i.test($sniffer.vendorPrefix);
  function vendorProperty(name) {
    return webkit ?  ('webkit' + name.charAt(0).toUpperCase() + name.substring(1)) : name;
  }

  return {
    KEY_CODE: {
      COMMA: 188,
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
    CSS: {
      /* Constants */
      TRANSITIONEND: 'transitionend' + (webkit ? ' webkitTransitionEnd' : ''),
      ANIMATIONEND: 'animationend' + (webkit ? ' webkitAnimationEnd' : ''),

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
      'xs'    : '(max-width: 599px)'                         ,
      'gt-xs' : '(min-width: 600px)'                         ,
      'sm'    : '(min-width: 600px) and (max-width: 959px)'  ,
      'gt-sm' : '(min-width: 960px)'                         ,
      'md'    : '(min-width: 960px) and (max-width: 1279px)' ,
      'gt-md' : '(min-width: 1280px)'                        ,
      'lg'    : '(min-width: 1280px) and (max-width: 1919px)',
      'gt-lg' : '(min-width: 1920px)'                        ,
      'xl'    : '(min-width: 1920px)'                        ,
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
      'print'
    ]
  };
}
