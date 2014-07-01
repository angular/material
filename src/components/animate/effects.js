angular.module('material.animations', ['ngAnimateStylers', 'ngAnimateSequence', 'ngAnimate'])

  .service('materialEffects', ['$animateSequence', 'canvasRenderer', function ($animateSequence, canvasRenderer) {

    var styler = angular.isDefined( window.TweenMax || window.TweenLite ) ? 'gsap'   :
                angular.isDefined( window.jQuery ) ? 'jQuery' : 'default';

    // Publish API for effects...
    return {
      ripple : rippleWithJS,   // rippleWithCSS,
      ink : animateInk
    }

    // **********************************************************
    // Private API Methods
    // **********************************************************

    /**
     * Use the canvas animator to render the ripple effect(s).
     */
    function rippleWithJS( canvas, options )
    {
      return canvasRenderer.ripple( canvas, options);
    }


    /**
     * Build the `ripple` CSS animation sequence and apply it to the specified
     * target element
     */
    function rippleWithCSS( element, config ) {
      var from = { left: config.x, top: config.y, opacity: config.opacity },
          to   = { 'border-width': config.d, 'margin-top': -config.d, 'margin-left': -config.d };

      var runner = $animateSequence({ styler: styler })
                      .addClass('ripple', from,  to )
                      .animate({ opacity: 0, duration: safeVelocity(config.fadeoutVelocity || 0.75) })
                      .revertElement();

      return runner.run(element, safeDuration(config.duration || 550));
    }

    /**
     * Make instance of a reusable sequence and
     * auto-run the sequence on the element (if defined)
     * @param styles
     * @param element
     * @param duration
     * @returns {*}
     */
    function animateInk(element, styles, duration ) {
      var sequence = $animateSequence({ styler: styler })
        .animate( {}, styles, safeDuration(duration || 350) );

      return angular.isDefined(element) ? sequence.run(element) : sequence;
    }

    // **********************************************************
    // Utility Methods
    // **********************************************************

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

  }])
  .directive('materialRipple', ['materialEffects', function (materialEffects) {
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
      var recenter = (attrs.start == "center");

      element.replaceWith(
        angular.element('<canvas class="material-ripple-canvas" ></canvas >')
      );

      return function( scope, element ){
        var parent = element.parent();
        var rippler = materialEffects.ripple( element[0] );


        // Configure so ripple wave starts a mouseUp location...
        parent.on('mousedown', onStartRipple);

        // **********************************************************
        // Mouse EventHandlers
        // **********************************************************

        function onStartRipple(e) {

          if ( inkEnabled( element.scope() )) {

            rippler.onMouseDown( !recenter ? localToCanvas(e) : null );
            parent.on('mouseup', onFinishRipple )
          }
        }

        function onFinishRipple( e ) {
          parent.off('mouseup', onFinishRipple);
          rippler.onMouseUp( e );
        }

        // **********************************************************
        // Utility Methods
        // **********************************************************

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
    }


    /**
     * Use CSS and Div element to animate a ripple effect
     * @param element
     * @returns {Function}
     */
    function compileWithDiv( element ) {

      element.after(angular.element('<div class="material-ripple-cursor"></div>'));
      element.remove();

      return function( scope, element, attrs ){
        var parent = element.parent();
        var parentNode = parent[0];

        // Configure so ripple wave starts a mouseUp location...
        parent.on('click', function showRipple(e) {
          if ( inkEnabled( element.scope() )) {
            var settings = angular.extend({}, attrs, {
              x: e.offsetX,
              y: e.offsetY,
              d: Math.max(parentNode.offsetWidth - e.offsetX, e.offsetX),
              tl: -Math.max(parentNode.offsetWidth - e.offsetX, e.offsetX),
              opacity: attrs.rippleOpacity || 0.6
            });

            // Perform ripple effect on `elCursor` element
            materialEffects.ripple(element, settings);
          }
        });

        /**
         * Check scope chain for `inkEnabled` or `disabled` flags...
         */
        function inkEnabled( scope ){
          return angular.isUndefined( scope )            ? true             :
            angular.isDefined( scope.inkEnabled )   ? scope.inkEnabled :
              angular.isDefined( scope.disabled     ) ? !scope.disabled  : true;
        }

      }
    }

  }]);
