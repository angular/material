(function() {

  angular.module('material.animations')
    .directive('materialRipple', [
      '$materialEffects',
      '$interpolate',
      '$throttle',
      MaterialRippleDirective
    ]);

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

        var options  = calculateOptions(element, attrs);
        var tag =
          '<canvas ' +
            'class="material-ink-ripple {{classList}}"' +
            'style="top:{{top}}; left:{{left}}" >' +
          '</canvas>';

        element.replaceWith(
          angular.element( $interpolate(tag)(options) )
        );

      return function postLink( scope, element, attrs, noinkCtrl ) {
        if ( noinkCtrl ) return;

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
              if ( !Util.isDisabled(element) ) {
                switch(e.type) {
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
          };
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

      };

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


})();
