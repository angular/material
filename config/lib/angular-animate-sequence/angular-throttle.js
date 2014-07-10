angular.module('ngThrottle', ['ng'])

  /**
   *
   *   var canvas, rippler;
   *   var th = $throttle({
   *   	start : function( done  ) {
   *          rippler = canvasRenderer.ripple( canvas, options);
   *          $animate.addClass(canvasElement, ‘grow’, done);
   *   	},
   *   	throttle : function(data, done) {
   *   	      rippler.onMouseDown( data.startAt, done );
   *    },
   *   	end : function myFinish( done ) {
   *   	      rippler = null;
   *          $animate.removeClass(canvasElement, ‘grow’, done);
   *   	}
   *   })(done, otherwise);
   *
   *
   *   canvas.parent.$on('mousedown', function(e) {
   *      th({ startAt: localToCanvas(e) });
   *   });
   *
   */
  .factory( "$throttle", ['$timeout', '$$q', '$log', function ($timeout, $$q, $log) {

      var STATE_READY= 0, STATE_START=1, STATE_THROTTLE=2, STATE_END=3;

      return function( config ){
        return function( done, otherwise ){
          return buildInstance( angular.extend({}, config), done || angular.noop, otherwise || angular.noop )
        };
      };

      function buildInstance( phases, done, otherwise ) {
        var pendingActions = [ ],
            cancel = angular.noop,
            state = STATE_READY;

        start();

        return throttle;

        /**
         * Facade function that validates throttler
         * state BEFORE processing the `throttle` request.
         */
        function throttle( data, done ) {

          if ( state != STATE_THROTTLE ) {
              cacheRquest();
          }

          switch( state )
          {
            case STATE_READY :
              start();
              break;

            case STATE_START:
              break;

            // Proxy throttle call to custom, user-defined throttle handler
            case STATE_THROTTLE:
              invokeThrottleHandler(data, done);
              break;

            case STATE_END :
              restart();
              break;
          }

          // **********************************************************
          // Internal Methods
          // **********************************************************

          /**
           *  Cache for later submission to 'throttle()'
           */
          function cacheRquest() {
            pendingActions.push({ data:data, done:done });
          }


          function invokeThrottleHandler(data, done) {

            if ( angular.isFunction(phases.throttle) ) {
              done = done || angular.noop;

              phases.throttle.apply( null, [data, function(response) {
                done.apply( null, [response] );
                end();
              }]);

            } else {
              end();
            }
          }
        }


        /**
         * Initiate the async `start` phase of the Throttler
         * @returns {*} promise
         */
        function start() {
          return gotoState.apply(null, [ STATE_START, phases.start ] )
                          .then( feedPendingActions );

          /**
           * Process all pending actions (if any)
           */
          function feedPendingActions( response ) {
            if ( angular.isDefined(response) ) {
              $log.debug(response);
            }

            state = STATE_THROTTLE;

            angular.forEach(pendingActions, function (it) {
              throttle( it.data, function(response) {
                if ( angular.isDefined(response) ) {
                  $log.debug(response);
                }

                if ( angular.isFunction(it.done) ) {
                  it.done(response);
                }
              });
            });

            pendingActions = [];
          }
        }

        /**
         * Initiate the async `end` phase of the Throttler
         * @returns {*} promise
         */
        function end() {

          return gotoState.apply(null,[ STATE_END, phases.end ])
                          .then( finish, otherwise );

          /**
           * Mark throttle as ready to start... and announce completion
           * of the current activity cycle
           */
          function finish( response ) {
            if ( angular.isDefined(response) ) {
              $log.debug(response);
            }

            if ( state == STATE_END ){
              state = STATE_READY;
              done();
            }
          }

        }

        /**
         * Cancel any end promise and restart state processes
         */
        function restart() {
          try {

            (cancel || angular.noop)();
            state = STATE_READY;

          } finally {

            start();
          }
        }

        /**
         * Change to next state and call the state function associated with that state...
         * @param nextState
         * @param targetFn
         * @returns {*}
         */
        function gotoState( nextState , targetFn  )
        {

          var dfd = $$q.defer(),
              hasAction = angular.isFunction(targetFn),
              fn =  hasAction ? targetFn : resolved;

          try {

            state = nextState;
            cancel = fn.apply( null, [ hasAction ? callbackToResolve(dfd) : dfd ] );

          } catch( error ) {
            dfd.reject( error );
          }

          return dfd.promise;
        }

      }

      // **********************************************************
      // Internal Methods
      // **********************************************************

      /**
       * Create callback function that will resolve the specified deferred.
       * @param dfd
       * @returns {Function}
       */
      function callbackToResolve( dfd )
      {
        return function(response){
          dfd.resolve.apply(null, [response ]);
        }
      }

      /**
       * Prepare fallback promise for start, end, throttle phases of the Throttler
       * @param dfd
       * @returns {*}
       */
      function resolved(dfd)
      {
        dfd = dfd || $$q.defer();
        dfd.resolve.apply(null, arguments.length > 1 ? [].slice.call(arguments,1) : [ ]);

        return dfd.promise;
      }


  }]);




