/**
 * @ngdoc module
 * @name material.components.animate
 * @description
 *
 * Ink and Popup Effects
 */
angular.module('material.animations', [
  'ngAnimateStylers', 
  'ngAnimateSequence', 
  'material.services.position',
  'material.services.throttle'
])
  .service('$materialEffects', [ 
    '$animateSequence', 
    '$rootElement', 
    '$position', 
    '$$rAF', 
    '$sniffer',
    MaterialEffects
  ]);

/**
 * @ngdoc service
 * @name $materialEffects
 * @module material.components.animate
 *
 * @description
 * The `$materialEffects` service provides a simple API for various
 * Material Design effects.
 *
 * @returns A `$materialEffects` object with the following properties:
 * - `{function(element,styles,duration)}` `inkBar` - starts ink bar
 * animation on specified DOM element
 * - `{function(element,parentElement,clickElement)}` `popIn` - animated show of element overlayed on parent element
 * - `{function(element,parentElement)}` `popOut` - animated close of popup overlay
 *
 */
function MaterialEffects($animateSequence, $rootElement, $position, $$rAF, $sniffer) {

  var styler = angular.isDefined( $rootElement[0].animate ) ? 'webAnimations' :
               angular.isDefined( window['TweenMax'] || window['TweenLite'] ) ? 'gsap'   :
               angular.isDefined( window['jQuery'] ) ? 'jQuery' : 'default';

  var webkit = /webkit/i.test($sniffer.vendorPrefix);
  function vendorProperty(name) {
    return webkit ? 
      ('webkit' + name.charAt(0).toUpperCase() + name.substring(1)) :
      name;
  }

  var self;
  // Publish API for effects...
  return self = {
    popIn: popIn,
    popOut: popOut,

    /* Constants */
    TRANSITIONEND_EVENT: 'transitionend' + (webkit ? ' webkitTransitionEnd' : ''),
    ANIMATIONEND_EVENT: 'animationend' + (webkit ? ' webkitAnimationEnd' : ''),

    TRANSFORM: vendorProperty('transform'),
    TRANSITION: vendorProperty('transition'),
    TRANSITION_DURATION: vendorProperty('transitionDuration'),
    ANIMATION_PLAY_STATE: vendorProperty('animationPlayState'),
    ANIMATION_DURATION: vendorProperty('animationDuration'),
    ANIMATION_NAME: vendorProperty('animationName'),
    ANIMATION_TIMING: vendorProperty('animationTimingFunction'),
    ANIMATION_DIRECTION: vendorProperty('animationDirection')
  };

  // **********************************************************
  // API Methods
  // **********************************************************

  /**
   *
   */
  function popIn(element, parentElement, clickElement, done) {
    parentElement.append(element);

    var startPos;
    if (clickElement) {
      var clickPos = $position.offset(clickElement);
      startPos = translateString(
        clickPos.left - element[0].offsetWidth / 2,
        clickPos.top - element[0].offsetHeight / 2, 
        0
      ) + ' scale(0.2)';
    } else {
      startPos = 'translate3d(0,100%,0) scale(0.5)';
    }

    element
      .css(self.TRANSFORM, startPos)
      .css('opacity', 0);
    
    $$rAF(function() {
      $$rAF(function() {
        element
          .addClass('active')
          .css(self.TRANSFORM, '')
          .css('opacity', '')
          .on(self.TRANSITIONEND_EVENT, finished);
      });
    });

    function finished(ev) {
      //Make sure this transitionend didn't bubble up from a child
      if (ev.target === element[0]) {
        element.off(self.TRANSITIONEND_EVENT, finished);
        (done || angular.noop)();
      }
    }
  }

  /**
   *
   *
   */
  function popOut(element, parentElement, done) {
    var endPos = $position.positionElements(parentElement, element, 'bottom-center');

    element.css({
      '-webkit-transform': translateString(endPos.left, endPos.top, 0) + ' scale(0.5)',
      opacity: 0
    });
    element.on(self.TRANSITIONEND_EVENT, finished);

    function finished(ev) {
      //Make sure this transitionend didn't bubble up from a child
      if (ev.target === element[0]) {
        element.off(self.TRANSITIONEND_EVENT, finished);
        (done || angular.noop)();
      }
    }
  }


  // **********************************************************
  // Utility Methods
  // **********************************************************


  function translateString(x, y, z) {
    return 'translate3d(' + Math.floor(x) + 'px,' + Math.floor(y) + 'px,' + Math.floor(z) + 'px)';
  }


  /**
   * Support values such as 0.65 secs or 650 msecs
   */
  function safeDuration(value) {
    var duration = isNaN(value) ? 0 : Number(value);
    return (duration < 1.0) ? (duration * 1000) : duration;
  }

  /**
   * Convert all values to decimal;
   * eg 150 msecs -> 0.15sec
   */
  function safeVelocity(value) {
    var duration = isNaN(value) ? 0 : Number(value);
    return (duration > 100) ? (duration / 1000) :
      (duration > 10 ) ? (duration / 100) :
        (duration > 1  ) ? (duration / 10) : duration;
  }

}

