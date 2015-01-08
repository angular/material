describe('<md-popover> directive', function() {

  beforeEach(module('material.components.popover', function($provide) {
    $provide.value('$$rAF', mockRaf);

    // fake synchronous version of rAF
    function mockRaf(cb) { cb(); }
    mockRaf.debounce = function(cb) {
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

  it('should describe parent', inject(function($compile, $rootScope, $timeout) {
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

  /*
  it('should set placement to left when md-placement is set', inject(function ($compile, $rootScope, $timeout) {
      var element = $compile('<md-button>' +
                 'Hello' +
                 '<md-popover md-visible="isVisible" md-placement="placement">Popover</md-popover>' +
               '</md-button>')($rootScope);

    $rootScope.$apply('isVisible = true');
    $rootScope.$apply('placement = left');
    expect(findPopover().length).toBe(1);
    expect(findPopover().attr('md-placement')).toEqual('left');
  }));

  it('should set placement to right when md-placement is set', inject(function ($compile, $rootScope, $timeout) {
      var element = $compile('<md-button>' +
                 'Hello' +
                 '<md-popover md-visible="isVisible" md-placement="right">Popover</md-popover>' +
               '</md-button>')($rootScope);
               
    $rootScope.$apply('isVisible = true'); 
    $rootScope.$apply('placement = right');
    expect(findPopover().length).toBe(1);
    expect(findPopover().attr('md-placement')).toEqual('right');
  }));

  it('should set placement to top when md-placement is set', inject(function ($compile, $rootScope, $timeout) {
      var element = $compile('<md-button>' +
                 'Hello' +
                 '<md-popover md-visible="isVisible" md-placement="top">Popover</md-popover>' +
               '</md-button>')($rootScope);
               
    $rootScope.$apply('isVisible = true'); 
    $rootScope.$apply('placement = top');
    expect(findPopover().length).toBe(1);
    expect(findPopover().attr('md-placement')).toEqual('top');
  }));
  */

  it('should set placement to bottom when md-placement is set', inject(function ($compile, $rootScope, $timeout) {
      var element = $compile('<md-button>' +
                 'Hello' +
                 '<md-popover md-visible="isVisible" md-placement="bottom">Popover</md-popover>' +
               '</md-button>')($rootScope);
               
    $rootScope.$apply('isVisible = true'); 
    $rootScope.$apply('placement = bottom');
    expect(findPopover().length).toBe(1);
    expect(findPopover().attr('md-placement')).toEqual('bottom');
  }));

  it('should set placement to bottom when md-placement is not set', inject(function ($compile, $rootScope, $timeout) {
      var element = $compile('<md-button>' +
                 'Hello' +
                 '<md-popover md-visible="isVisible">Popover</md-popover>' +
               '</md-button>')($rootScope);

      $rootScope.$apply('isVisible = true');
      expect(findPopover().length).toBe(1);
      expect(findPopover().attr('md-placement')).toEqual('bottom');
  }));
});