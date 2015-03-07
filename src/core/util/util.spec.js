describe('util', function() {
  beforeEach(module('material.core'));

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
      expect(originalFn.callCount).toBe(1);

      throttledFn();
      expect(originalFn.callCount).toBe(1);

      nowMockValue += delay;
      throttledFn();
      expect(originalFn.callCount).toBe(1);

      nowMockValue += 1;
      throttledFn();
      expect(originalFn.callCount).toBe(2);
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

  describe('capEvent', function () {
    var scope, parentSpy, childSpy, element;
    var template =
      '<div ng-click="onParentClick($event)">' +
        '<span id="sibling">Sibling</span>' +
        '<button ng-click="capEvent(onChildClick)($event, true)">Cap Event</button>' +
      '</div>';

    function createMockEvent(detail) {
      return new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        detail: detail !== undefined ? detail : -1,
        view: window
      });
    }

    beforeEach(inject(function ($compile, $mdUtil, $rootScope) {
      scope = $rootScope.$new();
      parentSpy = scope.onParentClick = jasmine.createSpy('parentSpy');
      childSpy = scope.onChildClick = jasmine.createSpy('childSpy');
      scope.capEvent = $mdUtil.capEvent;
      element = $compile(template)(scope);
      angular.element(document.body).append(element);
    }));

    afterEach(function () {
      element.remove();
      scope.$destroy();
    });

    it('should call `listener`, not ancestor event listeners', inject(function () {
      var childElement = element.find('button');

      childElement[0].dispatchEvent(createMockEvent());

      expect(childSpy).toHaveBeenCalled();
      expect(parentSpy).not.toHaveBeenCalled();
    }));

    it('should call `listener` with `scope` as the `this` object', inject(function () {
      var childElement = element.find('button');

      childElement[0].dispatchEvent(createMockEvent());

      var context = childSpy.calls[0].object;
      expect(context).toBe(scope);
    }));

    it("should call `listener` with the tiggering event as the first argument", inject(function () {
      var childElement = element.find('button');

      childElement[0].dispatchEvent(createMockEvent());

      var event = childSpy.calls[0].args[0];
      expect(event.target).toBe(childElement[0]);
      expect(event.type).toBe('click');
    }));

    it("should call `listener` with multiple arguments", inject(function () {
      var childElement = element.find('button');

      childElement[0].dispatchEvent(createMockEvent());

      var truth = childSpy.calls[0].args[1];
      expect(truth).toBe(true);
    }));

    it("should call parent event listener when sibling is clicked", inject(function () {
      var siblingElement = element.find('span');
      var dispatchable = new Event('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });

      siblingElement[0].dispatchEvent(dispatchable);

      expect(parentSpy).toHaveBeenCalled();
      expect(childSpy).not.toHaveBeenCalled();
    }));

    it("should call parent event listener when parent is clicked", inject(function () {
      var dispatchable = new Event('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });

      element[0].dispatchEvent(dispatchable);

      expect(parentSpy).toHaveBeenCalled();
      expect(childSpy).not.toHaveBeenCalled();
    }));
  })
});
