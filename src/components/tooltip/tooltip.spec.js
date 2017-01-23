describe('MdTooltip Component', function() {
  var $compile, $rootScope, parentScope, $material, $timeout, $mdPanel, $$mdTooltipRegistry;
  var element;

  var injectLocals = function($injector) {
    $compile = $injector.get('$compile');
    $rootScope = $injector.get('$rootScope');
    parentScope = $rootScope.$new();
    $material = $injector.get('$material');
    $timeout = $injector.get('$timeout');
    $mdPanel = $injector.get('$mdPanel');
    $$mdTooltipRegistry = $injector.get('$$mdTooltipRegistry');
  };

  // Test filter for ensuring tooltip expressions are evaluated against the correct scope.
  angular.module('fullNameFilter', []).filter('fullName', function() {
    return function(user) {
      return user.name.first + ' ' + user.name.last;
    }
  });

  beforeEach(function() {
    module(
      'material.components.tooltip',
      'material.components.button',
      'fullNameFilter'
    );

    inject(injectLocals);
  });

  afterEach(function() {
    // Make sure to remove/cleanup after each test.
    element.remove();
    var scope = element && element.scope();
    scope && scope.$destroy;
    element = undefined;
  });

  it('should support dynamic directions', function() {
    expect(function() {
      buildTooltip(
        '<md-button>' +
          'Hello' +
          '<md-tooltip md-direction="{{direction}}">Tooltip</md-tooltip>' +
        '</md-button>'
      );
    }).not.toThrow();
  });

  it('should set the position to "bottom" if it is undefined', function() {
    buildTooltip(
      '<md-button>' +
        '<md-tooltip md-visible="true">Tooltip</md-tooltip>' +
      '</md-button>'
    );

    expect(findTooltip()).toHaveClass('md-origin-bottom');
  });

  it('should not re-templatize tooltip content', function() {
    parentScope.name = '{{2 + 2}}';

    buildTooltip(
      '<md-button>' +
        '<md-tooltip md-visible="true">{{name}}</md-tooltip>' +
      '</md-button>'
    );

    expect(findTooltip().text()).toBe('{{2 + 2}}');
  });

  it('should evaluate expressions against the parent scope', function() {
    parentScope.user = {name: {first: 'Neil', last: 'Diamond'}};

    // Using a filter that dereferences the user object multiple times will cause an error to be
    // thrown if user is not given correctly.
    buildTooltip(
      '<md-button>' +
        '<md-tooltip md-visible="true">{{user | fullName}}</md-tooltip>' +
      '</md-button>'
    );

    expect(findTooltip().text()).toBe('Neil Diamond');
  });

  it('should preserve parent text', function() {
    buildTooltip(
      '<md-button>' +
        'Hello' +
        '<md-tooltip md-visible="testModel.isVisible">Tooltip</md-tooltip>' +
      '</md-button>'
    );

    expect(element.text()).toBe('Hello');
  });

  it('should label parent', function() {
    buildTooltip(
      '<md-button>' +
        '<md-tooltip md-visible="testModel.isVisible">' +
          'Tooltip' +
        '</md-tooltip>' +
      '</md-button>'
    );

    expect(element.attr('aria-label')).toEqual('Tooltip');
  });

  it('should interpolate the aria-label', function() {
    buildTooltip(
      '<md-button>' +
        '<md-tooltip>{{ "hello" | uppercase }}</md-tooltip>' +
      '</md-button>'
    );

    expect(element.attr('aria-label')).toBe('HELLO');
  });

  it('should update the aria-label when the interpolated value changes',
      function() {
        buildTooltip(
          '<md-button>' +
            '<md-tooltip>{{ testModel.ariaText }}</md-tooltip>' +
          '</md-button>'
        );

        parentScope.$apply(function() {
          parentScope.testModel.ariaText = 'test 1';
        });

        expect(element.attr('aria-label')).toBe('test 1');

        parentScope.$apply(function() {
          parentScope.testModel.ariaText = 'test 2';
        });

        expect(element.attr('aria-label')).toBe('test 2');
      });
  
  it('should not interpolate interpolated values', function() {
    buildTooltip(
        '<md-button>' +
         '<md-tooltip>{{ testModel.ariaTest }}</md-tooltip>' +
        '</md-button>'
      );

      parentScope.$apply(function() {
        parentScope.testModel.ariaTest = 'test {{1+1}}';
      });

      expect(element.attr('aria-label')).toBe('test {{1+1}}');

      parentScope.$apply(function() {
        parentScope.testModel.ariaTest = 'test {{1+1336}}';
      });

      expect(element.attr('aria-label')).toBe('test {{1+1336}}');
  });

  it('should not set parent to items with no pointer events',
      inject(function($window) {
        spyOn($window, 'getComputedStyle').and.callFake(function(el) {
          return { 'pointer-events': el ? 'none' : '' };
        });

        buildTooltip(
          '<outer>' +
            '<inner>' +
              '<md-tooltip md-visible="testModel.isVisible">' +
                'Hello world' +
              '</md-tooltip>' +
            '</inner>' +
          '</outer>'
        );

        triggerEvent('mouseenter', true);
        expect(parentScope.testModel.isVisible).toBeUndefined();
      }));

  it('should show after tooltipDelay ms', function() {
    buildTooltip(
      '<md-button>' +
        'Hello' +
        '<md-tooltip md-visible="testModel.isVisible" md-delay="99">' +
          'Tooltip' +
        '</md-tooltip>' +
      '</md-button>'
    );

    triggerEvent('focus', true);
    expect(parentScope.testModel.isVisible).toBeFalsy();

    // Wait 1 below delay, nothing should happen
    $timeout.flush(98);
    expect(parentScope.testModel.isVisible).toBeFalsy();

    // Total 300 == tooltipDelay
    $timeout.flush(1);
    expect(parentScope.testModel.isVisible).toBe(true);
  });

  it('should register itself with the $$mdTooltipRegistry', function() {
    spyOn($$mdTooltipRegistry, 'register');

    buildTooltip(
      '<md-button>' +
        '<md-tooltip>Tooltip</md-tooltip>' +
      '</md-button>'
    );

    expect($$mdTooltipRegistry.register).toHaveBeenCalled();
  });

  describe('show and hide', function() {
    it('should show and hide when visible is set', function() {
      expect(findTooltip().length).toBe(0);

      buildTooltip(
        '<md-button>' +
          'Hello' +
          '<md-tooltip md-visible="testModel.isVisible">' +
            'Tooltip' +
          '</md-tooltip>' +
        '</md-button>'
      );

      showTooltip(true);

      expect(findTooltip().length).toBe(1);
      expect(findTooltip().hasClass('md-show')).toBe(true);

      showTooltip(false);

      expect(findTooltip().length).toBe(1);
      expect(findTooltip().hasClass('md-hide')).toBe(true);
    });

    it('should set visible on mouseenter and mouseleave', function() {
      buildTooltip(
        '<md-button>' +
          'Hello' +
          '<md-tooltip md-visible="testModel.isVisible">' +
            'Tooltip' +
          '</md-tooltip>' +
        '</md-button>'
      );

      triggerEvent('mouseenter');
      expect(parentScope.testModel.isVisible).toBe(true);

      triggerEvent('mouseleave');
      expect(parentScope.testModel.isVisible).toBe(false);
    });

    it('should toggle visibility on the next touch',
        inject(function($document) {
          buildTooltip(
            '<md-button>' +
              'Hello' +
              '<md-tooltip md-visible="testModel.isVisible">' +
                'Tooltip' +
              '</md-tooltip>' +
            '</md-button>'
          );

          triggerEvent('touchstart');
          expect(parentScope.testModel.isVisible).toBe(true);
          triggerEvent('touchend');

          $document.triggerHandler('touchend');
          $timeout.flush();
          expect(parentScope.testModel.isVisible).toBe(false);
        }));

    it('should cancel when mouseleave was before the delay', function() {
      buildTooltip(
        '<md-button>' +
          'Hello' +
          '<md-tooltip ' +
            'md-delay="99" ' +
            'md-autohide ' +
            'md-visible="testModel.isVisible">' +
            'Tooltip' +
          '</md-tooltip>' +
        '</md-button>'
      );

      triggerEvent('mouseenter', true);
      expect(parentScope.testModel.isVisible).toBeFalsy();

      triggerEvent('mouseleave', true);
      expect(parentScope.testModel.isVisible).toBeFalsy();

      // Total 99 == tooltipDelay
      $timeout.flush(99);

      expect(parentScope.testModel.isVisible).toBe(false);
    });

    it('should throw when the tooltip text is empty', function() {
      buildTooltip(
        '<md-button>' +
          'Hello' +
          '<md-tooltip md-visible="testModel.isVisible">' +
            '{{ textContent }}' +
          '</md-tooltip>' +
        '</md-button>'
      );

      expect(function() {
        showTooltip(true);
      }).toThrow();
    });

    it('should set visible on focus and blur', function() {
      buildTooltip(
        '<md-button>' +
          'Hello' +
          '<md-tooltip md-visible="testModel.isVisible">' +
            'Tooltip' +
          '</md-tooltip>' +
        '</md-button>'
      );

      triggerEvent('focus');
      expect(parentScope.testModel.isVisible).toBe(true);

      triggerEvent('blur');
      expect(parentScope.testModel.isVisible).toBe(false);
    });

    it('should not be visible on mousedown and then mouseleave',
        inject(function($document) {
          buildTooltip(
            '<md-button>' +
              'Hello' +
              '<md-tooltip md-visible="testModel.isVisible">' +
                'Tooltip' +
              '</md-tooltip>' +
            '</md-button>'
          );

          // Append element to DOM so it can be set as activeElement.
          $document[0].body.appendChild(element[0]);
          element[0].focus();
          triggerEvent('focus,mousedown');

          expect($document[0].activeElement).toBe(element[0]);
          expect(parentScope.testModel.isVisible).toBe(true);

          triggerEvent('mouseleave');
          expect(parentScope.testModel.isVisible).toBe(false);

          // Clean up document.body.
          // element.remove();
        }));

    it('should not be visible when the window is refocused',
        inject(function($window, $document) {
          buildTooltip(
            '<md-button>' +
              'Hello' +
              '<md-tooltip md-visible="testModel.isVisible">' +
                'Tooltip' +
              '</md-tooltip>' +
            '</md-button>'
          );

          // Append element to DOM so it can be set as activeElement.
          $document[0].body.appendChild(element[0]);
          element[0].focus();
          triggerEvent('focus,mousedown');
          expect(document.activeElement).toBe(element[0]);

          triggerEvent('mouseleave');

          // Simulate tabbing away.
          angular.element($window).triggerHandler('blur');

          // Simulate focus event that occurs when tabbing back to the window.
          triggerEvent('focus');
          expect(parentScope.testModel.isVisible).toBe(false);

          // Clean up document.body.
          $document[0].body.removeChild(element[0]);
        }));
  });

  describe('cleanup', function() {
    it('should clean up if the parent scope was destroyed', function() {
      buildTooltip(
        '<md-button>' +
          '<md-tooltip md-visible="true">Tooltip</md-tooltip>' +
        '</md-button>'
      );
      var tooltip = findTooltip();

      expect(tooltip.length).toBe(1);
      expect(tooltip.scope()).toBeTruthy();

      element.scope().$destroy();
      expect(tooltip.scope()).toBeUndefined();
      expect(findTooltip().length).toBe(0);
    });

    it('should remove the tooltip when its own scope is destroyed', function() {
      buildTooltip(
        '<md-button>' +
          '<md-tooltip md-visible="true">Tooltip</md-tooltip>' +
        '</md-button>'
      );
      var tooltip = findTooltip();

      expect(tooltip.length).toBe(1);
      tooltip.scope().$destroy();
      expect(findTooltip().length).toBe(0);
    });

    it('should remove itself from the $$mdTooltipRegistry when the parent ' +
        'scope is destroyed', function() {
          buildTooltip(
            '<md-button>' +
              '<md-tooltip md-visible="true">Tooltip</md-tooltip>' +
            '</md-button>'
          );

          spyOn($$mdTooltipRegistry, 'deregister');
          element.scope().$destroy();
          expect($$mdTooltipRegistry.deregister).toHaveBeenCalled();
        });

    it('should not re-appear if it was outside the DOM when the parent was ' +
        'removed', function() {
          buildTooltip(
            '<md-button>' +
              '<md-tooltip md-visible="testModel.isVisible">' +
                'Tooltip' +
              '</md-tooltip>' +
            '</md-button>'
          );

          showTooltip(false);
          expect(findTooltip().length).toBe(0);

          element.remove();
          showTooltip(true);
          expect(findTooltip().length).toBe(0);
        });

    it('should unbind the parent listeners when it gets destroyed', function() {
      buildTooltip(
        '<md-button>' +
           '<md-tooltip md-visible="testModel.isVisible">Tooltip</md-tooltip>' +
        '</md-button>'
      );

      triggerEvent('focus');
      expect(parentScope.testModel.isVisible).toBe(true);

      element.remove();
      triggerEvent('blur mouseleave touchend touchcancel');
      expect(parentScope.testModel.isVisible).toBe(true);
    });
  });

  // ******************************************************
  // Internal Utility methods
  // ******************************************************

  function buildTooltip(markup) {
    element = $compile(markup)(parentScope);
    parentScope.testModel = {};

    parentScope.$apply();
    $material.flushOutstandingAnimations();

    return element;
  }

  function showTooltip(isVisible) {
    if (angular.isUndefined(isVisible)) {
      isVisible = true;
    }
    parentScope.testModel.isVisible = !!isVisible;
    parentScope.$apply();
    $material.flushOutstandingAnimations();
  }

  function findTooltip() {
    return angular.element(document.querySelector('.md-tooltip'));
  }

  function triggerEvent(eventType, skipFlush) {
    angular.forEach(eventType.split(','), function(name) {
      element.triggerHandler(name);
    });
    !skipFlush && $timeout.flush();
  }
});


// ******************************************************
// mdTooltipRegistry Testing
// ******************************************************

describe('$$mdTooltipRegistry service', function() {
  var tooltipRegistry, ngWindow;

  beforeEach(function() {
    module('material.components.tooltip');

    inject(function($$mdTooltipRegistry, $window) {
      tooltipRegistry = $$mdTooltipRegistry;
      ngWindow = angular.element($window);
    });
  });

  it('should allow for registering event handlers on the window', function() {
    var obj = { callback: function() {} };

    spyOn(obj, 'callback');
    tooltipRegistry.register('resize', obj.callback);
    ngWindow.triggerHandler('resize');

    // check that the callback was triggered
    expect(obj.callback).toHaveBeenCalled();

    // check that the event object was passed
    expect(obj.callback.calls.mostRecent().args[0]).toBeTruthy();
  });

  it('should allow deregistering of the callbacks', function() {
    var obj = { callback: function() {} };

    spyOn(obj, 'callback');
    tooltipRegistry.register('resize', obj.callback);
    ngWindow.triggerHandler('resize');
    expect(obj.callback).toHaveBeenCalledTimes(1);

    tooltipRegistry.deregister('resize', obj.callback);
    ngWindow.triggerHandler('resize');
    expect(obj.callback).toHaveBeenCalledTimes(1);
  });
});
