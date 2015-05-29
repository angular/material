describe('<md-tooltip> directive', function() {
  var $compile, $rootScope, $animate;
  var element;

  beforeEach(module('material.components.tooltip', 'ngAnimateMock'));
  beforeEach(inject(function(_$compile_, _$rootScope_, _$animate_){
    $compile   = _$compile_;
    $rootScope = _$rootScope_;
    $animate   = _$animate_;
  }));
  afterEach(function() {
    // Make sure to remove/cleanup after each test
    element && element.scope().$destroy();
    element = undefined;
  });

  it('should preserve parent text', function(){
      buildTooltip(
        '<md-button>' +
          'Hello' +
         '<md-tooltip md-visible="isVisible">Tooltip</md-tooltip>' +
        '</md-button>'
      );

      expect(element.attr('aria-label')).toBeUndefined();
  });

  it('should label parent', function(){
      buildTooltip(
        '<md-button>' +
          '<md-tooltip md-visible="isVisible">' +
            'Tooltip' +
          '</md-tooltip>'+
        '</md-button>'
      );

      expect(element.attr('aria-label')).toEqual('Tooltip');
  });

  it('should not set parent to items with no pointer events', inject(function($window){
    spyOn($window, 'getComputedStyle').and.callFake(function(el) {
        return { 'pointer-events': el.nodeName == 'INNER' ? 'none' : '' };
    });

    buildTooltip(
      '<outer>' +
        '<inner>' +
          '<md-tooltip md-visible="isVisible">' +
            'Hello world' +
          '</md-tooltip>' +
        '</inner>' +
      '</outer>'
    );

    element.triggerHandler('mouseenter');
    expect($rootScope.isVisible).toBeUndefined();

  }));

  it('should show after tooltipDelay ms', inject(function($timeout) {
    buildTooltip(
      '<md-button>' +
       'Hello' +
       '<md-tooltip md-visible="isVisible" md-delay="99">' +
         'Tooltip' +
       '</md-tooltip>' +
      '</md-button>'
    );

    element.triggerHandler('focus');
    expect($rootScope.isVisible).toBeFalsy();

    // Wait 1 below delay, nothing should happen
    $timeout.flush(98);
    expect($rootScope.isVisible).toBeFalsy();

    // Total 99 == tooltipDelay
    $timeout.flush(1);
    expect($rootScope.isVisible).toBe(true);

  }));

  describe('show and hide', function() {

    it('should show and hide when visible is set',  function() {

      expect(findTooltip().length).toBe(0);

      buildTooltip(
        '<md-button>' +
          'Hello' +
          '<md-tooltip md-visible="isVisible">' +
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

    it('should set visible on mouseenter and mouseleave', inject(function($timeout) {
        buildTooltip(
          '<md-button>' +
             'Hello' +
             '<md-tooltip md-visible="isVisible">' +
              'Tooltip' +
            '</md-tooltip>' +
          '</md-button>'
        );

        element.triggerHandler('mouseenter');
        $timeout.flush();

          expect($rootScope.isVisible).toBe(true);

        element.triggerHandler('mouseleave');
        $timeout.flush();

          expect($rootScope.isVisible).toBe(false);
    }));

    it('should set visible on focus and blur', inject(function($timeout) {
      buildTooltip(
        '<md-button>' +
           'Hello' +
           '<md-tooltip md-visible="isVisible">' +
              'Tooltip' +
          '</md-tooltip>' +
        '</md-button>'
      );

      element.triggerHandler('focus');
      $timeout.flush();

      expect($rootScope.isVisible).toBe(true);

      element.triggerHandler('blur');
      $timeout.flush();

      expect($rootScope.isVisible).toBe(false);
    }));

    it('should set visible on touchstart and touchend', inject(function($timeout) {
      buildTooltip(
        '<md-button>' +
          'Hello' +
          '<md-tooltip md-visible="isVisible">' +
            'Tooltip' +
          '</md-tooltip>' +
        '</md-button>'
      );


      element.triggerHandler('touchstart');
      $timeout.flush();

        expect($rootScope.isVisible).toBe(true);

      element.triggerHandler('touchend');
      $timeout.flush();

        expect($rootScope.isVisible).toBe(false);
    }));

    it('should not be visible on mousedown and then mouseleave', inject(function($timeout, $document) {
      jasmine.mockElementFocus(this);

      buildTooltip(
        '<md-button>' +
         'Hello' +
         '<md-tooltip md-visible="isVisible">' +
            'Tooltip' +
          '</md-tooltip>' +
        '</md-button>'
      )

      // this focus is needed to set `$document.activeElement`
      // and wouldn't be required if `document.activeElement` was settable.
      element.focus();
      element.triggerHandler('focus');
      element.triggerHandler('mousedown');
      $timeout.flush();

      expect($document.activeElement).toBe(element[0]);
      expect($rootScope.isVisible).toBe(true);

        element.triggerHandler('mouseleave');
        $timeout.flush();

      // very weak test since this is really always set to false because
      // we are not able to set `document.activeElement` to the parent
      // of `md-tooltip`. we compensate by testing `$document.activeElement`
      // which sort of mocks the behavior through `jasmine.mockElementFocus`
      // which should be replaced by a true `document.activeElement` check
      // if the problem gets fixed.
      expect($rootScope.isVisible).toBe(false);
    }));
  });


  function buildTooltip(markup) {

    element = $compile(markup)($rootScope);

    $rootScope.$apply();
    $animate.triggerCallbacks();

    return element;
  }

  function showTooltip(isVisible) {
    if (angular.isUndefined(isVisible)) isVisible = true;

    $rootScope.$apply('isVisible = ' + (isVisible ? 'true' : 'false') );
    $animate.triggerCallbacks();
  }

  function findTooltip() {
    return angular.element(document.body).find('md-tooltip');
  }


});
