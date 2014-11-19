describe('mdInkRipple diretive', function() {

  function simulateEventAt(centerX, eventType) {
    return {
      eventType: eventType,
      center: { x: centerX },
      preventDefault: angular.noop,
      srcEvent : {
        stopPropagation : angular.noop
      }
    };
  }

  beforeEach(module('material.core'));

  it('should support custom colors via md-ink-ripple', inject(function ($timeout, $compile, $rootScope) {
    var elem = $compile('<div md-ink-ripple="#bbb"></div>')($rootScope.$new()),
        container, ripple;

    expect(elem.children('.md-ripple-container').length).toBe(0);

    elem.controller('mdInkRipple').createRipple(0, 0);
    container = elem.children('.md-ripple-container');
    expect(container.length).toBe(1);

    ripple = container.children('.md-ripple');
    expect(ripple.length).toBe(1);
    expect(ripple.css('backgroundColor')).toBe('rgb(187, 187, 187)');
  }));

});
