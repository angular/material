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
    element && element.scope().$destroy();
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

  it('should preserve parent text', function(){
      buildTooltip(
        '<md-button>' +
          'Hello' +
         '<md-tooltip md-visible="testModel.isVisible">Tooltip</md-tooltip>' +
        '</md-button>'
      );

      expect(element.attr('aria-label')).toBe("Hello");
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

    xit('should set visible on touchstart and touchend', function() {
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
    }));

    describe('<md-tooltip> attributeObserver', function() {
      if (window.MutationObserver === undefined) {
        // PhantomJS doesn't support mo
        return it(' does not work without support for mutationObservers', function () {
          expect(true).toBe(true);
        });
      }
      var obs;
      beforeEach(function (mutationDone){
        obs =  new MutationObserver(function(mutations) {
          mutations
            .forEach(function (mutation) {
              if (mutation.attributeName === 'disabled' && mutation.target.disabled) {
                // allow a little time for the observer on the tooltip to finish
                setTimeout(function() {
                  $timeout.flush();
                  $material.flushOutstandingAnimations();
                  mutationDone();
                },50);
              }
            })
          });

        var el = buildTooltip(
          '<md-button>' +
            'Hello' +
            '<md-tooltip md-visible="testModel.isVisible">' +
              'Tooltip' +
            '</md-tooltip>' +
          '</md-button>'
        );

        showTooltip(true);
        // attach the observer
        // trigger the mutationObserver(s).
        obs.observe(el[0], { attributes: true});
        el.attr('disabled',true)
      });

      afterEach(function () {
        // remove observer from dom.
        obs && obs.disconnect();
        obs = null;
      })

      it('should be hidden after element gets disabled',  function() {
        expect($rootScope.testModel.isVisible).toBe(false)
        expect(findTooltip().length).toBe(0);
      })
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
