describe('mdInkRipple directive', function() {

  beforeEach(module('material.core'));

  describe('with string values', function () {
    it('should support custom colors', inject(function ($compile, $rootScope) {
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

    it('should support true', inject(function ($compile, $rootScope) {
      var elem = $compile('<div md-ink-ripple="true"></div>')($rootScope.$new()),
        container, ripple;

      expect(elem.children('.md-ripple-container').length).toBe(0);

      elem.controller('mdInkRipple').createRipple(0, 0);
      container = elem.children('.md-ripple-container');
      expect(container.length).toBe(1);

      ripple = container.children('.md-ripple');
      expect(ripple.length).toBe(1);
      expect(ripple.css('backgroundColor')).toBe('rgb(0, 0, 0)');
    }));

    it('should support false', inject(function ($compile, $rootScope) {
      var elem = $compile('<div md-ink-ripple="false"></div>')($rootScope.$new()),
        container, ripple;

      expect(elem.children('.md-ripple-container').length).toBe(0);

      elem.controller('mdInkRipple').createRipple(0, 0);
      container = elem.children('.md-ripple-container');
      expect(container.length).toBe(0);

      ripple = container.children('.md-ripple');
      expect(ripple.length).toBe(0);
    }));
  });

  describe('with interpolated false values', function () {
    it('should not ripple with \'false\'', inject(function ($compile, $rootScope) {
      var scope = $rootScope.$new();
      scope.value = false;

      var elem = $compile('<div md-ink-ripple="{{value}}"></div>')(scope),
        container, ripple;

      scope.$apply();

      expect(elem.children('.md-ripple-container').length).toBe(0);

      elem.controller('mdInkRipple').createRipple(0, 0);
      container = elem.children('.md-ripple-container');
      expect(container.length).toBe(0);

      ripple = container.children('.md-ripple');
      expect(ripple.length).toBe(0);
    }));

    it('should not ripple with \'0\'', inject(function ($compile, $rootScope) {
      var scope = $rootScope.$new();
      scope.value = 0;

      var elem = $compile('<div md-ink-ripple="{{value}}"></div>')(scope),
        container, ripple;

      scope.$apply();

      expect(elem.children('.md-ripple-container').length).toBe(0);

      elem.controller('mdInkRipple').createRipple(0, 0);
      container = elem.children('.md-ripple-container');
      expect(container.length).toBe(0);

      ripple = container.children('.md-ripple');
      expect(ripple.length).toBe(0);
    }));
  });

  describe('with interpolated color values', function () {
    it('should create a ripple', inject(function ($compile, $rootScope) {
      var scope = $rootScope.$new();
      scope.value = '#FF0000';

      var elem = $compile('<div md-ink-ripple="{{value}}"></div>')(scope),
        container, ripple;

      scope.$apply();

      expect(elem.children('.md-ripple-container').length).toBe(0);

      var controller = elem.controller('mdInkRipple');

      controller.createRipple(0, 0);
      container = elem.children('.md-ripple-container');
      expect(container.length).toBe(1);

      ripple = container.children('.md-ripple');
      expect(ripple.length).toBe(1);
      expect(ripple.css('backgroundColor')).toBe('rgb(255, 0, 0)');
    }));
  });

  describe('with css color', function () {
    it('should create a ripple', inject(function ($compile, $rootScope, $window) {
      spyOn($window, 'getComputedStyle').and.callFake(function() {
        return { color: '#FF0000' };
      });

      var elem = $compile('<div style="color: #FF0000" md-ink-ripple></div>')($rootScope.$new()),
        container, ripple;

      expect(elem.children('.md-ripple-container').length).toBe(0);

      var controller = elem.controller('mdInkRipple');

      controller.createRipple(0, 0);
      container = elem.children('.md-ripple-container');
      expect(container.length).toBe(1);

      ripple = container.children('.md-ripple');
      expect(ripple.length).toBe(1);
      expect(ripple[0].style.backgroundColor).toBe('rgb(255, 0, 0)');
    }));
  });
});
