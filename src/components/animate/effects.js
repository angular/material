angular.module('material.animations', ['ngAnimateStylers', 'ngAnimateSequence', 'ngAnimate'])
       .service('materialEffects', [ '$animateSequence','$canvasRenderer', '$rootElement', '$position', '$$rAF', MaterialEffects])
       .directive('materialRipple', ['materialEffects', '$interpolate', MaterialRippleDirective]);

/**
 * This service provides animation features for various Material Design effects:
 *
 *  1) ink stretchBars,
 *  2) ink ripples,
 *  3) popIn animations
 *  4) popOuts animations
 *
 * @constructor
 */
function MaterialEffects($animateSequence, $canvasRenderer, $rootElement, $position, $$rAF) {

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
    return $canvasRenderer.ripple( canvas, options);
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

    // TODO once ngAnimateSequence bugs are fixed, this can be switched to use that
    element.css({
      '-webkit-transform': translateString(startPos.left, startPos.top, 0) + ' scale(0.2)',
      opacity: 0
    });
    $$rAF(function() {
      element.addClass('dialog-changing');
      $$rAF(function() {
        element.css({
          '-webkit-transform': translateString(endPos.left, endPos.top, 0) + ' scale(1.0)',
          opacity: 1
        });
      });
    });
  }

  /**
   *
   *
   */
  function popOut(element, parentElement) {
    var endPos = $position.positionElements(parentElement, element, 'bottom-center');

    endPos.top -= element.prop('offsetHeight') / 2;

    var runner = $animateSequence({ styler: styler })
      .addClass('dialog-changing')
      .then(function() {
        element.css({
          '-webkit-transform': translateString(endPos.left, endPos.top, 0) + ' scale(0.5)',
          opacity: 0
        });
      });

    return runner.run(element);
  }


  // **********************************************************
  // Utility Methods
  // **********************************************************


  function translateString(x, y, z) {
    return 'translate3d(' + x + 'px,' + y + 'px,' + z + 'px)';
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
 *  <material-ripple /> Directive
 */
function MaterialRippleDirective(materialEffects, $interpolate) {
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
    var options  = calculateOptions();
    var tag =
      '<canvas ' +
      'class="material-ripple-canvas {{classList}}"' +
      'style="top:{{top}}; left:{{left}}" >' +
      '</canvas>';

    element.replaceWith(
      angular.element( $interpolate(tag)(options) )
    );

    return function( scope, element ){
      var parent = element.parent();
      var rippler = materialEffects.inkRipple( element[0], options );
      var activateListeners = configureListeners(parent, onFinishRipple);


      // Configure so ripple wave starts a mouseUp location...
      parent.on('mousedown', onStartRipple);


      // **********************************************************
      // Mouse EventHandlers
      // **********************************************************

      function onStartRipple(e) {

        if ( inkEnabled( element.scope() )) {
          activateListeners(true);
          rippler.onMouseDown( options.forceToCenter ? null : localToCanvas(e) );
        }
      }

      function onFinishRipple( e ) {
        activateListeners(false);
        rippler.onMouseUp( localToCanvas(e) );
      }

      // **********************************************************
      // Utility Methods
      // **********************************************************

      /**
       * Build mouse event listeners for the specified element
       * @param parent
       * @param handlerFn
       * @returns {Function}
       */
      function configureListeners(element, handlerFn) {
        return function(active) {
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

      /**
       * Check scope chain for `inkEnabled` or `disabled` flags...
       */
      function inkEnabled(scope) {
        return angular.isUndefined(scope) ? true :
          angular.isDefined(scope.disabled) ? !scope.disabled :
            angular.isDefined(scope.inkEnabled) ? scope.inkEnabled : true;
      }

    }

    function calculateOptions()
    {
      return angular.mixin( getBounds(element), {
        forceToCenter : (attrs.start == "center"),
        classList : (attrs.class || ""),
        opacityDecayVelocity : getFloatValue( attrs, "opacityDecayVelocity" ),
        initialOpacity : getFloatValue( attrs, "initialOpacity" )
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
