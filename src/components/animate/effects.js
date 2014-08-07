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
function MaterialEffects($animateSequence, $ripple, $rootElement, $position, $$rAF) {

  var styler = angular.isDefined( $rootElement[0].animate ) ? 'webAnimations' :
               angular.isDefined( window['TweenMax'] || window['TweenLite'] ) ? 'gsap'   :
               angular.isDefined( window['jQuery'] ) ? 'jQuery' : 'default';

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
  function popIn(element, parentElement, clickElement) {
    var startPos;
    var endPos = $position.positionElements(parentElement, element, 'center');
    if (clickElement) {
      var dialogPos = $position.position(element);
      var clickPos = $position.offset(clickElement);
      startPos = {
        left: clickPos.left - dialogPos.width / 2,
        top: clickPos.top - dialogPos.height / 2
      };
    } else {
      startPos = endPos;
    }

    element.css({
      '-webkit-transform': translateString(startPos.left, startPos.top, 0) + ' scale(0.2)',
      opacity: 0
    });
    
    // TODO once ngAnimateSequence bugs are fixed, this can be switched to use that
    $$rAF(function() {
      element.css({
        '-webkit-transform': '',
        opacity: ''
      });
      element.addClass('active');
    });
  }

  /**
   *
   *
   */
  function popOut(element, parentElement) {
    var endPos = $position.positionElements(parentElement, element, 'bottom-center');

    element.addClass('dialog-changing').css({
      '-webkit-transform': translateString(endPos.left, endPos.top, 0) + ' scale(0.5)',
      opacity: 0
    });
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
    var options  = calculateOptions(element, attrs);
    var tag =
      '<canvas ' +
        'class="material-ink-ripple {{classList}}"' +
        'style="top:{{top}}; left:{{left}}" >' +
      '</canvas>';

    element.replaceWith(
      angular.element( $interpolate(tag)(options) )
    );

    return function linkCanvas( scope, element ){

      var ripple, watchMouse,
          parent = element.parent(),
          makeRipple = $throttle({
            start : function() {
              ripple = ripple || $materialEffects.inkRipple( element[0], options );
              watchMouse = watchMouse || buildMouseWatcher(parent, makeRipple);

              // Ripples start with left mouseDowns (or taps)
              parent.on('mousedown', makeRipple);
            },
            throttle : function(e, done) {
              if ( effectAllowed() )
              {
                switch(e.type)
                {
                  case 'mousedown' :
                    // If not right- or ctrl-click...
                    if (!e.ctrlKey && (e.button !== RIGHT_BUTTON))
                    {
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
       * If the ripple canvas been removed from the DOM, then remove the `mousedown` listener.
       * If the ripple parent is disabled, then simply ignore the mousedown event.
       *
       * @returns {*|boolean}
       */
      function effectAllowed() {
        var allowed = isInkEnabled( element.scope() ) && angular.isDefined( element.parent()[0] );
        var isDisabled = allowed ? !!element.parent().attr('disabled') : true;

        if ( !allowed ) {
          parent.off('mousedown', makeRipple);
        }

        return !isDisabled;


        /**
         * Check scope chain for `inkEnabled` or `disabled` flags...
         */
        function isInkEnabled(scope) {
          return angular.isUndefined(scope) ? true :
            angular.isDefined(scope.disabled) ? !scope.disabled :
              angular.isDefined(scope.inkEnabled) ? scope.inkEnabled : true;
        }

      }

      /**
       * Build mouse event listeners for the specified element
       * @param element Angular element that will listen for bubbling mouseEvents
       * @param handlerFn Function to be invoked with the mouse event
       * @returns {Function}
       */
      function buildMouseWatcher(element, handlerFn) {
        // Return function to easily toggle on/off listeners
        return function watchMouse(active) {
          angular.forEach("mouseup,mouseleave".split(","), function(eventType) {
            var fn = active ? element.on : element.off;
            fn.apply(element, [eventType, handlerFn]);
          });
        }
      }
      /**
       * Convert the mouse down coordinates from `parent` relative
       * to `canvas` relative; needed since the event listener is on
       * the parent [e.g. tab element]
       */
      function localToCanvas(e)
      {
        var canvas = element[0].getBoundingClientRect();

        return  {
          x : e.clientX - canvas.left,
          y : e.clientY - canvas.top
        };
      }

    }

    function calculateOptions(element, attrs)
    {
      return angular.extend( getBounds(element), {
        classList : (attrs.class || ""),
        forceToCenter : (attrs.start == "center"),
        initialOpacity : getFloatValue( attrs, "initialOpacity" ),
        opacityDecayVelocity : getFloatValue( attrs, "opacityDecayVelocity" )
      });

      function getBounds(element) {
        var node = element[0];
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



}
