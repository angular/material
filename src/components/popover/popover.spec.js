// *************************************************************************************************
// MdPopover Component
// *************************************************************************************************

describe('MdPopover Component:', function() {

  var $mdPopoverRegistry, $rootScope, $compile, $material, $timeout, $animate, $window;
  var scope, element;

  var injectLocals = function($injector) {
    $mdPopoverRegistry = $injector.get('$mdPopoverRegistry');
    $rootScope = $injector.get('$rootScope');
    $compile = $injector.get('$compile');
    $material = $injector.get('$material');
    $timeout = $injector.get('$timeout');
    $animate = $injector.get('$animate');
    $window = $injector.get('$window');
  };

  beforeEach(function() {
    module(
      'material.components.panel',
      'material.components.popover',
      'material.components.tooltip',
      'material.components.button',
      'ngSanitize'
    );

    inject(injectLocals);

    scope = $rootScope.$new();

    $animate.enabled(false);
  });

  afterEach(function() {
    if (angular.isDefined(element)) {
      element.remove();
      element = undefined;
    }

    scope.$destroy();
    scope = undefined;
  });

  // ***********************************************************************************************
  // Opening
  // ***********************************************************************************************

  describe('Opening:', function() {

    describe('MdVisible:', function() {

      it('should open a POPOVER when using mdVisible', function() {
        scope.isVisible = false;

        buildComponent(
          '<md-button aria-label="Test">' +
            'Test' +
            '<md-popover md-visible="isVisible">' +
              '<md-popover-title>Title</md-popover-title>' +
              '<md-popover-content>Content</md-popover-content>' +
            '</md-popover>' +
          '</md-button>'
        );

        expect(findComponent('popover')).toEqual(null);

        scope.isVisible = true;
        flush();
        expect(findComponent('popover')).not.toEqual(null);
      });

      it('should open a TOOLTIP when using mdVisible', function() {
        scope.isVisible = false;

        buildComponent(
          '<md-button>' +
            'Test' +
            '<md-tooltip md-visible="isVisible">Test</md-tooltip>' +
          '</md-button>'
        );

        expect(findComponent('tooltip')).toEqual(null);

        scope.isVisible = true;
        flush();
        expect(findComponent('tooltip')).not.toEqual(null);
      });

    });

    describe('Triggers:', function() {

      it('should open a POPOVER when using the mouseenter event when no custom open triggers are ' +
          'present', function() {
        buildComponent(
          '<md-button aria-label="Test">' +
            'Test' +
            '<md-popover>' +
              '<md-popover-title>Title</md-popover-title>' +
              '<md-popover-content>Content</md-popover-content>' +
            '</md-popover>' +
          '</md-button>'
        );

        expect(findComponent('popover')).toEqual(null);

        triggerEvent('mouseenter');
        expect(findComponent('popover')).not.toEqual(null);
      });

      it('should open a TOOLTIP when using the mouseenter event', function() {
        buildComponent(
          '<md-button>' +
            'Test' +
            '<md-tooltip>Test</md-tooltip>' +
          '</md-button>'
        );

        expect(findComponent('tooltip')).toEqual(null);

        triggerEvent('mouseenter');
        expect(findComponent('tooltip')).not.toEqual(null);
      });

      it('should open a POPOVER when using the touchstart event when no custom open triggers are ' +
          'present', function() {
        buildComponent(
          '<md-button aria-label="Test">' +
            'Test' +
            '<md-popover>' +
              '<md-popover-title>Title</md-popover-title>' +
              '<md-popover-content>Content</md-popover-content>' +
            '</md-popover>' +
          '</md-button>'
        );

        expect(findComponent('popover')).toEqual(null);

        triggerEvent('touchstart');
        expect(findComponent('popover')).not.toEqual(null);
      });

      it('should open a TOOLTIP when using the touchstart event', function() {
        buildComponent(
          '<md-button>' +
            'Test' +
            '<md-tooltip>Test</md-tooltip>' +
          '</md-button>'
        );

        expect(findComponent('tooltip')).toEqual(null);

        triggerEvent('touchstart');
        expect(findComponent('tooltip')).not.toEqual(null);
      });

      it('should open a POPOVER when using the focus event when no custom open triggers are ' +
          'present', function() {
        buildComponent(
          '<md-button aria-label="Test">' +
            'Test' +
            '<md-popover>' +
              '<md-popover-title>Title</md-popover-title>' +
              '<md-popover-content>Content</md-popover-content>' +
            '</md-popover>' +
          '</md-button>'
        );

        expect(findComponent('popover')).toEqual(null);

        triggerEvent('focus');
        expect(findComponent('popover')).not.toEqual(null);
      });

      it('should open a TOOLTIP when using the focus event', function() {
        buildComponent(
          '<md-button>' +
            'Test' +
            '<md-tooltip>Test</md-tooltip>' +
          '</md-button>'
        );

        expect(findComponent('tooltip')).toEqual(null);

        triggerEvent('focus');
        expect(findComponent('tooltip')).not.toEqual(null);
      });

      it('should open a POPOVER when using a custom open trigger', function() {
        var openTrigger = 'click';

        buildComponent(
          '<md-button aria-label="Test">' +
            'Test' +
            '<md-popover md-open-trigger="' + openTrigger + '">' +
              '<md-popover-title>Title</md-popover-title>' +
              '<md-popover-content>Content</md-popover-content>' +
            '</md-popover>' +
          '</md-button>'
        );

        expect(findComponent('popover')).toEqual(null);

        triggerEvent(openTrigger);
        expect(findComponent('popover')).not.toEqual(null);
      });

    });

    describe('Delays:', function() {

      it('should open a POPOVER after mdOpenDelay ms', function() {
        var delay = 99;

        buildComponent(
          '<md-button aria-label="Test">' +
            'Test' +
            '<md-popover md-open-delay="' + delay.toString() + '">' +
              '<md-popover-title>Title</md-popover-title>' +
              '<md-popover-content>Content</md-popover-content>' +
            '</md-popover>' +
          '</md-button>'
        );

        expect(findComponent('popover')).toEqual(null);

        triggerEvent('mouseenter', true);
        expect(findComponent('popover')).toEqual(null);

        $timeout.flush(delay - 1);
        expect(findComponent('popover')).toEqual(null);

        $timeout.flush(1);
        expect(findComponent('popover')).not.toEqual(null);
      });

      it('should open a TOOLTIP after mdDelay ms', function() {
        var delay = 99;

        buildComponent(
          '<md-button aria-label="Test">' +
            'Test' +
            '<md-tooltip md-delay="' + delay.toString() + '">Test</md-tooltip>' +
          '</md-button>'
        );

        expect(findComponent('tooltip')).toEqual(null);

        triggerEvent('mouseenter', true);
        expect(findComponent('tooltip')).toEqual(null);

        $timeout.flush(delay - 1);
        expect(findComponent('tooltip')).toEqual(null);

        $timeout.flush(1);
        expect(findComponent('tooltip')).not.toEqual(null);
      });

      it('should cancel a POPOVER when a mdCloseTrigger occurs before the mdOpenDelay finishes',
          function() {
        var delay = 99;

        buildComponent(
          '<md-button aria-label="Test">' +
            'Test' +
            '<md-popover md-open-delay="' + delay.toString() + '">' +
              '<md-popover-title>Title</md-popover-title>' +
              '<md-popover-content>Content</md-popover-content>' +
            '</md-popover>' +
          '</md-button>'
        );

        triggerEvent('mouseenter', true);
        expect(findComponent('popover')).toEqual(null);

        triggerEvent('mouseleave', true);
        expect(findComponent('popover')).toEqual(null);

        $timeout.flush(delay);
        expect(findComponent('popover')).toEqual(null);
      });

      it('should cancel a TOOLTIP when a mdCloseTrigger occurs before the mdDelay finishes',
          function() {
        var delay = 99;

        buildComponent(
          '<md-button aria-label="Test">' +
            'Test' +
            '<md-tooltip md-delay="' + delay.toString() + '">Tooltip</md-tooltip>' +
          '</md-button>'
        );

        triggerEvent('mouseenter', true);
        expect(findComponent('tooltip')).toEqual(null);

        triggerEvent('mouseleave', true);
        expect(findComponent('tooltip')).toEqual(null);

        $timeout.flush(delay);
        expect(findComponent('tooltip')).toEqual(null);
      });

    });

  });

  // ***********************************************************************************************
  // Closing
  // ***********************************************************************************************

  describe('Closing:', function() {

    describe('MdVisible:', function() {

      it('should close a POPOVER when using mdVisible', function() {
        scope.isVisible = false;

        buildComponent(
          '<md-button aria-label="Test">' +
            'Test' +
            '<md-popover md-visible="isVisible">' +
              '<md-popover-title>Title</md-popover-title>' +
              '<md-popover-content>Content</md-popover-content>' +
            '</md-popover>' +
          '</md-button>'
        );

        scope.isVisible = true;
        flush();
        expect(findComponent('popover')).not.toEqual(null);

        scope.isVisible = false;
        flush();
        expect(findComponent('popover')).toEqual(null);
      });

      it('should close a TOOLTIP when using mdVisible', function() {
        scope.isVisible = false;

        buildComponent(
          '<md-button>' +
            'Test' +
            '<md-tooltip md-visible="isVisible">Test</md-tooltip>' +
          '</md-button>'
        );

        scope.isVisible = true;
        flush();
        expect(findComponent('tooltip')).not.toEqual(null);

        scope.isVisible = false;
        flush();
        expect(findComponent('tooltip')).toEqual(null);
      });

    });

    describe('Triggers:', function() {

      it('should close a POPOVER when using the mouseleave event when no custom close triggers ' +
          'are present', function() {
        buildComponent(
          '<md-button aria-label="Test">' +
            'Test' +
            '<md-popover>' +
              '<md-popover-title>Title</md-popover-title>' +
              '<md-popover-content>Content</md-popover-content>' +
            '</md-popover>' +
          '</md-button>'
        );

        triggerEvent('mouseenter');
        expect(findComponent('popover')).not.toEqual(null);

        triggerEvent('mouseleave');
        flush();
        expect(findComponent('popover')).toEqual(null);
      });

      it('should close a TOOLTIP when using the mouseleave event when no custom close triggers ' +
          'are present', function() {
        buildComponent(
          '<md-button>' +
            'Test' +
            '<md-tooltip>Test</md-tooltip>' +
          '</md-button>'
        );

        triggerEvent('mouseenter');
        expect(findComponent('tooltip')).not.toEqual(null);

        triggerEvent('mouseleave');
        flush();
        expect(findComponent('tooltip')).toEqual(null);
      });

      it('should close a POPOVER when using the touchcancel event when no custom close triggers ' +
          'are present', function() {
        buildComponent(
          '<md-button aria-label="Test">' +
            'Test' +
            '<md-popover>' +
              '<md-popover-title>Title</md-popover-title>' +
              '<md-popover-content>Content</md-popover-content>' +
            '</md-popover>' +
          '</md-button>'
        );

        triggerEvent('touchstart');
        expect(findComponent('popover')).not.toEqual(null);

        triggerEvent('touchcancel');
        flush();
        expect(findComponent('popover')).toEqual(null);
      });

      it('should close a TOOLTIP when using the touchcancel event when no custom close triggers ' +
          'are present', function() {
        buildComponent(
          '<md-button>' +
            'Test' +
            '<md-tooltip>Test</md-tooltip>' +
          '</md-button>'
        );

        triggerEvent('touchstart');
        expect(findComponent('tooltip')).not.toEqual(null);

        triggerEvent('touchcancel');
        flush();
        expect(findComponent('tooltip')).toEqual(null);
      });

      it('should close a POPOVER when using the blur event when no custom close triggers ' +
          'are present', function() {
        buildComponent(
          '<md-button aria-label="Test">' +
            'Test' +
            '<md-popover>' +
              '<md-popover-title>Title</md-popover-title>' +
              '<md-popover-content>Content</md-popover-content>' +
            '</md-popover>' +
          '</md-button>'
        );

        triggerEvent('focus');
        expect(findComponent('popover')).not.toEqual(null);

        triggerEvent('blur');
        flush();
        expect(findComponent('popover')).toEqual(null);
      });

      it('should close a TOOLTIP when using the blur event when no custom close triggers ' +
          'are present', function() {
        buildComponent(
          '<md-button>' +
            'Test' +
            '<md-tooltip>Test</md-tooltip>' +
          '</md-button>'
        );

        triggerEvent('focus');
        expect(findComponent('tooltip')).not.toEqual(null);

        triggerEvent('blur');
        flush();
        expect(findComponent('tooltip')).toEqual(null);
      });

      it('should close a POPOVER when using a custom close trigger', function() {
        var closeTrigger = 'click';

        buildComponent(
          '<md-button aria-label="Test">' +
            'Test' +
            '<md-popover md-close-trigger="' + closeTrigger + '">' +
              '<md-popover-title>Title</md-popover-title>' +
              '<md-popover-content>Content</md-popover-content>' +
            '</md-popover>' +
          '</md-button>'
        );

        triggerEvent('mouseenter');
        expect(findComponent('popover')).not.toEqual(null);

        triggerEvent(closeTrigger);
        flush();
        expect(findComponent('popover')).toEqual(null);
      });

    });

    describe('Delays:', function() {

      it('should close a POPOVER after mdCloseDelay ms', function() {
        var delay = 99;

        buildComponent(
          '<md-button aria-label="Test">' +
            'Test' +
            '<md-popover md-close-delay="' + delay.toString() + '">' +
              '<md-popover-title>Title</md-popover-title>' +
              '<md-popover-content>Content</md-popover-content>' +
            '</md-popover>' +
          '</md-button>'
        );

        triggerEvent('mouseenter');
        expect(findComponent('popover')).not.toEqual(null);

        triggerEvent('mouseleave');
        expect(findComponent('popover')).not.toEqual(null);

        $timeout.flush(delay - 1);
        expect(findComponent('popover')).not.toEqual(null);

        $timeout.flush(1);
        flush();
        expect(findComponent('popover')).toEqual(null);
      });

    });

  });

  // ***********************************************************************************************
  // Config options
  // ***********************************************************************************************

  describe('Config options:', function() {

    describe('ZIndex:', function() {

      it('should default a POPOVER\'s z-index to 100', function() {
        scope.isVisible = false;

        buildComponent(
          '<md-button aria-label="Test">' +
            'Test' +
            '<md-popover md-visible="isVisible">' +
              '<md-popover-title>Title</md-popover-title>' +
              '<md-popover-content>Content</md-popover-content>' +
            '</md-popover>' +
          '</md-button>'
        );

        scope.isVisible = true;
        flush();
        expect(angular.element(findComponent('popover')).css('z-index').toString()).toEqual('100');
      });

      it('should default a TOOLTIP\'s z-index to 100', function() {
        scope.isVisible = false;

        buildComponent(
          '<md-button>' +
            'Test' +
            '<md-tooltip md-visible="isVisible">Tooltip</md-tooltip>' +
          '</md-button>'
        );

        scope.isVisible = true;
        flush();
        expect(angular.element(findComponent('tooltip')).css('z-index').toString()).toEqual('100');
      });

      it('should allow a POPOVER to have a custom z-index', function() {
        var zIndex = 400;
        scope.isVisible = false;

        buildComponent(
          '<md-button aria-label="Test">' +
            'Test' +
            '<md-popover md-visible="isVisible" md-z-index="' + zIndex.toString() + '">' +
              '<md-popover-title>Title</md-popover-title>' +
              '<md-popover-content>Content</md-popover-content>' +
            '</md-popover>' +
          '</md-button>'
        );

        scope.isVisible = true;
        flush();
        var expectedZIndex = zIndex + 1;
        expect(angular.element(findComponent('popover')).css('z-index').toString())
            .toEqual(expectedZIndex.toString());
      });

      it('should allow a tooltip to have a custom z-index', function() {
        var zIndex = 400;
        scope.isVisible = false;

        buildComponent(
          '<md-button>' +
            'Test' +
            '<md-tooltip md-visible="isVisible" md-z-index="' + zIndex.toString() + '">' +
              'Test tooltip' +
            '</md-tooltip>' +
          '</md-button>'
        );

        scope.isVisible = true;
        flush();
        var expectedZIndex = zIndex + 1;
        expect(angular.element(findComponent('tooltip')).css('z-index').toString())
            .toEqual(expectedZIndex.toString());
      });

    });

    describe('Enabled', function() {

      it('should allow for a POPOVER to be dynamically disabled', function() {
        scope.isVisible = false;
        scope.isEnabled = false;

        buildComponent(
          '<md-button aria-label="Test">' +
            'Test' +
            '<md-popover md-visible="isVisible" md-enabled="isEnabled">' +
              '<md-popover-title>Title</md-popover-title>' +
              '<md-popover-content>Content</md-popover-content>' +
            '</md-popover' +
          '</md-button>'
        );

        scope.isVisible = true;
        flush();
        expect(findComponent('popover')).toEqual(null);
      });

      it('should allow for a TOOLTIP to be dynamically disabled', function() {
        scope.isVisible = false;
        scope.isEnabled = false;

        buildComponent(
          '<md-button>' +
            'Test' +
            '<md-tooltip md-visible="isVisible" md-enabled="isEnabled">Tooltip</md-tooltip>' +
          '</md-button>'
        );

        scope.isVisible = true;
        flush();
        expect(findComponent('tooltip')).toEqual(null);
      });

    });

    describe('Custom class', function() {

      it('should support adding a custom class to a POPOVER', function() {
        scope.isVisible = false;
        var customClass = 'testClass';

        buildComponent(
          '<md-button aria-label="Test">' +
            'Test' +
            '<md-popover md-visible="isVisible" md-popover-class="' + customClass + '">' +
              '<md-popover-title>Title</md-popover-title>' +
              '<md-popover-content>Content</md-popover-content>' +
            '</md-popover>' +
          '</md-button>'
        );

        scope.isVisible = true;
        flush();
        expect(angular.element(findComponent('popover'))).toHaveClass(customClass);
      });

    });

  });

  // ***********************************************************************************************
  // Positioning
  // ***********************************************************************************************

  describe('Positioning:', function() {

    it('should not throw when using dynamic positions when building a POPOVER', function() {
      scope.position = 'right';

      expect(function() {
        buildComponent(
          '<md-button aria-label="Test">' +
            'Test' +
            '<md-popover md-visible="isVisible" md-position="{{position}}">' +
              '<md-popover-title>Title</md-popover-title>' +
              '<md-popover-content>Content</md-popover-content>' +
            '</md-popover>' +
          '</md-button>'
        );
      }).not.toThrow();
    });

    it('should not throw when using dynamic positions when building a TOOLTIP', function() {
      scope.position = 'top';

      expect(function() {
        buildComponent(
          '<md-button aria-label="Test">' +
            'Test' +
            '<md-tooltip md-visible="isVisible" md-direction="{{position}}">Tooltip</md-tooltip>' +
          '</md-button>'
        );
      }).not.toThrow();
    });

    it('should support dynamic positions when building a POPOVER', function() {
      scope.isVisible = false;
      scope.position = 'bottom';
      flush();

      buildComponent(
        '<md-button aria-label="Test">' +
          'Test' +
          '<md-popover md-visible="isVisible" md-position="{{position}}">' +
            '<md-popover-title>Title</md-popover-title>' +
            '<md-popover-content>Content</md-popover-content>' +
          '</md-popover>' +
        '</md-button>'
      );

      scope.isVisible = true;
      flush();

      expect(angular.element(findComponent('popover'))).toHaveClass('md-position-bottom');
    });

    it('should support dynamic positions when building a TOOLTIP', function() {
      scope.isVisible = false;
      scope.position = 'left';
      flush();

      buildComponent(
        '<md-button aria-label="Test">' +
          'Test' +
          '<md-tooltip md-visible="isVisible" md-direction="{{position}}">Tooltip</md-tooltip>' +
        '</md-button>'
      );

      scope.isVisible = true;
      flush();

      expect(angular.element(findComponent('tooltip'))).toHaveClass('md-position-left');
    });

    it('should default the position to TOP when building a POPOVER and a custom position is not ' +
        'defined', function() {
      scope.isVisible = false;

      buildComponent(
        '<md-button aria-label="Test">' +
          'Test' +
          '<md-popover md-visible="isVisible">' +
            '<md-popover-title>Title</md-popover-title>' +
            '<md-popover-content>Content</md-popover-content>' +
          '</md-popover>' +
        '</md-button>'
      );

      scope.isVisible = true;
      flush();

      expect(angular.element(findComponent('popover'))).toHaveClass('md-position-top');
    });

    it('should default the position to BOTTOM when building a TOOLTIP and a custom position is ' +
        'not defined', function() {
      scope.isVisible = false;

      buildComponent(
        '<md-button>' +
          'Test' +
          '<md-tooltip md-visible="isVisible">Tooltip</md-tooltip>' +
        '</md-button>'
      );

      scope.isVisible = true;
      flush();

      expect(angular.element(findComponent('tooltip'))).toHaveClass('md-position-bottom');
    });

  });

  // ***********************************************************************************************
  // Miscellaneous
  // ***********************************************************************************************

  describe('MdPopoverRegistry', function() {

    it('should register a POPOVER', function() {
      spyOn($mdPopoverRegistry, 'register');

      buildComponent(
        '<md-button aria-label="Test">' +
          'Test' +
          '<md-popover>' +
            '<md-popover-title>Title</md-popover-title>' +
            '<md-popover-content>Content</md-popover-content>' +
          '</md-popover>' +
        '</md-button>'
      );

      expect($mdPopoverRegistry.register).toHaveBeenCalled();
    });

    it('should register a TOOLTIP', function() {
      spyOn($mdPopoverRegistry, 'register');

      buildComponent(
        '<md-button aria-label="Test">' +
          'Test' +
          '<md-tooltip>Tooltip</md-tooltip>' +
        '</md-button>'
      );

      expect($mdPopoverRegistry.register).toHaveBeenCalled();
    });

    it('should deregister a POPOVER when its scope is destroyed', function() {
      spyOn($mdPopoverRegistry, 'deregister');

      buildComponent(
        '<md-button aria-label="Test">' +
          'Test' +
          '<md-popover>' +
            '<md-popover-title>Title</md-popover-title>' +
            '<md-popover-content>Content</md-popover-content>' +
          '</md-popover>' +
        '</md-button>'
      );

      scope.$destroy();
      expect($mdPopoverRegistry.deregister).toHaveBeenCalled();
    });

    it('should deregister a TOOLTIP when its scope is destroyed', function() {
      spyOn($mdPopoverRegistry, 'deregister');

      buildComponent(
        '<md-button aria-label="Test">' +
          'Test' +
          '<md-popover>' +
            '<md-popover-title>Title</md-popover-title>' +
            '<md-popover-content>Content</md-popover-content>' +
          '</md-popover>' +
        '</md-button>'
      );

      scope.$destroy();
      expect($mdPopoverRegistry.deregister).toHaveBeenCalled();
    });

  });

  describe('Parent element:', function() {

    it('should preserve parent text when creating a POPOVER', function() {
      buildComponent(
        '<md-button aria-label="Test">' +
          'Test' +
          '<md-popover>' +
            '<md-popover-title>Title</md-popover-title>' +
            '<md-popover-content>Content</md-popover-content>' +
          '</md-popover>' +
        '</md-button>'
      );

      expect(element.text()).toBe('Test');
    });

    it('should preserve parent text when creating a TOOLTIP', function() {
      buildComponent(
        '<md-button>' +
          'Test' +
          '<md-tooltip>Tooltip</md-button>' +
        '</md-button>'
      );

      expect(element.text()).toBe('Test');
    });

  });

  describe('Aria-label:', function() {

    it('should throw if building a POPOVER and a label is not present on the parent', function() {
      expect(function() {
        buildComponent(
          '<md-button>' +
            'Test' +
            '<md-popover>' +
              '<md-popover-title>Title</md-popover-title>' +
              '<md-popover-content>Content</md-popover-content>' +
            '</md-popover>' +
          '</md-button>'
        );
      }).toThrow();
    });

    it('should label the parent if building a TOOLTIP and a label is not present', function() {
      buildComponent(
        '<md-button>' +
          'Test' +
          '<md-tooltip>Tooltip</md-tooltip>' +
        '</md-button>'
      );

      expect(element.attr('aria-label')).toEqual('Tooltip');
    });

    it('should NOT label the parent if building a TOOLTIP and a label is already present',
        function() {
      buildComponent(
        '<md-button aria-label="Test">' +
          'Test' +
          '<md-tooltip>Tooltip</md-tooltip>' +
        '</md-button>'
      );

      expect(element.attr('aria-label')).toEqual('Test');
    });

    it('should interpolate the label of the parent when building a TOOLTIP', function() {
      buildComponent(
        '<md-button>' +
          'Test' +
          '<md-tooltip>{{"tooltip" | uppercase}}</md-tooltip>' +
        '</md-button>'
      );

      expect(element.attr('aria-label')).toEqual('TOOLTIP');
    });

    it('should update the interpolated label of the parent of a TOOLTIP when the value changes',
        function() {
      scope.text = 'Tooltip';

      buildComponent(
        '<md-button>' +
          'Test' +
          '<md-tooltip>{{text}}</md-tooltip>' +
        '</md-button>'
      );

      expect(element.attr('aria-label')).toBe('Tooltip');

      scope.text = 'Tooltip Changed';
      flush();
      expect(element.attr('aria-label')).toBe('Tooltip Changed');
    });

  });

  describe('Clean up:', function() {

    it('should remove a POPOVER when its own scope is destroyed', function() {
      buildComponent(
        '<md-button aria-label="Test">' +
          'Test' +
          '<md-popover>' +
            '<md-popover-title>Title</md-popover-title>' +
            '<md-popover-content>Content</md-popover-content>' +
          '</md-popover>' +
        '</md-button>'
      );

      triggerEvent('mouseenter');
      expect(findComponent('popover')).not.toEqual(null);

      scope.$destroy();
      expect(findComponent('popover')).toEqual(null);
    });

    it('should remove a TOOLTIP when its own scope is destroyed', function() {
      buildComponent(
        '<md-button>' +
          'Test' +
          '<md-tooltip>Tooltip</md-tooltip>' +
        '</md-button>'
      );

      triggerEvent('mouseenter');
      expect(findComponent('tooltip')).not.toEqual(null);

      scope.$destroy();
      expect(findComponent('tooltip')).toEqual(null);
    });

  });

  it('should throw when opening a TOOLTIP and the tooltip text is empty', function() {
    scope.isVisible = false;

    buildComponent(
      '<md-button>' +
        'Text' +
        '<md-tooltip md-visible="isVisible">{{text}}</md-tooltip>' +
      '</md-button>'
    );

    expect(function() {
      scope.isVisible = true;
      flush();
    }).toThrow();
  });

  // ***********************************************************************************************
  // Utility methods
  // ***********************************************************************************************

  function buildComponent(markup) {
    element = $compile(markup)(scope);
    flush();
    return element;
  }

  function findComponent(type) {
    return document.querySelector('.md-panel.md-' + type);
  }

  function flush() {
    scope.$apply();
    $material.flushOutstandingAnimations();
  }

  function triggerEvent(type, skipFlush) {
    angular.forEach(type.split(','), function(t) {
      element.triggerHandler(t);
    });
    !skipFlush && $timeout.flush();
  }

});
