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
    '$ripple', 
    '$rootElement', 
    '$position', 
    '$$rAF', 
    '$sniffer',
    MaterialEffects
  ])
  .directive('materialRipple', [
    '$materialEffects', 
    '$interpolate', 
    '$throttle', 
    MaterialRippleDirective
  ]);

/**
 * @ngdoc service
 * @name $materialEffects
 * @module material.components.animate
 *
 * @description
 * The `$materialEffects` service provides a simple API for various
 * Material Design effects:
 *
 * 1) to animate ink bars and ripple effects, and
 * 2) to perform popup open/close effects on any DOM element.
 *
 * @returns A `$materialEffects` object with the following properties:
 * - `{function(canvas,options)}` `inkRipple` - Renders ripple ink
 * waves on the specified canvas
 * - `{function(element,styles,duration)}` `inkBar` - starts ink bar
 * animation on specified DOM element
 * - `{function(element,parentElement,clickElement)}` `popIn` - animated show of element overlayed on parent element
 * - `{function(element,parentElement)}` `popOut` - animated close of popup overlay
 *
 */
function MaterialEffects($animateSequence, $ripple, $rootElement, $position, $$rAF, $sniffer) {

  var styler = angular.isDefined( $rootElement[0].animate ) ? 'webAnimations' :
               angular.isDefined( window['TweenMax'] || window['TweenLite'] ) ? 'gsap'   :
               angular.isDefined( window['jQuery'] ) ? 'jQuery' : 'default';

 
  var isWebkit = /webkit/i.test($sniffer.vendorPrefix);
  var TRANSFORM_PROPERTY = isWebkit ? 'webkitTransform' : 'transform';
  var TRANSITIONEND_EVENT = 'transitionend' + 
    (isWebkit ? ' webkitTransitionEnd' : '');

  // Publish API for effects...
  return {
    inkRipple: animateInkRipple,
    inkBar: animateInkBar,
    popIn: popIn,
    popOut: popOut
  };

  // **********************************************************
  // API Methods
  // **********************************************************

  /**
   * Use the canvas animator to render the ripple effect(s).
   */
  function animateInkRipple( canvas, options )
  {
    return new $ripple(canvas, options);
  }


  /**
   * Make instance of a reusable sequence and
   * auto-run the sequence on the element (if defined)
   */
  function animateInkBar(element, styles, duration ) {
    var animate = $animateSequence({ styler: styler }).animate,
      sequence = animate( {}, styles, safeDuration(duration || 350) );

    return angular.isDefined(element) ? sequence.run(element) : sequence;
  }


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
      .css(TRANSFORM_PROPERTY, startPos)
      .css('opacity', 0);
    
    $$rAF(function() {
      $$rAF(function() {
        element
          .addClass('active')
          .css(TRANSFORM_PROPERTY, '')
          .css('opacity', '')
          .on(TRANSITIONEND_EVENT, finished);
      });
    });

    function finished(ev) {
      //Make sure this transitionend didn't bubble up from a child
      if (ev.target === element[0]) {
        element.off(TRANSITIONEND_EVENT, finished);
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
    element.on(TRANSITIONEND_EVENT, finished);

    function finished(ev) {
      //Make sure this transitionend didn't bubble up from a child
      if (ev.target === element[0]) {
        element.off(TRANSITIONEND_EVENT, finished);
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

/**
 * @ngdoc directive
 * @name materialRipple
 * @module material.components.animate
 *
 * @restrict E
 *
 * @description
 * The `<material-ripple/>` directive implements the Material Design ripple ink effects within a specified
 * parent container.
 *
 * @param {string=} start Indicates where the wave ripples should originate in the parent container area.
 * 'center' will force the ripples to always originate in the horizontal and vertical.
 * @param {number=} initial-opacity Value indicates the initial opacity of each ripple wave
 * @param {number=} opacity-decay-velocity Value indicates the speed at which each wave will fade out
 *
 * @usage
 * ```
 * <hljs lang="html">
 *   <material-ripple initial-opacity="0.9" opacity-decay-velocity="0.89"></material-ripple>
 * </hljs>
 * ```
 */
function MaterialRippleDirective($materialEffects, $interpolate, $throttle) {
  return {
    restrict: 'E',
    require: '^?noink',
    compile: compileWithCanvas
  };

  /**
   * Use Javascript and Canvas to render ripple effects
   *
   * Note: attribute start="" has two (2) options: `center` || `pointer`; which
   * defines the start of the ripple center.
   *
   * @param element
   * @returns {Function}
   */
  function compileWithCanvas( element, attrs ) {
    var RIGHT_BUTTON = 2;

    return function linkCanvas( scope, element, attr, noinkCtrl ){
      if (noinkCtrl) {
        return;
      }

      var options  = calculateOptions(element, attr);
      var tag =
        '<canvas ' +
          'class="material-ink-ripple {{classList}}"' +
          'style="top:{{top}}; left:{{left}}" >' +
        '</canvas>';
      
      var canvas = angular.element( $interpolate(tag)(options) );
      element.replaceWith(canvas);

      var ripple, watchMouse,
          parent = canvas.parent(),
          makeRipple = $throttle({
            start : function() {
              ripple = ripple || $materialEffects.inkRipple( canvas[0], options );
              watchMouse = watchMouse || buildMouseWatcher(parent, makeRipple);

              // Ripples start with left mouseDowns (or taps)
              parent.on('mousedown', makeRipple);
            },
            throttle : function(e, done) {
              if ( !Util.ancestorHasAttribute(canvas, 'disabled') ) {
                switch(e.type) {
                  case 'mousedown' :
                    // If not right- or ctrl-click...
                    if (!e.ctrlKey && (e.button !== RIGHT_BUTTON)) {
                      watchMouse(true);
                      ripple.createAt( options.forceToCenter ? null : localToCanvas(e) );
                    }
                    break;

                  default:
                    watchMouse(false);

                    // Draw of each wave/ripple in the ink only occurs
                    // on mouseup/mouseleave
                    ripple.draw( done );
                    break;
                }
              } else {
                done();
              }
            },
            end : function() {
              watchMouse(false);
            }
          })();


      // **********************************************************
      // Utility Methods
      // **********************************************************

      /**
       * Build mouse event listeners for the specified canvas
       * @param canvas Angular canvas that will listen for bubbling mouseEvents
       * @param handlerFn Function to be invoked with the mouse event
       * @returns {Function}
       */
      function buildMouseWatcher(canvas, handlerFn) {
        // Return function to easily toggle on/off listeners
        return function watchMouse(active) {
          angular.forEach("mouseup,mouseleave".split(","), function(eventType) {
            var fn = active ? canvas.on : canvas.off;
            fn.apply(canvas, [eventType, handlerFn]);
          });
        }
      }
      /**
       * Convert the mouse down coordinates from `parent` relative
       * to `canvas` relative; needed since the event listener is on
       * the parent [e.g. tab canvas]
       */
      function localToCanvas(e) {
        var canvas = canvas[0].getBoundingClientRect();

        return  {
          x : e.clientX - canvas.left,
          y : e.clientY - canvas.top
        };
      }

    }

    function calculateOptions(canvas, attrs) {
      return angular.extend( getBounds(canvas), {
        classList : (attrs.class || ""),
        forceToCenter : (attrs.start == "center"),
        initialOpacity : getFloatValue( attrs, "initialOpacity" ),
        opacityDecayVelocity : getFloatValue( attrs, "opacityDecayVelocity" )
      });
    }

    function getBounds(canvas) {
      var node = canvas[0];
      var styles  =  node.ownerDocument.defaultView.getComputedStyle( node, null ) || { };

      return  {
        left : (styles.left == "auto" || !styles.left) ? "0px" : styles.left,
        top : (styles.top == "auto" || !styles.top) ? "0px" : styles.top,
        width : getValue( styles, "width" ),
        height : getValue( styles, "height" )
      };
    }

    function getFloatValue( map, key, defaultVal )
    {
      return angular.isDefined( map[key] ) ? +map[key] : defaultVal;
    }

    function getValue( map, key, defaultVal )
    {
      var val = map[key];
      return (angular.isDefined( val ) && (val !== ""))  ? map[key] : defaultVal;
    }

  }



}
