describe('util', function() {
  beforeEach(module('material.core'));

  var $rootScope, $timeout, $$mdAnimate;
  beforeEach( inject(function(_$animate_,_$rootScope_,_$timeout_) {
      $animate = _$animate_;
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;
  }));

  describe('now',function(){

      it('returns proper values', inject(function($mdUtil, $timeout) {
        var t1 = $mdUtil.now(), t2;

        expect( t1 ).toBeGreaterThan(0);

        $timeout(function() {
          t2 = $mdUtil.now();
        },10,false);

        $timeout.flush();
        expect( t2 - t1 ).toBeGreaterThan(0);
      }));

    });

  describe('disconnect',function(){
    var disconnectScope, reconnectScope;
    beforeEach(inject(function($mdUtil) {
      disconnectScope = $mdUtil.disconnectScope;
      reconnectScope = $mdUtil.reconnectScope;
    }));

    it('disconnectScope events', inject(function($rootScope) {
      var scope1 = $rootScope.$new();

      var spy = jasmine.createSpy('eventSpy');
      scope1.$on('event', spy);

      disconnectScope(scope1);

      $rootScope.$broadcast('event');
      expect(spy).not.toHaveBeenCalled();

      reconnectScope(scope1);

      $rootScope.$broadcast('event');
      expect(spy).toHaveBeenCalled();
    }));

  });

  describe('throttle', function() {
    var delay = 500;
    var nowMockValue;
    var originalFn;
    var throttledFn;

    beforeEach(inject(function($mdUtil) {
      $mdUtil.now = function () { return nowMockValue; };
      originalFn = jasmine.createSpy('originalFn');
      throttledFn = $mdUtil.throttle(originalFn, delay);
      nowMockValue = 1;    // Not 0, to prevent `!recent` inside `throttle()` to
                           // evaluate to true even after `recent` has been set
    }));

    it('should immediately invoke the function on first call', function() {
      expect(originalFn).not.toHaveBeenCalled();
      throttledFn();
      expect(originalFn).toHaveBeenCalled();
    });

    it('should not invoke the function again before (delay + 1) milliseconds', function() {
      throttledFn();
      expect(originalFn.calls.count()).toBe(1);

      throttledFn();
      expect(originalFn.calls.count()).toBe(1);

      nowMockValue += delay;
      throttledFn();
      expect(originalFn.calls.count()).toBe(1);

      nowMockValue += 1;
      throttledFn();
      expect(originalFn.calls.count()).toBe(2);
    });

    it('should pass the context to the original function', inject(function($mdUtil) {
      var obj = {
        called: false,
        fn: function() { this.called = true; }
      };
      var throttled = $mdUtil.throttle(obj.fn, delay);

      expect(obj.called).toBeFalsy();
      throttled.call(obj);
      expect(obj.called).toBeTruthy();
    }));

    it('should pass the arguments to the original function', function() {
      throttledFn(1, 2, 3, 'test');
      expect(originalFn).toHaveBeenCalledWith(1, 2, 3, 'test');
    });
  });

  describe('nextTick', function () {
    it('should combine multiple calls into a single digest', inject(function ($mdUtil, $rootScope, $timeout) {
      var digestWatchFn = jasmine.createSpy('watchFn');
      var callback = jasmine.createSpy('callback');
      var timeout;
      $rootScope.$watch(digestWatchFn);
      expect(digestWatchFn).not.toHaveBeenCalled();
      expect(callback).not.toHaveBeenCalled();
      //-- Add a bunch of calls to prove that they are batched
      for (var i = 0; i < 10; i++) {
        timeout = $mdUtil.nextTick(callback);
        expect(timeout.$$timeoutId).toBeOfType('number');
      }
      $timeout.flush();
      expect(digestWatchFn).toHaveBeenCalled();
      //-- $digest seems to be called one extra time here
      expect(digestWatchFn.calls.count()).toBe(2);
      //-- but callback is still called more
      expect(callback.calls.count()).toBe(10);
    }));
    it('should return a timeout', inject(function ($mdUtil) {
      var timeout = $mdUtil.nextTick(angular.noop);
      expect(timeout.$$timeoutId).toBeOfType('number');
    }));
    it('should return the same timeout for multiple calls', inject(function ($mdUtil) {
      var a = $mdUtil.nextTick(angular.noop),
          b = $mdUtil.nextTick(angular.noop);
      expect(a).toBe(b);
    }));
  });

  function flush() {
    $rootScope.$digest();
    $animate.triggerCallbacks();
    $timeout.flush();
  }
});
