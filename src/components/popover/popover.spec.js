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
});
