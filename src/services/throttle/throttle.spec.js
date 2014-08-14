describe('ngThrottleSpec', function() {

  var $animate, body, $rootElement, $throttle, $timeout;

  beforeEach(module('material.services.throttle', 'material.animations'));

  beforeEach(inject(function(_$throttle_, _$timeout_, _$animate_, _$rootElement_, $document ){
    $throttle = _$throttle_;
    $timeout = _$timeout_;

    $animate = _$animate_;
    $rootElement = _$rootElement_;

    body = angular.element($document[0].body);
    body.append($rootElement);

  }));

  describe('use $throttle with no configurations', function() {
    var finished, started, ended;
    var done = function() { finished = true; };
    beforeEach( function() { finished = started = ended = false; });

    it("should start and end without configuration",function() {
      var process = $throttle()( done );

      $timeout.flush();

      expect(finished).toBe(true);
    });

    it("should run process function without throttle configuration",function() {
      var process = $throttle()( done );

      process("a");
      $timeout.flush();

      expect(finished).toBe(true);
    });

    it("should start and end with `done` callbacks",function() {
      var startFn = function(done){ started = true; done(); };
      var process = $throttle({start:startFn})( done );


      expect(process).toBeDefined();
      expect(started).toBe(false);

      $timeout.flush();     // flush start()

      expect(started).toBe(true);
      expect(finished).toBe(true);
    });

    it("should start and end withOUT `done` callbacks",function() {
      var startFn = function(){ started = true; };
      var endFn = function(){ ended = true; };
      var process = $throttle({start:startFn, end:endFn})( done );

      $timeout.flush();     // throttle()

      expect(started).toBe(true);
      expect(ended).toBe(true);
      expect(finished).toBe(true);
    });

    it("should start without throttle or end calls specified",function() {
      var startFn = function(){ started = true; };
      var throttledFn = $throttle({start:startFn})();

      $timeout.flush();

      expect(started).toBe(true);
    });

    it("should start but NOT end if throttle does not complete",function() {
      var startFn = function(){ started = true;},
      endFn = function(){ ended = true;};
      lockFn = function(done){ ; },  // do not callback for completion


      $throttle({start:startFn, throttle:lockFn, end:endFn})();

      $timeout.flush();

      expect(started).toBe(true);
      expect(ended).toBe(false);
    });

  });

  describe('use $throttle with synchronous processing', function() {

    it("should process n-times correctly",function() {
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

    it("should properly process with report callbacks",function() {
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

    it("should restart if already finished",function() {
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

  describe('use $throttle with exceptions', function() {

    it("should report error within start()", function() {
      var started = false;
      var error   = "";
      var fn = $throttle({start:function(done){
        started = true;
        throw new Error("fault_with_start");
      }})(null, function(fault){
        error = fault;
      });

      $timeout.flush();

      expect(started).toBe(true);
      expect(error).toNotBe("");
    });

    it("should report error within end()", function() {
      var ended = false, error = "";
      var config = { end : function(done){
        ended = true;
        throw new Error("fault_with_end");
      }};
      var captureError = function(fault) { error = fault; };


      $throttle(config)(null, captureError );
      $timeout.flush();

      expect(ended).toBe(true);
      expect(error).toNotBe("");
    });

    it("should report error within throttle()", function() {
      var count = 0, error = "";
      var config = { throttle : function(done){
        count += 1;
        switch(count)
        {
          case 1 :    break;
          case 2 :    throw new Error("fault_with_throttle");   break;
          case 3 :    done(); break;
        }
      }};
      var captureError = function(fault) { error = fault; };
      var fn = $throttle(config)(null, captureError );


      $timeout.flush();

      fn( 1 );
      fn( 2 );
      fn( 3 );

      expect(count).toBe(2);
      expect(error).toNotBe("");
    });

  });

  describe('use $throttle with async processing', function() {
    var finished = false;
    var done = function() { finished = true; };
    beforeEach( function() { finished = false; });

    it("should pass with async start()",function() {
      var sCount=0,
      startFn = function(){
        return $timeout(function(){
          sCount++;
        },100)
      },
      concat = $throttle({start:startFn})( done );

      concat("The ");
      concat("Hulk");
      $timeout.flush();

      expect(sCount).toBe(1);

    });

    it("should pass with async start(done)",function() {
      var sCount=0,
      startFn = function(done){
        return $timeout(function(){
          sCount++;
          done();
        },100)
      },
      concat = $throttle({start:startFn})( done );

      concat("The ");
      concat("Hulk");
      $timeout.flush();         // flush to begin 1st deferred start()

      expect(sCount).toBe(1);

    });

    it("should pass with async start(done) and end(done)",function() {
      var sCount=3, eCount= 0,
      startFn = function(done){
        return $timeout(function(){
          sCount--;
          done();
        },100)
      },
      endFn = function(done){
        return $timeout(function(){
          eCount++;
          done();
        },100)
      };

      $throttle({start:startFn, end:endFn})( done );
      $timeout.flush();                         // flush to begin 1st deferred start()
      $timeout.flush();                         // start()
      $timeout.flush();                         // end()

      expect(sCount).toBe(2);
      expect(eCount).toBe(1);
      expect(finished).toBe(true);


    });

    it("should pass with async start(done) and process(done)",function() {
      var title="",
      startFn = function(){
        return $timeout(function(){
          done();
        },200);
      },
      processFn = function(data, done){
        $timeout(function(){
          title += data;
        },400);
      },
      concat = $throttle({start:startFn, throttle:processFn})( done );

      $timeout.flush();     // start()
      concat("The ");   $timeout.flush();     // throttle(1)
      concat("Hulk");   $timeout.flush();     // throttle(2)

      expect(title).toBe("The Hulk");

    });

    it("should pass with async process(done) and restart with cancellable end",function() {
      var content="", numStarts= 0, numEnds = 0,
      startFn = function(done){
        numStarts++;
        done("start-done");
      },
      throttleFn = function(data, done){
        $timeout(function(){
          content += data;
          if ( data == "e" ) {
            done("throttle-done");
          }
        },400);
      },
      endFn = function(done){
        numEnds++;

        var procID = $timeout(function(){
          done("end-done");
        },500,false);

        return function() {
          $timeout.cancel( procID );
        };
      },
      concat = $throttle({ start:startFn, throttle:throttleFn, end:endFn })( done );

      $timeout.flush();     // flush to begin 1st start()

      concat("a");          // Build string...
      concat("b");
      concat("c");
      concat("d");
      concat("e");          // forces end()

      $timeout.flush();     // flush to throttle( 5x )
      $timeout(function(){

        concat("a");        // forces restart()
        concat("e");        // forces end()

      },400,false);
      $timeout.flush();     // flush() 278
      $timeout.flush();     // flush to throttle( 2x )


      expect(content).toBe("abcdeae");
      expect(numStarts).toBe(2);
      expect(numEnds).toBe(2);

    });
  });

  describe('use $throttle with inkRipple', function(){
    var finished, started, ended;
    var done = function() { finished = true; };
    beforeEach( function() { finished = started = ended = false; });


    function setup() {
      var el;
      var tmpl = '' +
        '<div style="width:50px; height:50px;">'+
        '<canvas class="material-ink-ripple" ></canvas>' +
        '</div>';

      inject(function($compile, $rootScope) {
        el = $compile(tmpl)($rootScope);
        $rootElement.append( el );
        $rootScope.$apply();
      });

      return el;
    }

    it('should start, animate, and end.', inject(function($compile, $rootScope, $materialEffects) {

      var cntr = setup(),
      canvas = cntr.find('canvas'),
      rippler, makeRipple, throttled = 0,
      config = {
        start : function() {
          rippler = rippler || $materialEffects.inkRipple( canvas[0] );
          cntr.on('mousedown', makeRipple);
          started = true;
        },
        throttle : function(e, done) {
          throttled += 1;

          switch(e.type)
          {
            case 'mousedown' :
              rippler.createAt( {x:25,y:25} );
            rippler.draw( done );
            break;

            default:
              break;
          }
        }
      }

      // prepare rippler wave function...

      makeRipple = $throttle(config)(done);
      $timeout.flush();
      expect(started).toBe(true);

      // trigger wave animation...

      cntr.triggerHandler("mousedown");

      // Allow animation to finish...

      $timeout(function(){
        expect(throttled).toBe(1);
        expect(ended).toBe(true);
        expect(finished).toBe(true);
      },10);

      // Remove from $rootElement

      cntr.remove();

    }));


  });

});
