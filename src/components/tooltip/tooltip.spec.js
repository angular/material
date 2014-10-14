describe('<md-tooltip> directive', function() {

  beforeEach(module('material.components.tooltip', function($provide) {
    $provide.value('$$rAF', mockRaf);

    // fake synchronous version of rAF
    function mockRaf(cb) { cb(); }
    mockRaf.debounce = function(cb) {
      var context = this, args = arguments;
      return function() {
        cb.apply(context, args);
      };
    };
    findTooltip().remove();
  }));

  function findTooltip() {
    return angular.element(document.body).find('md-tooltip');
  }

  it('should show and hide when visible is set', inject(function($compile, $rootScope, $timeout) {
    var element = $compile('<md-button>' +
               'Hello' +
               '<md-tooltip visible="isVisible">Tooltip</md-tooltip>' +
             '</md-button>')($rootScope);

    $rootScope.$apply();
    expect(findTooltip().length).toBe(0);

    $rootScope.$apply('isVisible = true');
    expect(findTooltip().length).toBe(1);
    expect(findTooltip().hasClass('tooltip-show')).toBe(true);
    expect(findTooltip().hasClass('tooltip-hide')).toBe(false);

    $rootScope.$apply('isVisible = false');
    expect(findTooltip().hasClass('tooltip-hide')).toBe(true);
    expect(findTooltip().hasClass('tooltip-show')).toBe(false);
    $timeout.flush();
    expect(findTooltip().length).toBe(0);
  }));

  it('should describe parent', inject(function($compile, $rootScope, $timeout) {
    var element = $compile('<md-button>' +
               'Hello' +
               '<md-tooltip visible="isVisible">Tooltip</md-tooltip>' +
             '</md-button>')($rootScope);

    $rootScope.$apply('isVisible = true');

    expect(element.attr('aria-describedby')).toEqual(findTooltip().attr('id'));

    $rootScope.$apply('isVisible = false');
    expect(element.attr('aria-describedby')).toBeFalsy();

  }));

  it('should set visible on mouseenter and mouseleave', inject(function($compile, $rootScope, $timeout) {
    var element = $compile('<md-button>' +
               'Hello' +
               '<md-tooltip visible="isVisible">Tooltip</md-tooltip>' +
             '</md-button>')($rootScope);

    $rootScope.$apply();

    element.triggerHandler('mouseenter');
    $timeout.flush();
    expect($rootScope.isVisible).toBe(true);

    element.triggerHandler('mouseleave');
    $timeout.flush();
    expect($rootScope.isVisible).toBe(false);
  }));

  it('should set visible on focus and blur', inject(function($compile, $rootScope, $timeout) {
    var element = $compile('<md-button>' +
               'Hello' +
               '<md-tooltip visible="isVisible">Tooltip</md-tooltip>' +
             '</md-button>')($rootScope);

    $rootScope.$apply();

    element.triggerHandler('focus');
    $timeout.flush();
    expect($rootScope.isVisible).toBe(true);

    element.triggerHandler('blur');
    $timeout.flush();
    expect($rootScope.isVisible).toBe(false);
  }));

  it('should set visible on touchstart and touchend', inject(function($compile, $rootScope, $timeout) {
    var element = $compile('<md-button>' +
               'Hello' +
               '<md-tooltip visible="isVisible">Tooltip</md-tooltip>' +
             '</md-button>')($rootScope);

    $rootScope.$apply();

    element.triggerHandler('touchstart');
    $timeout.flush();
    expect($rootScope.isVisible).toBe(true);

    element.triggerHandler('touchend');
    $timeout.flush();
    expect($rootScope.isVisible).toBe(false);
  }));

});
