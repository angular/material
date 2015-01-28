describe('<md-popover> directive', function () {

  beforeEach(module('material.components.popover', function($provide) {
          $provide.value('$$rAF', mockRaf);
      
          // fake synchronous version of rAF
          function mockRaf(cb) { cb(); }
          mockRaf.throttle = function(cb) {
                var context = this, args = arguments;
                return function() {
                      cb.apply(context, args);
                    };
              };
          findPopover().remove();
        }));

  function findPopover() {
    return angular.element(document.body).find('md-popover');
  }

  function findParentButton() {
    return angular.element(document.body).find('md-button');
  }

  it('should show and hide when visible is set', inject(function($compile, $rootScope, $timeout) {
    var element = $compile('<md-button>' +
               'Hello' +
               '<md-popover md-visible="isVisible">Popover</md-popover>' +
             '</md-button>')($rootScope);

    $rootScope.$apply();
    expect(findPopover().length).toBe(0);

    $rootScope.$apply('isVisible = true');
    expect(findPopover().length).toBe(1);
    expect(findPopover().hasClass('md-show')).toBe(true);
    expect(findPopover().hasClass('md-hide')).toBe(false);

    $rootScope.$apply('isVisible = false');
    expect(findPopover().hasClass('md-hide')).toBe(true);
    expect(findPopover().hasClass('md-show')).toBe(false);
    $timeout.flush();
    expect(findPopover().length).toBe(0);
  }));

  it('should describe parent', inject(function($compile, $rootScope) {
    var element = $compile('<md-button>' +
               'Hello' +
               '<md-popover md-visible="isVisible">Popover</md-popover>' +
             '</md-button>')($rootScope);

    $rootScope.$apply('isVisible = true');
    expect(element.attr('aria-describedby')).toEqual(findPopover().attr('id'));
    $rootScope.$apply('isVisible = false');
    expect(element.attr('aria-describedby')).toBeFalsy();
  }));

  it('should set visible on click and invisible on second click', inject(function($compile, $rootScope, $timeout) {
    var element = $compile('<md-button>' +
               'Hello' +
               '<md-popover md-visible="isVisible">Popover</md-popover>' +
             '</md-button>')($rootScope);

    $rootScope.$apply();

    element.triggerHandler('click');
    $timeout.flush();
    expect($rootScope.isVisible).toBe(true);

    element.triggerHandler('click');
    $timeout.flush();
    expect($rootScope.isVisible).toBe(false);
  }));

  it('should set placement to left when md-placement is set', inject(function ($compile, $rootScope, $timeout) {
    var element = $compile('<md-button>' +
                 'Hello' +
                 '<md-popover md-visible="isVisible" md-placement="placement">Popover</md-popover>' +
               '</md-button>')($rootScope);

    $rootScope.$apply('isVisible = true');
    $rootScope.$apply('placement = "left"');
    expect(findPopover().length).toBe(1);
    expect(findPopover().attr('md-placement')).toEqual('left');
  }));

  it('should set placement to right when md-placement is set', inject(function ($compile, $rootScope) {
      var element = $compile('<md-button>' +
                 'Hello' +
                 '<md-popover md-visible="isVisible" md-placement="placement">Popover</md-popover>' +
               '</md-button>')($rootScope);
               
    $rootScope.$apply('isVisible = true'); 
    $rootScope.$apply('placement = "right"');
    expect(findPopover().length).toBe(1);
    expect(findPopover().attr('md-placement')).toEqual('right');
  }));

  it('should set placement to top when md-placement is set', inject(function ($compile, $rootScope) {
      var element = $compile('<md-button>' +
                 'Hello' +
                 '<md-popover md-visible="isVisible" md-placement="placement">Popover</md-popover>' +
               '</md-button>')($rootScope);
               
    $rootScope.$apply('isVisible = true'); 
    $rootScope.$apply('placement = "top"');
    expect(findPopover().length).toBe(1);
    expect(findPopover().attr('md-placement')).toEqual('top');
  }));

  it('should set placement to bottom when md-placement is set', inject(function ($compile, $rootScope) {
      var element = $compile('<md-button>' +
                 'Hello' +
                 '<md-popover md-visible="isVisible" md-placement="placement">Popover</md-popover>' +
               '</md-button>')($rootScope);
               
    $rootScope.$apply('isVisible = true'); 
    $rootScope.$apply('placement = "bottom"');
    expect(findPopover().length).toBe(1);
    expect(findPopover().attr('md-placement')).toEqual('bottom');
  }));

  it('should set placement to bottom when md-placement is not set', inject(function ($compile, $rootScope) {
      var element = $compile('<md-button>' +
                 'Hello' +
                 '<md-popover md-visible="isVisible">Popover</md-popover>' +
               '</md-button>')($rootScope);

      $rootScope.$apply('isVisible = true');
      expect(findPopover().length).toBe(1);
      expect(findPopover().attr('md-placement')).toEqual('bottom');
  }));

  it('should expect an aria-label if element has no text', inject(function ($compile, $rootScope, $log) {
      spyOn($log, 'warn');
      var element = $compile('<md-button>' +
                 'Hello' +
                 '<md-popover md-visible="isVisible"></md-popover>' +
               '</md-button>')($rootScope);

      $rootScope.$apply('isVisible = true');
      expect($log.warn).toHaveBeenCalled();

      $log.warn.reset();
      element = $compile('<md-button>' +
           'Hello' +
           '<md-popover md-visible="isVisible">Popover</md-popover>' +
         '</md-button>')($rootScope);
      $rootScope.$apply('isVisible = true');
      expect($log.warn).not.toHaveBeenCalled();
  }));

  it('should close on escape key press and set focus to parent', inject(function (
      $compile, $rootScope, $rootElement, $timeout, $mdConstant, $document) {

      TestUtil.mockElementFocus(this);

      var element = $compile('<md-button id="focus-target">' +
                              '<md-popover md-visible="isVisible" id="popover">Popover</md-popover>' +
                              '</md-button>')($rootScope);

      $rootScope.$apply();

      element.triggerHandler('click');
      $timeout.flush();
      expect($rootScope.isVisible).toBe(true);
      expect($document.activeElement.id).toBe("popover");

      $rootElement.triggerHandler({
          type: 'keyup',
          keyCode: $mdConstant.KEY_CODE.ESCAPE
      });

      $rootScope.$apply();
      $timeout.flush();
      expect($rootScope.isVisible).toBe(false);
      expect($document.activeElement.id).toBe("focus-target");
  }));

  it('should not close on A keyup', inject(function (
      $compile, $rootScope, $rootElement, $timeout, $mdConstant, $document) {

      TestUtil.mockElementFocus(this);

      var element = $compile('<md-button>' +
                 'Hello' +
                 '<md-popover md-visible="isVisible" id="focus-target">Popover</md-popover>' +
               '</md-button>')($rootScope);

      $rootScope.$apply();

      element.triggerHandler('click');
      $timeout.flush();
      expect($rootScope.isVisible).toBe(true);
      expect($document.activeElement.id).toBe("focus-target");

      $rootElement.triggerHandler({
          type: 'keyup',
          keyCode: $mdConstant.KEY_CODE.A
      });

      $rootScope.$apply();
      expect($rootScope.isVisible).toBe(true);
      expect($document.activeElement.id).toBe("focus-target");
  }));
});