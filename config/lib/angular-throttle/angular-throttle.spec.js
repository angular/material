describe('ngThrottleSpec', function() {

  var $animate, body, $rootElement, $throttle, $timeout;

  beforeEach(function() {
    module('ngAnimateSequence');
    module('ngMock');
    module('ngAnimateMock');
    module('ngThrottle');
  });

  beforeEach(inject(function(_$throttle_, _$timeout_, _$animate_, $document, _$rootElement_){
        $throttle = _$throttle_;
        $timeout = _$timeout_;

        $animate = _$animate_;
        body = angular.element($document[0].body);
        $rootElement = _$rootElement_;
  }));

  describe('$throttle with no configurations', function() {
    var finished, started, ended;
    beforeEach( function() { finished = started = ended = false; });

    it("should auto-start and auto-end without configuration",function() {
      var doneFn = function(){ finished = true; };
      var process = $throttle()( doneFn );

      $timeout.flush();

      expect(finished).toBe(true);
    });

    it("should run without configuration",function() {
      var doneFn = function(){ finished = true; };
      var process = $throttle()( doneFn );

      process("a");
      $timeout.flush();

      expect(finished).toBe(true);
    });

    it("should start and auto-end",function() {
      var startFn = function(done){ started = true; done(); };
      var process = $throttle({start:startFn})( function(){
        finished = true;
      });

      $timeout.flush();

      expect(started).toBe(true);
      expect(finished).toBe(true);
    });

    it("should start and auto-end without callbacks",function() {
      var startFn = function(){ started = true; };
      var endFn = function(){ ended = true; };
      var process = $throttle({start:startFn, end:endFn})( function(){
        finished = true;
      });

      $timeout.flush();

      expect(started).toBe(true);
      expect(ended).toBe(true);
      expect(finished).toBe(true);
    });

    it("should auto-start without throttle calls",function() {
      var startFn = function(){ started = true; };
      var throttledFn = $throttle({start:startFn})();

      expect(started).toBe(true);
    });

    it("should auto-start but not auto-end",function() {
      var startFn = function(){ started = true;},
          processFn = function(done){ ; },  // do not callback for completion
          endFn = function(){ ended = true;},
          throttledFn = $throttle({start:startFn, throttle:processFn, end:endFn})();

      $timeout.flush();

      expect(started).toBe(true);
      expect(ended).toBe(false);
    });

  });

  describe('$throttle with synchronous processing', function() {

    it("should process() correctly",function() {
      var wanted="The Hulk";
      var sCount=0, title="",
        startFn = function(){
          sCount++;
        },
        processFn = function(text, done){
          title += text;
          if ( title == wanted ) {
            // Conditional termination of throttle phase
            done();
          }
        };
        concat = $throttle({start:startFn, throttle:processFn})( );

      concat("The ");
      concat("Hulk");

      $timeout.flush();
      expect(title).toBe(wanted);
    });

    it("should process() and report() properly",function() {
      var pCount= 10, total, callCount= 0,
        processFn = function(count, done){
          pCount -= count;
          if ( pCount == 5 ) {

            // Conditional termination of throttle phase
            // report total value in callback
            done(pCount);
          }
        },
        /**
         * only called when ALL processing is done
         */
        reportFn = function(count){ total = count; callCount +=1;},
        subtract = $throttle({throttle:processFn})( );

      subtract(2, reportFn );
      subtract(3, reportFn );

      $timeout.flush();

      expect(total).toBe(5);
      expect(callCount).toBe(1);
    });

    it("should restart() if already finished",function() {
      var total= 0, started = 0,
          startFn = function(){
            started += 1;
          },
          processFn = function(count, done){
            total += count;
            done(); // !!finish throttling
          },
          add = $throttle({start:startFn, throttle:processFn})();

      add(1);   $timeout.flush();   // proceed to end()
      add(1);   $timeout.flush();   // proceed to end()
      add(1);   $timeout.flush();   // proceed to end()

      expect(total).toBe(3);
      expect(started).toBe(3); // restarted 1x
    });

  });


});
