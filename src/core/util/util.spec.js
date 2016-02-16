describe('util', function() {

  describe('with no overrides', function() {
    beforeEach(module('material.core'));

    var $rootScope, $timeout, $$mdAnimate;
    beforeEach(inject(function(_$animate_, _$rootScope_, _$timeout_) {
      $animate = _$animate_;
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;
    }));

    describe('now', function() {

      it('returns proper time values', inject(function($mdUtil, $timeout) {
        var t1 = $mdUtil.now();
        expect(t1).toBeGreaterThan(0);
      }));

    });

    describe('disconnect', function() {
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

    describe('supplant', function() {

      it('should replace with HTML arguments', inject(function($mdUtil) {
        var param1 = "", param2 = '' +
              '<md-content>' +
              '   <md-option ng-repeat="value in values" value="{{value}}">' +
              '      {{value}}  ' +
              '   </md-option>  ' +
              '</md-content>    ';
        var template = '<div class="md-select-menu-container"><md-select-menu {0}>{1}</md-select-menu></div>';
        var results = $mdUtil.supplant(template,[param1, param2]);
        var segment = '<md-select-menu >';  // After supplant() part of the result should be...

        expect( results.indexOf(segment) > -1 ).toBe(true);

      }));

    });

    describe('findFocusTarget', function() {

      it('should not find valid focus target', inject(function($rootScope, $compile, $mdUtil) {
        var widget = $compile('<div class="autoFocus"><button><img></button></div>')($rootScope);
            $rootScope.$apply();
        var target = $mdUtil.findFocusTarget(widget);

        expect(target).toBeFalsy();
      }));

      it('should find valid a valid focusTarget with "md-autofocus"', inject(function($rootScope, $compile, $mdUtil) {
        var widget = $compile('<div class="autoFocus"><button md-autofocus><img></button></div>')($rootScope);
            $rootScope.$apply();
        var target = $mdUtil.findFocusTarget(widget);

        expect(target[0].nodeName).toBe("BUTTON");
      }));

      it('should find valid a valid focusTarget with "md-auto-focus"', inject(function($rootScope, $compile, $mdUtil) {
        var widget = $compile('<div class="autoFocus"><button md-auto-focus><img></button></div>')($rootScope);
            $rootScope.$apply();
        var target = $mdUtil.findFocusTarget(widget);

        expect(target[0].nodeName).toBe("BUTTON");
      }));

      it('should find valid a valid focusTarget with "md-auto-focus" argument', inject(function($rootScope, $compile, $mdUtil) {
        var widget = $compile('<div class="autoFocus"><button md-autofocus><img></button></div>')($rootScope);
            $rootScope.$apply();
        var target = $mdUtil.findFocusTarget(widget,'[md-auto-focus]');

        expect(target[0].nodeName).toBe("BUTTON");
      }));

      it('should find valid a valid focusTarget with a deep "md-autofocus" argument', inject(function($rootScope, $compile, $mdUtil) {
        var widget = $compile('<div class="autoFocus"><md-sidenav><button md-autofocus><img></button></md-sidenav></div>')($rootScope);
            $rootScope.$apply();
        var target = $mdUtil.findFocusTarget(widget);

        expect(target[0].nodeName).toBe("BUTTON");
      }));

      it('should find valid a valid focusTarget with a deep "md-sidenav-focus" argument', inject(function($rootScope, $compile, $mdUtil) {
        var template = '' +
          '<div class="autoFocus">' +
          '  <md-sidenav>' +
          '    <button md-sidenav-focus>' +
          '      <img>' +
          '    </button>' +
          '  </md-sidenav>' +
          '</div>';
        var widget = $compile(template)($rootScope);
            $rootScope.$apply();
        var target = $mdUtil.findFocusTarget(widget,'[md-sidenav-focus]');

        expect(target[0].nodeName).toBe("BUTTON");
      }));
    });

    describe('extractElementByname', function() {

      it('should not find valid element', inject(function($rootScope, $compile, $mdUtil) {
        var widget = $compile('<div><md-button1><img></md-button1></div>')($rootScope);
            $rootScope.$apply();
        var target = $mdUtil.extractElementByName(widget, 'md-button');

        // Returns same element
        expect( target[0] === widget[0] ).toBe(true);
      }));

      it('should not find valid element for shallow scan', inject(function($rootScope, $compile, $mdUtil) {
        var widget = $compile('<div><md-button><img></md-button></div>')($rootScope);
        $rootScope.$apply();
        var target = $mdUtil.extractElementByName(widget, 'md-button');

        expect( target[0] !== widget[0] ).toBe(false);
      }));

      it('should find valid element for deep scan', inject(function($rootScope, $compile, $mdUtil) {
        var widget = $compile('<div><md-button><img></md-button></div>')($rootScope);
        $rootScope.$apply();
        var target = $mdUtil.extractElementByName(widget, 'md-button', true);

        expect( target !== widget ).toBe(true);
      }));
    });

    describe('throttle', function() {
      var delay = 500;
      var nowMockValue;
      var originalFn;
      var throttledFn;

      beforeEach(inject(function($mdUtil) {
        $mdUtil.now = function() {
          return nowMockValue;
        };
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
          fn: function() {
            this.called = true;
          }
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

    describe('nextTick', function() {
      it('should combine multiple calls into a single digest', inject(function($mdUtil, $rootScope, $timeout) {
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
      it('should return a timeout', inject(function($mdUtil) {
        var timeout = $mdUtil.nextTick(angular.noop);
        expect(timeout.$$timeoutId).toBeOfType('number');
      }));
      it('should return the same timeout for multiple calls', inject(function($mdUtil) {
        var a = $mdUtil.nextTick(angular.noop),
          b = $mdUtil.nextTick(angular.noop);
        expect(a).toBe(b);
      }));
    });

    describe('hasComputedStyle', function () {
      describe('with expected value', function () {
        it('should return true for existing and matching value', inject(function($window, $mdUtil) {
          spyOn($window, 'getComputedStyle').and.callFake(function() {
            return { 'color': 'red' };
          });

          var elem = angular.element('<span style="color: red"></span>');

          expect($mdUtil.hasComputedStyle(elem, 'color', 'red')).toBe(true);
        }));

        it('should return false for existing and not matching value', inject(function($window, $mdUtil) {
          spyOn($window, 'getComputedStyle').and.callFake(function() {
            return { 'color': 'red' };
          });

          var elem = angular.element('<span style="color: red"></span>');

          expect($mdUtil.hasComputedStyle(elem, 'color', 'blue')).toBe(false);
        }));
      });

      describe('without expected value', function () {
        it('should return true for existing key', inject(function($window, $mdUtil) {
          spyOn($window, 'getComputedStyle').and.callFake(function() {
            return { 'color': 'red' };
          });

          var elem = angular.element('<span style="color: red"></span>');

          expect($mdUtil.hasComputedStyle(elem, 'color')).toBe(true);
        }));

        it('should return false for not existing key', inject(function($window, $mdUtil) {
          spyOn($window, 'getComputedStyle').and.callFake(function() {
            return { 'color': 'red' };
          });

          var elem = angular.element('<span style="color: red"></span>');

          expect($mdUtil.hasComputedStyle(elem, 'height')).toBe(false);
        }));
      });
    });

    describe('getParentWithPointerEvents', function () {
      describe('with wrapper with pointer events style element', function () {
        it('should find the parent element and return it', inject(function($window, $mdUtil) {
          spyOn($window, 'getComputedStyle').and.callFake(function(target) {
            return target === wrapper[0] ? { 'pointer-events':'none' } : {};
          });

          var elem = angular.element('<span></span>');
          var wrapper = angular.element('<div style="pointer-events:none;"></div>');
          var parent = angular.element('<div></div>');

          wrapper.append(elem);
          parent.append(wrapper);

          // Scan up the DOM tree to find nearest parent with point-events !== none
          // This means we should skip the wrapper node.

          expect($mdUtil.getParentWithPointerEvents(elem)[0]).toBe(parent[0]);
        }));
      });

      describe('with wrapper without pointer events style element', function () {
        it('should find the wrapper element and return it', inject(function($window, $mdUtil) {
          spyOn($window, 'getComputedStyle').and.callFake(function(elem) {
            return {};
          });

          var elem = angular.element('<span></span>');
          var wrapper = angular.element('<div id="wrapper"></div>');
          var parent = angular.element('<div></div>');

          wrapper.append(elem);
          parent.append(wrapper);

          expect($mdUtil.getParentWithPointerEvents(elem)[0]).toBe(wrapper[0]);
        }));
      });
    });

    describe('getNearestContentElement', function () {
      describe('with rootElement as parent', function () {
        it('should find stop at the rootElement and return it', inject(function($rootElement, $mdUtil) {
          var elem = angular.element('<span></span>');
          var wrapper = angular.element('<div></div>');

          wrapper.append(elem);
          $rootElement.append(wrapper);

          expect($mdUtil.getNearestContentElement(elem)).toBe($rootElement[0]);
        }));
      });

      describe('with document body as parent', function () {
        it('should find stop at the document body and return it', inject(function($mdUtil) {
          var elem = angular.element('<span></span>');
          var wrapper = angular.element('<div></div>');
          var body = angular.element(document.body);

          wrapper.append(elem);
          body.append(wrapper);

          expect($mdUtil.getNearestContentElement(elem)).toBe(body[0]);
        }));
      });

      describe('with md-content as parent', function () {
        it('should find stop at md-content element and return it', inject(function($mdUtil) {
          var elem = angular.element('<span></span>');
          var wrapper = angular.element('<div></div>');
          var content = angular.element('<md-content></md-content>');

          wrapper.append(elem);
          content.append(wrapper);

          expect($mdUtil.getNearestContentElement(elem)).toBe(content[0]);
        }));
      });

      describe('with no rootElement, body or md-content as parent', function () {
        it('should return null', inject(function($mdUtil) {
          var elem = angular.element('<span></span>');
          var wrapper = angular.element('<div></div>');

          wrapper.append(elem);

          expect($mdUtil.getNearestContentElement(elem)).toBe(null);
        }));
      });
    });

    it('should use scope argument and `scope.$$destroyed` to skip the callback', inject(function($mdUtil) {
      var callBackUsed, callback = function(){ callBackUsed = true; };
      var scope = $rootScope.$new(true);

      $mdUtil.nextTick(callback,false,scope);
      scope.$destroy();

      flush(function(){ expect( callBackUsed ).toBeUndefined(); });
    }));

    it('should use scope argument and `!scope.$$destroyed` to invoke the callback', inject(function($mdUtil) {
       var callBackUsed, callback = function(){ callBackUsed = true; };
       var scope = $rootScope.$new(true);

       $mdUtil.nextTick(callback,false,scope);
       flush(function(){ expect( callBackUsed ).toBe(true); });
     }));

    function flush(expectation) {
      $rootScope.$digest();
      $timeout.flush();
      expectation && expectation();
    }
  });

  describe('processTemplate', function() {
    it('should return exact template when using the default start/end symbols', inject(function($mdUtil) {
        var output = $mdUtil.processTemplate('<some-tag>{{some-var}}</some-tag>');

        expect(output).toEqual('<some-tag>{{some-var}}</some-tag>');
      })
    );
  });

  describe('with $interpolate.start/endSymbol override', function() {

    describe('processTemplate', function() {
      beforeEach(function() {
        module(function($interpolateProvider) {
            $interpolateProvider.startSymbol('[[');
            $interpolateProvider.endSymbol(']]');
        });
        module('material.core');
      });

      it('should replace the start/end symbols', inject(function($mdUtil) {
        var output = $mdUtil.processTemplate('<some-tag>{{some-var}}</some-tag>');

        expect(output).toEqual('<some-tag>[[some-var]]</some-tag>');
      }));
    });
  });
});
