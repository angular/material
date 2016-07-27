describe('<md-tooltip> directive', function() {
  var $compile, $rootScope, $material, $timeout;
  var element;

  beforeEach(module('material.components.tooltip'));
  beforeEach(module('material.components.button'));
  beforeEach(inject(function(_$compile_, _$rootScope_, _$material_, _$timeout_){
    $compile   = _$compile_;
    $rootScope = _$rootScope_;
    $material  = _$material_;
    $timeout   = _$timeout_;
  }));
  afterEach(function() {
    // Make sure to remove/cleanup after each test
    var scope = element && element.scope();
    scope && scope.$destroy();
    element = undefined;
  });

  it('should support dynamic directions', function() {
    var error;

    try {
      buildTooltip(
        '<md-button>' +
        'Hello' +
        '<md-tooltip md-direction="{{direction}}">Tooltip</md-tooltip>' +
        '</md-button>'
      );
    } catch(e) {
      error = e;
    }

    expect(error).toBe(undefined);
  });

  it('should set the position to "bottom", if it is undefined', function() {
    buildTooltip(
      '<md-button>' +
       '<md-tooltip md-visible="true">Tooltip</md-tooltip>' +
      '</md-button>'
    );

    expect(findTooltip().attr('md-direction')).toBe('bottom');
  });

  it('should preserve parent text', function(){
      buildTooltip(
        '<md-button>' +
          'Hello' +
         '<md-tooltip md-visible="testModel.isVisible">Tooltip</md-tooltip>' +
        '</md-button>'
      );

      expect(element.text()).toBe("Hello");
  });

  it('should label parent', function(){
      buildTooltip(
        '<md-button>' +
          '<md-tooltip md-visible="testModel.isVisible">' +
            'Tooltip' +
          '</md-tooltip>'+
        '</md-button>'
      );

      expect(element.attr('aria-label')).toEqual('Tooltip');
  });

  it('should interpolate the aria-label', function(){
      buildTooltip(
        '<md-button>' +
         '<md-tooltip>{{ "hello" | uppercase }}</md-tooltip>' +
        '</md-button>'
      );

      expect(element.attr('aria-label')).toBe('HELLO');
  });

  it('should update the aria-label when the interpolated value changes', function(){
      buildTooltip(
        '<md-button>' +
         '<md-tooltip>{{ testModel.ariaTest }}</md-tooltip>' +
        '</md-button>'
      );

      $rootScope.$apply(function() {
        $rootScope.testModel.ariaTest = 'test 1';
      });

      expect(element.attr('aria-label')).toBe('test 1');

      $rootScope.$apply(function() {
        $rootScope.testModel.ariaTest = 'test 2';
      });

      expect(element.attr('aria-label')).toBe('test 2');
  });

  it('should not set parent to items with no pointer events', inject(function($window){
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
    expect($rootScope.testModel.isVisible).toBeUndefined();

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
    expect($rootScope.testModel.isVisible).toBeFalsy();

    // Wait 1 below delay, nothing should happen
    $timeout.flush(98);
    expect($rootScope.testModel.isVisible).toBeFalsy();

    // Total 300 == tooltipDelay
    $timeout.flush(1);
    expect($rootScope.testModel.isVisible).toBe(true);

  });

  describe('show and hide', function() {

    it('should show and hide when visible is set',  function() {

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

      expect(findTooltip().length).toBe(0);
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
        expect($rootScope.testModel.isVisible).toBe(true);

        triggerEvent('mouseleave');
        expect($rootScope.testModel.isVisible).toBe(false);
    });

    it('should should toggle visibility on the next touch', inject(function($document) {
        buildTooltip(
          '<md-button>' +
             'Hello' +
             '<md-tooltip md-visible="testModel.isVisible">' +
              'Tooltip' +
            '</md-tooltip>' +
          '</md-button>'
        );

        triggerEvent('touchstart');
        expect($rootScope.testModel.isVisible).toBe(true);
        triggerEvent('touchend');

        $document.triggerHandler('touchend');
        $timeout.flush();
        expect($rootScope.testModel.isVisible).toBe(false);
    }));

    it('should cancel when mouseleave was before the delay', function() {
      buildTooltip(
        '<md-button>' +
          'Hello' +
          '<md-tooltip md-delay="99" md-autohide md-visible="testModel.isVisible">' +
            'Tooltip' +
          '</md-tooltip>' +
        '</md-button>'
      );


      triggerEvent('mouseenter', true);
      expect($rootScope.testModel.isVisible).toBeFalsy();

      triggerEvent('mouseleave', true);
      expect($rootScope.testModel.isVisible).toBeFalsy();

      // Total 99 == tooltipDelay
      $timeout.flush(99);

      expect($rootScope.testModel.isVisible).toBe(false);
    });

    it('should not show when the text is empty',  function() {

      expect(findTooltip().length).toBe(0);

      buildTooltip(
        '<md-button>' +
          'Hello' +
          '<md-tooltip md-visible="testModel.isVisible">{{ textContent }} </md-tooltip>' +
        '</md-button>'
      );

      showTooltip(true);

      expect(findTooltip().length).toBe(0);

      $rootScope.textContent = 'Tooltip';
      $rootScope.$apply();

      // Trigger a change on the model, otherwise the tooltip component can't detect the
      // change.
      showTooltip(false);
      showTooltip(true);

      expect(findTooltip().length).toBe(1);
      expect(findTooltip().hasClass('md-show')).toBe(true);
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
      expect($rootScope.testModel.isVisible).toBe(true);

      triggerEvent('blur');
      expect($rootScope.testModel.isVisible).toBe(false);
    });

    it('should not be visible on mousedown and then mouseleave', inject(function($document) {
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
      expect($rootScope.testModel.isVisible).toBe(true);

      triggerEvent('mouseleave');
      expect($rootScope.testModel.isVisible).toBe(false);

      // Clean up document.body.
      $document[0].body.removeChild(element[0]);
    }));

    it('should not be visible when the window is refocused', inject(function($window, $document) {
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
      expect($rootScope.testModel.isVisible).toBe(false);

      // Clean up document.body.
      $document[0].body.removeChild(element[0]);
    }));

  });

  describe('cleanup', function() {
    it('should clean up the scope if the parent was removed from the DOM', function() {
      buildTooltip(
        '<md-button>' +
         '<md-tooltip md-visible="true">Tooltip</md-tooltip>' +
        '</md-button>'
      );
      var tooltip = findTooltip();

      expect(tooltip.length).toBe(1);
      expect(tooltip.scope()).toBeTruthy();

      element.remove();
      expect(tooltip.scope()).toBeUndefined();
      expect(findTooltip().length).toBe(0);
    });

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

    it('should not re-appear if it was outside the DOM when the parent was removed', function() {
      buildTooltip(
        '<md-button>' +
         '<md-tooltip md-visible="testModel.isVisible">Tooltip</md-tooltip>' +
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
      expect($rootScope.testModel.isVisible).toBe(true);

      element.remove();
      triggerEvent('blur mouseleave touchend touchcancel');
      expect($rootScope.testModel.isVisible).toBe(true);
    });
  });

  // ******************************************************
  // Internal Utility methods
  // ******************************************************

  function buildTooltip(markup) {

    element = $compile(markup)($rootScope);
    $rootScope.testModel = {};

    $rootScope.$apply();
    $material.flushOutstandingAnimations();

    return element;
  }

  function showTooltip(isVisible) {
    if (angular.isUndefined(isVisible)) isVisible = true;

    $rootScope.$apply('testModel.isVisible = ' + (isVisible ? 'true' : 'false') );
    $material.flushOutstandingAnimations();
  }

  function findTooltip() {
    return angular.element(document.body).find('md-tooltip');
  }


  function triggerEvent(eventType, skipFlush) {
    angular.forEach(eventType.split(','),function(name) {
      element.triggerHandler(name);
    });
    !skipFlush && $timeout.flush();
  }

});
