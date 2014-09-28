(function() {

  /**
   * @ngdoc module
   * @name material.components.swipe
   * @description Swipe module!
   */
  angular.module('material.components.swipe',['ng'])

    /**
     * @ngdoc directive
     * @module material.components.swipe
     * @name $materialSwipe
     *
     *  This service allows directives to easily attach swipe and pan listeners to
     *  the specified element.
     *
     * @private
     */
    .factory("$materialSwipe", function() {

      // match expected API functionality
      var attachNoop = function(){ return angular.noop; };

      /**
       * SwipeService constructor pre-captures scope and customized event types
       *
       * @param scope
       * @param eventTypes
       * @returns {*}
       * @constructor
       */
      return function SwipeService(scope, eventTypes) {
        if ( !eventTypes ) eventTypes = "swipeleft swiperight";

        // publish configureFor() method for specific element instance
        return function configureFor(element, onSwipeCallback, attachLater ) {
          var hammertime = new Hammer(element[0], {
            recognizers : addRecognizers([], eventTypes )
          });

          // Attach swipe listeners now
          if ( !attachLater ) attachSwipe();

          // auto-disconnect during destroy
          scope.$on('$destroy', function() {
            hammertime.destroy();
          });

          return attachSwipe;

          // **********************
          // Internal methods
          // **********************

          /**
           * Delegate swipe event to callback function
           * and ensure $digest is triggered.
           *
           * @param ev HammerEvent
           */
          function swipeHandler(ev) {

            // Prevent triggering parent hammer listeners
            ev.srcEvent.stopPropagation();

            if ( angular.isFunction(onSwipeCallback) ) {
              scope.$apply(function() {
                onSwipeCallback(ev);
              });
            }
          }

          /**
           * Enable listeners and return detach() fn
           */
          function attachSwipe() {
            hammertime.on(eventTypes, swipeHandler );

            return function detachSwipe() {
              hammertime.off( eventTypes );
            };
          }

          /**
           * Add optional recognizers such as panleft, panright
           */
          function addRecognizers(list, events) {
            var hasPanning = (events.indexOf("pan") > -1);
            var hasSwipe   = (events.indexOf("swipe") > -1);

            if (hasPanning) {
              list.push([ Hammer.Pan, { direction: Hammer.DIRECTION_HORIZONTAL } ]);
            }
            if (hasSwipe) {
              list.push([ Hammer.Swipe, { direction: Hammer.DIRECTION_HORIZONTAL } ]);
            }

            return list;
          }

        };
      };
    })

    /**
     * @ngdoc directive
     * @module material.components.swipe
     * @name materialSwipeLeft
     *
     * @order 0
     * @restrict A
     *
     * @description
     * The `<div  material-swipe-left="<expression" >` directive identifies an element on which
     * HammerJS horizontal swipe left and pan left support will be active. The swipe/pan action
     * can result in custom activity trigger by evaluating `<expression>`.
     *
     * @param {boolean=} noPan Use of attribute indicates flag to disable detection of `panleft` activity
     *
     * @usage
     * <hljs lang="html">
     *
     * <div class="animate-switch-container"
     *      ng-switch on="data.selectedIndex"
     *      material-swipe-left="data.selectedIndex+=1;"
     *      material-swipe-right="data.selectedIndex-=1;" >
     *
     * </div>
     * </hljs>
     *
     */
    .directive("materialSwipeLeft", ['$parse', '$materialSwipe',
      function MaterialSwipeLeft($parse, $materialSwipe) {
        return {
          restrict: 'A',
          link :  swipePostLink( $parse, $materialSwipe, "SwipeLeft" )
        };
      }])

    /**
     * @ngdoc directive
     * @module material.components.swipe
     * @name materialSwipeRight
     *
     * @order 1
     * @restrict A
     *
     * @description
     * The `<div  material-swipe-right="<expression" >` directive identifies functionality
     * that attaches HammerJS horizontal swipe right and pan right support to an element. The swipe/pan action
     * can result in activity trigger by evaluating `<expression>`
     *
     * @param {boolean=} noPan Use of attribute indicates flag to disable detection of `panright` activity
     *
     * @usage
     * <hljs lang="html">
     *
     * <div class="animate-switch-container"
     *      ng-switch on="data.selectedIndex"
     *      material-swipe-left="data.selectedIndex+=1;"
     *      material-swipe-right="data.selectedIndex-=1;" >
     *
     * </div>
     * </hljs>
     *
     */
    .directive( "materialSwipeRight", ['$parse', '$materialSwipe',
      function MaterialSwipeRight($parse, $materialSwipe) {
        return {
          restrict: 'A',
          link: swipePostLink( $parse, $materialSwipe, "SwipeRight" )
        };
      }
    ]);

    /**
     * Factory to build PostLink function specific to Swipe or Pan direction
     *
     * @param $parse
     * @param $materialSwipe
     * @param name
     * @returns {Function}
     */
    function swipePostLink($parse, $materialSwipe, name ) {

      return function(scope, element, attrs) {
        var direction = name.toLowerCase();
        var directiveName= "material" + name;

        var parentGetter = $parse(attrs[directiveName]) || angular.noop;
        var configureSwipe = $materialSwipe(scope, direction);
        var requestSwipe = function(locals) {
          // build function to request scope-specific swipe response
          parentGetter(scope, locals);
        };

        configureSwipe( element, function onHandleSwipe(ev) {
          if ( ev.type == direction ) {
            requestSwipe();
          }
        });

      }
    }

})();



